import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { notifications } from '$lib/stores/notifications';
import { auth } from '$lib/stores/auth';
import { pushNotificationService } from './push-notification';
import type { NotificationType } from '$lib/types';

// WebSocket 連線狀態
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// WebSocket 訊息類型
export interface WebSocketMessage<T = unknown> {
	type: string;
	payload: T;
	timestamp?: string;
}

// 通知訊息 payload（前端內部使用格式）
export interface NotificationPayload {
	type: 'info' | 'success' | 'warning' | 'error';
	title: string;
	message: string;
	link?: string;
	/** 通知類別（用於判斷是否符合使用者偏好設定） */
	category?: NotificationType;
	/** 是否為緊急通知（靜音時段內仍會顯示） */
	urgent?: boolean;
}

// 後端 Notification Service 發送的格式
export interface ServerNotificationEvent {
	id: string;
	occurred_at: string;
	event_type: string;
	payload: {
		type?: 'info' | 'success' | 'warning' | 'error';
		title?: string;
		message?: string;
		link?: string;
		category?: NotificationType;
		urgent?: boolean;
		[key: string]: unknown;
	};
	metadata: {
		source: string;
		priority: 'Low' | 'Normal' | 'High' | 'Critical';
		ttl?: number;
		correlation_id?: string;
	};
}

// WebSocket 配置
export interface WebSocketConfig {
	url: string;
	reconnectInterval?: number;
	maxReconnectAttempts?: number;
	heartbeatInterval?: number;
	heartbeatTimeout?: number;
	debug?: boolean;
}

// 預設配置
const DEFAULT_CONFIG: Required<Omit<WebSocketConfig, 'url'>> = {
	reconnectInterval: 3000,
	maxReconnectAttempts: 10,
	heartbeatInterval: 30000,
	heartbeatTimeout: 5000,
	debug: false
};

// 訊息處理器類型
type MessageHandler<T = unknown> = (payload: T, message: WebSocketMessage<T>) => void;

interface WebSocketState {
	status: WebSocketStatus;
	reconnectAttempts: number;
	lastConnectedAt: string | null;
	lastError: string | null;
}

