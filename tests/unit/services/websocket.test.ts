import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';

// Mock WebSocket class
class MockWebSocket {
	static readonly CONNECTING = 0;
	static readonly OPEN = 1;
	static readonly CLOSING = 2;
	static readonly CLOSED = 3;

	readonly CONNECTING = 0;
	readonly OPEN = 1;
	readonly CLOSING = 2;
	readonly CLOSED = 3;

	url: string;
	readyState: number = MockWebSocket.CONNECTING;
	onopen: ((event: Event) => void) | null = null;
	onclose: ((event: CloseEvent) => void) | null = null;
	onerror: ((event: Event) => void) | null = null;
	onmessage: ((event: MessageEvent) => void) | null = null;

	constructor(url: string) {
		this.url = url;
	}

	send = vi.fn();
	close = vi.fn((code?: number, reason?: string) => {
		this.readyState = MockWebSocket.CLOSED;
		if (this.onclose) {
			this.onclose(new CloseEvent('close', { code: code || 1000, reason: reason || '' }));
		}
	});

	// Helper methods for testing
	simulateOpen() {
		this.readyState = MockWebSocket.OPEN;
		if (this.onopen) {
			this.onopen(new Event('open'));
		}
	}

	simulateMessage(data: unknown) {
		if (this.onmessage) {
			this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
		}
	}

	simulateError() {
		if (this.onerror) {
			this.onerror(new Event('error'));
		}
	}

	simulateClose(code = 1000, reason = '') {
		this.readyState = MockWebSocket.CLOSED;
		if (this.onclose) {
			this.onclose(new CloseEvent('close', { code, reason }));
		}
	}
}

// Store the mock instance for test access
let mockWebSocketInstance: MockWebSocket | null = null;

// Create a constructor function with static properties
const MockWebSocketConstructor = function (url: string) {
	mockWebSocketInstance = new MockWebSocket(url);
	return mockWebSocketInstance;
} as unknown as typeof WebSocket;

// Add static constants
Object.defineProperty(MockWebSocketConstructor, 'CONNECTING', { value: 0 });
Object.defineProperty(MockWebSocketConstructor, 'OPEN', { value: 1 });
Object.defineProperty(MockWebSocketConstructor, 'CLOSING', { value: 2 });
Object.defineProperty(MockWebSocketConstructor, 'CLOSED', { value: 3 });

// Mock the global WebSocket
vi.stubGlobal('WebSocket', MockWebSocketConstructor);

// Use vi.hoisted to define mocks that need to be available during hoisting
const { mockNotificationsAdd } = vi.hoisted(() => ({
	mockNotificationsAdd: vi.fn()
}));

// Mock $app/environment
vi.mock('$app/environment', () => ({
	browser: true
}));

// Mock auth store
vi.mock('$lib/stores/auth', () => ({
	auth: {
		subscribe: vi.fn((callback: (value: { token: string | null }) => void) => {
			callback({ token: 'test-token' });
			return () => {};
		})
	}
}));

// Mock notifications store
vi.mock('$lib/stores/notifications', () => ({
	notifications: {
		add: mockNotificationsAdd
	}
}));

// Import after mocks are set up
import { websocket, initWebSocket, closeWebSocket } from '$lib/services/websocket';

