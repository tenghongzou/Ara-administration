import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to define mocks that need to be available during hoisting
const { mockGoto, mockLogout } = vi.hoisted(() => ({
	mockGoto: vi.fn(),
	mockLogout: vi.fn()
}));

vi.mock('$app/environment', () => ({
	browser: true
}));

vi.mock('$app/navigation', () => ({
	goto: mockGoto
}));

vi.mock('$lib/stores/auth', () => ({
	auth: {
		logout: mockLogout
	}
}));

import { SessionTimeoutService } from '$lib/services/auth/session-timeout';

describe('Session Timeout Service', () => {
	let service: SessionTimeoutService;

	beforeEach(() => {
		vi.useFakeTimers();
		localStorage.clear();
		mockGoto.mockClear();
		mockLogout.mockClear();

		// Mock window event listeners
		vi.spyOn(window, 'addEventListener').mockImplementation(vi.fn());
		vi.spyOn(window, 'removeEventListener').mockImplementation(vi.fn());
	});

	afterEach(() => {
		if (service) {
			service.stop();
		}
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	describe('Activity Tracking', () => {
		it('should record login time to localStorage', () => {
			service = new SessionTimeoutService();
			const now = Date.now();
			vi.setSystemTime(now);

			service.recordLogin();

			expect(localStorage.getItem('session_login_time')).toBe(now.toString());
			expect(localStorage.getItem('session_last_activity')).toBe(now.toString());
		});

		it('should clear timestamps from localStorage', () => {
			service = new SessionTimeoutService();
			service.recordLogin();

			service.clearTimestamps();

			expect(localStorage.getItem('session_login_time')).toBeNull();
			expect(localStorage.getItem('session_last_activity')).toBeNull();
		});

		it('should bind activity events on start', () => {
			service = new SessionTimeoutService();
			service.start();

			expect(window.addEventListener).toHaveBeenCalledWith(
				'mousedown',
				expect.any(Function),
				{ passive: true }
			);
			expect(window.addEventListener).toHaveBeenCalledWith(
				'keydown',
				expect.any(Function),
				{ passive: true }
			);
			expect(window.addEventListener).toHaveBeenCalledWith(
				'touchstart',
				expect.any(Function),
				{ passive: true }
			);
			expect(window.addEventListener).toHaveBeenCalledWith(
				'scroll',
				expect.any(Function),
				{ passive: true }
			);
		});

		it('should unbind activity events on stop', () => {
			service = new SessionTimeoutService();
			service.start();
			service.stop();

			expect(window.removeEventListener).toHaveBeenCalledWith(
				'mousedown',
				expect.any(Function)
			);
			expect(window.removeEventListener).toHaveBeenCalledWith(
				'keydown',
				expect.any(Function)
			);
		});
	});

	describe('Idle Timeout Detection', () => {
		it('should expire session when idle timeout is exceeded', () => {
			const idleTimeout = 5000; // 5 seconds for testing
			const checkInterval = 1000;

			service = new SessionTimeoutService({
				idleTimeout,
				absoluteTimeout: 60000,
				checkInterval
			});

			// Set initial timestamps
			const startTime = Date.now();
			vi.setSystemTime(startTime);
			service.recordLogin();
			service.start();

			// Advance time past idle timeout
			vi.advanceTimersByTime(idleTimeout + checkInterval);

			expect(mockLogout).toHaveBeenCalled();
			expect(mockGoto).toHaveBeenCalledWith('/login');
		});

		it('should not expire session before idle timeout', () => {
			const idleTimeout = 10000;
			const checkInterval = 1000;

			service = new SessionTimeoutService({
				idleTimeout,
				absoluteTimeout: 60000,
				checkInterval
			});

			const startTime = Date.now();
			vi.setSystemTime(startTime);
			service.recordLogin();
			service.start();

			// Advance time but stay within idle timeout
			vi.advanceTimersByTime(idleTimeout - 2000);

			expect(mockLogout).not.toHaveBeenCalled();
		});
	});

	describe('Absolute Timeout Detection', () => {
		it('should expire session when absolute timeout is exceeded', () => {
			const absoluteTimeout = 10000;
			const checkInterval = 1000;

			service = new SessionTimeoutService({
				idleTimeout: 60000, // High idle timeout so it won't trigger
				absoluteTimeout,
				checkInterval
			});

			const startTime = Date.now();
			vi.setSystemTime(startTime);
			service.recordLogin();
			service.start();

			// Simulate activity to keep updating lastActivity but not loginTime
			for (let i = 0; i < 12; i++) {
				vi.advanceTimersByTime(checkInterval);
				// Update lastActivity to prevent idle timeout
				localStorage.setItem('session_last_activity', Date.now().toString());
			}

			expect(mockLogout).toHaveBeenCalled();
			expect(mockGoto).toHaveBeenCalledWith('/login');
		});

		it('should not expire session before absolute timeout', () => {
			const absoluteTimeout = 20000;
			const checkInterval = 1000;

			service = new SessionTimeoutService({
				idleTimeout: 60000,
				absoluteTimeout,
				checkInterval
			});

			const startTime = Date.now();
			vi.setSystemTime(startTime);
			service.recordLogin();
			service.start();

			// Advance time but stay within absolute timeout, keep active
			for (let i = 0; i < 5; i++) {
				vi.advanceTimersByTime(checkInterval);
				localStorage.setItem('session_last_activity', Date.now().toString());
			}

			expect(mockLogout).not.toHaveBeenCalled();
		});
	});

	describe('Remaining Time', () => {
		it('should return remaining time for both idle and absolute', () => {
			service = new SessionTimeoutService({
				idleTimeout: 10000,
				absoluteTimeout: 30000,
				checkInterval: 1000
			});

			const startTime = Date.now();
			vi.setSystemTime(startTime);
			service.recordLogin();

			// Advance 3 seconds
			vi.advanceTimersByTime(3000);

			const remaining = service.getRemainingTime();

			expect(remaining).not.toBeNull();
			expect(remaining!.idle).toBe(7000); // 10000 - 3000
			expect(remaining!.absolute).toBe(27000); // 30000 - 3000
		});

		it('should return null when no timestamps exist', () => {
			service = new SessionTimeoutService();
			localStorage.clear();

			const remaining = service.getRemainingTime();
			expect(remaining).toBeNull();
		});

		it('should never return negative remaining time', () => {
			service = new SessionTimeoutService({
				idleTimeout: 5000,
				absoluteTimeout: 10000,
				checkInterval: 1000
			});

			const startTime = Date.now();
			vi.setSystemTime(startTime);
			service.recordLogin();

			// Advance way past both timeouts
			vi.advanceTimersByTime(20000);

			const remaining = service.getRemainingTime();

			expect(remaining).not.toBeNull();
			expect(remaining!.idle).toBe(0);
			expect(remaining!.absolute).toBe(0);
		});
	});

	describe('Custom Configuration', () => {
		it('should use custom logout redirect path', () => {
			service = new SessionTimeoutService({
				idleTimeout: 1000,
				absoluteTimeout: 60000,
				checkInterval: 500,
				logoutRedirect: '/session-expired'
			});

			const startTime = Date.now();
			vi.setSystemTime(startTime);
			service.recordLogin();
			service.start();

			vi.advanceTimersByTime(2000);

			expect(mockGoto).toHaveBeenCalledWith('/session-expired');
		});
	});

	describe('Session Expired Cleanup', () => {
		it('should clear timestamps and stop monitoring on expiry', () => {
			service = new SessionTimeoutService({
				idleTimeout: 1000,
				absoluteTimeout: 60000,
				checkInterval: 500
			});

			const startTime = Date.now();
			vi.setSystemTime(startTime);
			service.recordLogin();
			service.start();

			vi.advanceTimersByTime(2000);

			// Timestamps should be cleared
			expect(localStorage.getItem('session_login_time')).toBeNull();
			expect(localStorage.getItem('session_last_activity')).toBeNull();

			// Should have logged out
			expect(mockLogout).toHaveBeenCalledTimes(1);

			// Further time advancement should not cause additional logouts
			mockLogout.mockClear();
			vi.advanceTimersByTime(5000);
			expect(mockLogout).not.toHaveBeenCalled();
		});
	});
});
