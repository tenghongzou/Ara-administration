import { writable, derived, get } from 'svelte/store';
import { generateUUID } from '$lib/utils';

export interface Notification {
	id: string;
	type: 'info' | 'success' | 'warning' | 'error';
	title: string;
	message: string;
	read: boolean;
	timestamp: string;
	link?: string;
	/** 來源：local (本地) | remote (WebSocket) */
	source?: 'local' | 'remote';
}

interface NotificationsState {
	items: Notification[];
	isOpen: boolean;
	/** 是否已從伺服器載入歷史通知 */
	initialized: boolean;
}

function createNotificationsStore() {
	const { subscribe, update, set } = writable<NotificationsState>({
		items: [],
		isOpen: false,
		initialized: false
	});

	return {
		subscribe,

		// UI 狀態管理
		toggle: () => {
			update((state) => ({ ...state, isOpen: !state.isOpen }));
		},

		open: () => {
			update((state) => ({ ...state, isOpen: true }));
		},

		close: () => {
			update((state) => ({ ...state, isOpen: false }));
		},

		// 通知操作
		markAsRead: (id: string) => {
			update((state) => ({
				...state,
				items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item))
			}));
		},

		markAllAsRead: () => {
			update((state) => ({
				...state,
				items: state.items.map((item) => ({ ...item, read: true }))
			}));
		},

		remove: (id: string) => {
			update((state) => ({
				...state,
				items: state.items.filter((item) => item.id !== id)
			}));
		},

		add: (
			notification: Omit<Notification, 'id' | 'timestamp' | 'read'>,
			options?: { source?: 'local' | 'remote' }
		) => {
			const newNotification: Notification = {
				...notification,
				id: generateUUID(),
				timestamp: new Date().toISOString(),
				read: false,
				source: options?.source || 'local'
			};
			update((state) => ({
				...state,
				items: [newNotification, ...state.items]
			}));
			return newNotification;
		},

		clear: () => {
			update((state) => ({ ...state, items: [] }));
		},

		// WebSocket 整合方法
		/**
		 * 從伺服器載入歷史通知（批量設定）
		 */
		setItems: (items: Notification[]) => {
			update((state) => ({
				...state,
				items: items.map((item) => ({ ...item, source: 'remote' as const })),
				initialized: true
			}));
		},

		/**
		 * 追加多筆通知（保留現有）
		 */
		addItems: (items: Notification[]) => {
			update((state) => {
				const existingIds = new Set(state.items.map((item) => item.id));
				const newItems = items
					.filter((item) => !existingIds.has(item.id))
					.map((item) => ({ ...item, source: 'remote' as const }));
				return {
					...state,
					items: [...newItems, ...state.items]
				};
			});
		},

		/**
		 * 透過 ID 更新單筆通知
		 */
		updateItem: (id: string, updates: Partial<Notification>) => {
			update((state) => ({
				...state,
				items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item))
			}));
		},

		/**
		 * 重設為初始狀態
		 */
		reset: () => {
			set({
				items: [],
				isOpen: false,
				initialized: false
			});
		},

		/**
		 * 取得目前狀態快照
		 */
		getState: () => get({ subscribe })
	};
}

export const notifications = createNotificationsStore();

export const unreadCount = derived(
	notifications,
	($notifications) => $notifications.items.filter((n) => !n.read).length
);