function createWebSocketService() {
	let socket: WebSocket | null = null;
	let config: Required<WebSocketConfig> | null = null;
	let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
	let heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	let manualClose = false;

	// 訊息處理器映射
	const handlers = new Map<string, Set<MessageHandler>>();

	// 狀態 store
	const state = writable<WebSocketState>({
		status: 'disconnected',
		reconnectAttempts: 0,
		lastConnectedAt: null,
		lastError: null
	});

	// 衍生狀態
	const status = derived(state, ($state) => $state.status);
	const isConnected = derived(state, ($state) => $state.status === 'connected');
	const reconnectAttempts = derived(state, ($state) => $state.reconnectAttempts);

	function log(...args: unknown[]) {
		if (config?.debug) {
			console.log('[WebSocket]', ...args);
		}
	}

	function updateState(partial: Partial<WebSocketState>) {
		state.update((s) => ({ ...s, ...partial }));
	}

	function clearTimers() {
		if (heartbeatTimer) {
			clearInterval(heartbeatTimer);
			heartbeatTimer = null;
		}
		if (heartbeatTimeoutTimer) {
			clearTimeout(heartbeatTimeoutTimer);
			heartbeatTimeoutTimer = null;
		}
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}
	}

	function startHeartbeat() {
		if (!config) return;

		const { heartbeatInterval, heartbeatTimeout } = config;

		heartbeatTimer = setInterval(() => {
			if (socket?.readyState === WebSocket.OPEN) {
				log('Sending heartbeat ping');
				// Notification service 期望格式: {"type": "Ping"}
				socket.send(JSON.stringify({ type: 'Ping' }));

				// 設置心跳超時
				heartbeatTimeoutTimer = setTimeout(() => {
					log('Heartbeat timeout, reconnecting...');
					reconnect();
				}, heartbeatTimeout);
			}
		}, heartbeatInterval);
	}

	function handlePong() {
		if (heartbeatTimeoutTimer) {
			clearTimeout(heartbeatTimeoutTimer);
			heartbeatTimeoutTimer = null;
		}
		log('Received heartbeat pong');
	}

	function connect(wsConfig: WebSocketConfig): void {
		if (!browser) return;

		// 合併配置
		config = { ...DEFAULT_CONFIG, ...wsConfig };
		manualClose = false;

		// 如果已連線，先關閉
		if (socket) {
			socket.close();
		}

		log('Connecting to', config.url);
		updateState({ status: 'connecting', lastError: null });

		try {
			// 建立 WebSocket 連線，附帶認證 token
			const authState = get(auth);
			const token = authState.token;
			const url = token ? `${config.url}?token=${encodeURIComponent(token)}` : config.url;

			socket = new WebSocket(url);

			socket.onopen = handleOpen;
			socket.onclose = handleClose;
			socket.onerror = handleError;
			socket.onmessage = handleMessage;
		} catch (error) {
			log('Connection error:', error);
			updateState({
				status: 'error',
				lastError: error instanceof Error ? error.message : 'Connection failed'
			});
			scheduleReconnect();
		}
	}

	function handleOpen() {
		log('Connected');
		updateState({
			status: 'connected',
			reconnectAttempts: 0,
			lastConnectedAt: new Date().toISOString(),
			lastError: null
		});

		// 啟動心跳
		startHeartbeat();

		// 觸發連線事件
		emit('connected', null);
	}

	function handleClose(event: CloseEvent) {
		log('Disconnected:', event.code, event.reason);
		clearTimers();

		if (!manualClose) {
			updateState({ status: 'disconnected' });
			scheduleReconnect();
		} else {
			updateState({ status: 'disconnected' });
		}

		// 觸發斷線事件
		emit('disconnected', { code: event.code, reason: event.reason });
	}

	function handleError(event: Event) {
		log('Error:', event);
		updateState({
			status: 'error',
			lastError: 'WebSocket error occurred'
		});
	}

	function handleMessage(event: MessageEvent) {
		try {
			const message = JSON.parse(event.data);
			log('Received:', message.type, message);

			// 處理心跳回應
			if (message.type === 'pong') {
				handlePong();
				return;
			}

			// 處理通知訊息（後端格式：type + flatten NotificationEvent）
			if (message.type === 'notification') {
				handleServerNotification(message as { type: 'notification' } & ServerNotificationEvent);
			}

			// 觸發訊息處理器
			emit(message.type, message.payload ?? message, message);
		} catch (error) {
			log('Failed to parse message:', event.data, error);
		}
	}

	/**
	 * 處理後端 Notification Service 發送的通知
	 * 將 ServerNotificationEvent 格式轉換為前端 NotificationPayload 格式
	 */
	function handleServerNotification(event: { type: 'notification' } & ServerNotificationEvent) {
		// 從後端 payload 中提取通知內容，或使用預設值
		const payload = event.payload || {};

		// 根據 priority 決定通知類型
		const priorityToType: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
			Low: 'info',
			Normal: 'info',
			High: 'warning',
			Critical: 'error'
		};

		const notificationType = payload.type || priorityToType[event.metadata?.priority] || 'info';
		const title = payload.title || event.event_type || '系統通知';
		const message = payload.message || (typeof payload === 'object' ? JSON.stringify(payload) : String(payload));

		// 1. 添加到通知中心
		notifications.add(
			{
				type: notificationType,
				title,
				message,
				link: payload.link
			},
			{ source: 'remote' }
		);

		// 2. 觸發即時推送（Toast、瀏覽器通知、音效）
		pushNotificationService.push({
			type: notificationType,
			title,
			message,
			link: payload.link,
			category: payload.category,
			urgent: payload.urgent || event.metadata?.priority === 'Critical'
		});
	}

	function scheduleReconnect() {
		if (!config || manualClose) return;

		const currentState = get(state);
		if (currentState.reconnectAttempts >= config.maxReconnectAttempts) {
			log('Max reconnect attempts reached');
			updateState({
				status: 'error',
				lastError: 'Max reconnect attempts reached'
			});
			return;
		}

		const delay = config.reconnectInterval * Math.pow(1.5, currentState.reconnectAttempts);
		log(`Scheduling reconnect in ${delay}ms (attempt ${currentState.reconnectAttempts + 1})`);

		updateState({
			status: 'reconnecting',
			reconnectAttempts: currentState.reconnectAttempts + 1
		});

		reconnectTimer = setTimeout(() => {
			if (config) {
				connect(config);
			}
		}, delay);
	}

	function reconnect() {
		if (!config) return;

		clearTimers();
		if (socket) {
			socket.close();
		}
		scheduleReconnect();
	}

	function disconnect() {
		log('Disconnecting');
		manualClose = true;
		clearTimers();

		if (socket) {
			socket.close(1000, 'Client disconnect');
			socket = null;
		}

		updateState({
			status: 'disconnected',
			reconnectAttempts: 0
		});
	}

	function send<T>(message: WebSocketMessage<T>): boolean {
		if (!socket || socket.readyState !== WebSocket.OPEN) {
			log('Cannot send, socket not connected');
			return false;
		}

		try {
			// 發送原始訊息，不添加額外字段（notification service 使用 tagged enum）
			const data = JSON.stringify(message);
			socket.send(data);
			log('Sent:', message.type);
			return true;
		} catch (error) {
			log('Send error:', error);
			return false;
		}
	}

	function on<T = unknown>(type: string, handler: MessageHandler<T>): () => void {
		if (!handlers.has(type)) {
			handlers.set(type, new Set());
		}
		handlers.get(type)!.add(handler as MessageHandler);

		// 返回取消訂閱函數
		return () => {
			handlers.get(type)?.delete(handler as MessageHandler);
		};
	}

	function off<T = unknown>(type: string, handler?: MessageHandler<T>): void {
		if (handler) {
			handlers.get(type)?.delete(handler as MessageHandler);
		} else {
			handlers.delete(type);
		}
	}

	function emit<T>(type: string, payload: T, message?: WebSocketMessage<T>): void {
		const typeHandlers = handlers.get(type);
		if (typeHandlers) {
			const msg = message || { type, payload, timestamp: new Date().toISOString() };
			typeHandlers.forEach((handler) => {
				try {
					handler(payload, msg);
				} catch (error) {
					log('Handler error:', error);
				}
			});
		}

		// 也觸發 '*' 通配符處理器
		const wildcardHandlers = handlers.get('*');
		if (wildcardHandlers) {
			const msg = message || { type, payload, timestamp: new Date().toISOString() };
			wildcardHandlers.forEach((handler) => {
				try {
					handler(payload, msg);
				} catch (error) {
					log('Wildcard handler error:', error);
				}
			});
		}
	}

	return {
		// 狀態
		state: { subscribe: state.subscribe },
		status: { subscribe: status.subscribe },
		isConnected: { subscribe: isConnected.subscribe },
		reconnectAttempts: { subscribe: reconnectAttempts.subscribe },

		// 連線管理
		connect,
		disconnect,
		reconnect,

		// 訊息
		send,

		// 事件處理
		on,
		off,

		// 工具方法
		getSocket: () => socket,
		isSocketOpen: () => socket?.readyState === WebSocket.OPEN
	};
}

// 單例導出
export const websocket = createWebSocketService();

// 便捷方法：初始化 WebSocket 連線
export function initWebSocket(url?: string): void {
	const wsUrl = url || import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
	websocket.connect({
		url: wsUrl,
		debug: import.meta.env.DEV
	});
}

// 便捷方法：關閉 WebSocket 連線
export function closeWebSocket(): void {
	websocket.disconnect();
}