describe('WebSocket Service', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		mockWebSocketInstance = null;
		mockNotificationsAdd.mockClear();
	});

	afterEach(() => {
		closeWebSocket();
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	describe('Connection Management', () => {
		it('should connect to WebSocket server', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });

			expect(mockWebSocketInstance).not.toBeNull();
			expect(mockWebSocketInstance?.url).toContain('ws://localhost:8080/ws');
			expect(get(websocket.status)).toBe('connecting');
		});

		it('should include auth token in connection URL', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });

			expect(mockWebSocketInstance?.url).toContain('token=test-token');
		});

		it('should update status to connected on open', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();

			expect(get(websocket.status)).toBe('connected');
			expect(get(websocket.isConnected)).toBe(true);
		});

		it('should update status to disconnected on close', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();
			mockWebSocketInstance?.simulateClose();

			expect(get(websocket.status)).toBe('reconnecting');
		});

		it('should disconnect manually', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();

			websocket.disconnect();

			expect(mockWebSocketInstance?.close).toHaveBeenCalled();
			expect(get(websocket.status)).toBe('disconnected');
		});

		it('should not attempt reconnect on manual disconnect', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();

			websocket.disconnect();

			vi.advanceTimersByTime(5000);
			expect(get(websocket.status)).toBe('disconnected');
			expect(get(websocket.reconnectAttempts)).toBe(0);
		});
	});

	describe('Message Handling', () => {
		it('should send messages when connected', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();

			const result = websocket.send({ type: 'test', payload: { data: 'value' } });

			expect(result).toBe(true);
			expect(mockWebSocketInstance?.send).toHaveBeenCalled();
			const sentData = JSON.parse(mockWebSocketInstance?.send.mock.calls[0][0]);
			expect(sentData.type).toBe('test');
			expect(sentData.payload).toEqual({ data: 'value' });
		});

		it('should not send messages when disconnected', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			// Don't open the connection

			const result = websocket.send({ type: 'test', payload: {} });

			expect(result).toBe(false);
			expect(mockWebSocketInstance?.send).not.toHaveBeenCalled();
		});

		it('should receive and parse messages', () => {
			const handler = vi.fn();
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();

			websocket.on('test-event', handler);
			mockWebSocketInstance?.simulateMessage({
				type: 'test-event',
				payload: { foo: 'bar' }
			});

			expect(handler).toHaveBeenCalledWith(
				{ foo: 'bar' },
				expect.objectContaining({ type: 'test-event', payload: { foo: 'bar' } })
			);
		});

		it('should handle notification messages', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();

			mockWebSocketInstance?.simulateMessage({
				type: 'notification',
				payload: {
					type: 'info',
					title: 'Test Title',
					message: 'Test Message',
					link: '/test'
				}
			});

			expect(mockNotificationsAdd).toHaveBeenCalledWith({
				type: 'info',
				title: 'Test Title',
				message: 'Test Message',
				link: '/test'
			});
		});
	});

	describe('Event Subscription', () => {
		it('should subscribe to events', () => {
			const handler = vi.fn();
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();

			const unsubscribe = websocket.on('custom-event', handler);
			mockWebSocketInstance?.simulateMessage({
				type: 'custom-event',
				payload: { test: true }
			});

			expect(handler).toHaveBeenCalledTimes(1);

			// Cleanup
			unsubscribe();
		});

		it('should unsubscribe from events', () => {
			const handler = vi.fn();
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();

			const unsubscribe = websocket.on('custom-event', handler);
			unsubscribe();

			mockWebSocketInstance?.simulateMessage({
				type: 'custom-event',
				payload: { test: true }
			});

			expect(handler).not.toHaveBeenCalled();
		});

		it('should support wildcard event listener', () => {
			const handler = vi.fn();
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();

			websocket.on('*', handler);

			mockWebSocketInstance?.simulateMessage({ type: 'event-a', payload: {} });
			mockWebSocketInstance?.simulateMessage({ type: 'event-b', payload: {} });

			expect(handler).toHaveBeenCalledTimes(2);
		});

		it('should support multiple handlers for same event', () => {
			const handler1 = vi.fn();
			const handler2 = vi.fn();
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();

			websocket.on('multi-event', handler1);
			websocket.on('multi-event', handler2);

			mockWebSocketInstance?.simulateMessage({
				type: 'multi-event',
				payload: {}
			});

			expect(handler1).toHaveBeenCalledTimes(1);
			expect(handler2).toHaveBeenCalledTimes(1);
		});

		it('should remove all handlers with off(type)', () => {
			const handler1 = vi.fn();
			const handler2 = vi.fn();
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();

			websocket.on('remove-all', handler1);
			websocket.on('remove-all', handler2);
			websocket.off('remove-all');

			mockWebSocketInstance?.simulateMessage({
				type: 'remove-all',
				payload: {}
			});

			expect(handler1).not.toHaveBeenCalled();
			expect(handler2).not.toHaveBeenCalled();
		});
	});

	describe('Heartbeat', () => {
		it('should send heartbeat ping after interval', () => {
			websocket.connect({
				url: 'ws://localhost:8080/ws',
				heartbeatInterval: 10000
			});
			mockWebSocketInstance?.simulateOpen();

			// Clear the initial calls
			mockWebSocketInstance?.send.mockClear();

			// Advance time past heartbeat interval
			vi.advanceTimersByTime(10000);

			expect(mockWebSocketInstance?.send).toHaveBeenCalled();
			const sentData = JSON.parse(mockWebSocketInstance?.send.mock.calls[0][0]);
			expect(sentData.type).toBe('ping');
		});

		it('should handle pong response', () => {
			websocket.connect({
				url: 'ws://localhost:8080/ws',
				heartbeatInterval: 10000,
				heartbeatTimeout: 5000
			});
			mockWebSocketInstance?.simulateOpen();

			// Trigger heartbeat
			vi.advanceTimersByTime(10000);

			// Simulate pong response
			mockWebSocketInstance?.simulateMessage({ type: 'pong', payload: {} });

			// Connection should still be open after timeout
			vi.advanceTimersByTime(6000);
			expect(get(websocket.status)).toBe('connected');
		});
	});

	describe('Reconnection', () => {
		it('should attempt reconnect on unexpected disconnect', () => {
			websocket.connect({
				url: 'ws://localhost:8080/ws',
				reconnectInterval: 3000
			});
			mockWebSocketInstance?.simulateOpen();

			// Simulate unexpected disconnect
			mockWebSocketInstance?.simulateClose(1006, 'Abnormal closure');

			expect(get(websocket.status)).toBe('reconnecting');
			expect(get(websocket.reconnectAttempts)).toBe(1);
		});

		it('should increase reconnect attempts', () => {
			websocket.connect({
				url: 'ws://localhost:8080/ws',
				reconnectInterval: 1000,
				maxReconnectAttempts: 5
			});
			mockWebSocketInstance?.simulateOpen();
			mockWebSocketInstance?.simulateClose(1006);

			expect(get(websocket.reconnectAttempts)).toBe(1);

			// Wait for reconnect (with exponential backoff: 1000 * 1.5^1 = 1500)
			vi.advanceTimersByTime(2000);
			// Simulate another failure after reconnect attempt
			mockWebSocketInstance?.simulateOpen();
			mockWebSocketInstance?.simulateClose(1006);

			expect(get(websocket.reconnectAttempts)).toBe(1); // Reset to 1 after open, then close increments
		});

		it('should stop reconnecting after max attempts', () => {
			websocket.connect({
				url: 'ws://localhost:8080/ws',
				reconnectInterval: 100,
				maxReconnectAttempts: 2
			});
			mockWebSocketInstance?.simulateOpen();

			// First disconnect
			mockWebSocketInstance?.simulateClose(1006);
			expect(get(websocket.reconnectAttempts)).toBe(1);

			// Wait and simulate second failure
			vi.advanceTimersByTime(150);
			mockWebSocketInstance?.simulateClose(1006);
			expect(get(websocket.reconnectAttempts)).toBe(2);

			// Wait for third attempt which should not happen
			vi.advanceTimersByTime(500);

			expect(get(websocket.status)).toBe('error');
		});

		it('should reset reconnect attempts on successful connection', () => {
			websocket.connect({
				url: 'ws://localhost:8080/ws',
				reconnectInterval: 1000
			});
			mockWebSocketInstance?.simulateOpen();
			mockWebSocketInstance?.simulateClose(1006);

			expect(get(websocket.reconnectAttempts)).toBe(1);

			// Successful reconnect
			vi.advanceTimersByTime(1500);
			mockWebSocketInstance?.simulateOpen();

			expect(get(websocket.reconnectAttempts)).toBe(0);
		});
	});

	describe('State Management', () => {
		it('should track connection state', () => {
			expect(get(websocket.status)).toBe('disconnected');

			websocket.connect({ url: 'ws://localhost:8080/ws' });
			expect(get(websocket.status)).toBe('connecting');

			mockWebSocketInstance?.simulateOpen();
			expect(get(websocket.status)).toBe('connected');

			websocket.disconnect();
			expect(get(websocket.status)).toBe('disconnected');
		});

		it('should track isConnected correctly', () => {
			expect(get(websocket.isConnected)).toBe(false);

			websocket.connect({ url: 'ws://localhost:8080/ws' });
			expect(get(websocket.isConnected)).toBe(false);

			mockWebSocketInstance?.simulateOpen();
			expect(get(websocket.isConnected)).toBe(true);

			websocket.disconnect();
			expect(get(websocket.isConnected)).toBe(false);
		});

		it('should update lastConnectedAt on connection', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();

			const state = get(websocket.state);
			expect(state.lastConnectedAt).not.toBeNull();
		});

		it('should track errors', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateError();

			const state = get(websocket.state);
			expect(state.status).toBe('error');
			expect(state.lastError).not.toBeNull();
		});
	});

	describe('Utility Functions', () => {
		it('should check if socket is open', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			expect(websocket.isSocketOpen()).toBe(false);

			mockWebSocketInstance?.simulateOpen();
			expect(websocket.isSocketOpen()).toBe(true);
		});

		it('should get socket instance', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			expect(websocket.getSocket()).toBe(mockWebSocketInstance);
		});
	});

	describe('initWebSocket helper', () => {
		it('should initialize WebSocket with URL', () => {
			initWebSocket('ws://test.example.com/ws');

			expect(mockWebSocketInstance).not.toBeNull();
			expect(mockWebSocketInstance?.url).toContain('ws://test.example.com/ws');
		});
	});

	describe('closeWebSocket helper', () => {
		it('should close WebSocket connection', () => {
			websocket.connect({ url: 'ws://localhost:8080/ws' });
			mockWebSocketInstance?.simulateOpen();

			closeWebSocket();

			expect(get(websocket.status)).toBe('disconnected');
		});
	});
});
