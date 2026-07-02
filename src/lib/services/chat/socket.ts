/**
 * Chat WebSocket client.
 *
 * Connects to the chat service at config.chatWsUrl (a relative /chat/ws path,
 * proxied to chat:8082 by Vite in dev and Caddy in prod). Handles auth via
 * ?token=, heartbeat ping, and exponential-backoff reconnect. Message parsing
 * is left to subscribers via on().
 */

import { get } from 'svelte/store';
import { browser } from '$app/environment';
import { auth } from '$lib/stores/auth';
import { config } from '$lib/constants/config';

export interface ChatServerMessage {
	type: string;
	[key: string]: unknown;
}

type Handler = (msg: ChatServerMessage) => void;

function absoluteWsUrl(): string {
	const base = config.chatWsUrl;
	if (base.startsWith('ws://') || base.startsWith('wss://')) return base;
	const proto = location.protocol === 'https:' ? 'wss' : 'ws';
	return `${proto}://${location.host}${base}`;
}

export function createChatSocket() {
	let socket: WebSocket | null = null;
	const handlers = new Set<Handler>();
	let reconnectAttempts = 0;
	let manualClose = false;
	let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

	function clearTimers() {
		if (heartbeatTimer) clearInterval(heartbeatTimer);
		if (reconnectTimer) clearTimeout(reconnectTimer);
		heartbeatTimer = null;
		reconnectTimer = null;
	}

	function connect() {
		if (!browser) return;
		const token = get(auth).token;
		if (!token) return;

		manualClose = false;
		socket = new WebSocket(`${absoluteWsUrl()}?token=${encodeURIComponent(token)}`);

		socket.onopen = () => {
			reconnectAttempts = 0;
			heartbeatTimer = setInterval(() => {
				if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'Ping' }));
			}, 30000);
		};

		socket.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data) as ChatServerMessage;
				handlers.forEach((h) => h(msg));
			} catch {
				/* ignore malformed frames */
			}
		};

		socket.onclose = () => {
			clearTimers();
			if (!manualClose) scheduleReconnect();
		};

		socket.onerror = () => {
			/* onclose handles reconnect */
		};
	}

	function scheduleReconnect() {
		if (reconnectAttempts >= 10) return;
		const delay = Math.min(30000, 1000 * Math.pow(1.5, reconnectAttempts));
		reconnectAttempts += 1;
		reconnectTimer = setTimeout(connect, delay);
	}

	function disconnect() {
		manualClose = true;
		clearTimers();
		socket?.close(1000, 'client disconnect');
		socket = null;
	}

	function send(payload: unknown): boolean {
		if (socket?.readyState !== WebSocket.OPEN) return false;
		socket.send(JSON.stringify(payload));
		return true;
	}

	function on(handler: Handler): () => void {
		handlers.add(handler);
		return () => handlers.delete(handler);
	}

	return { connect, disconnect, send, on };
}

export type ChatSocket = ReturnType<typeof createChatSocket>;
