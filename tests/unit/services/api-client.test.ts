import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to define mocks that need to be available during hoisting
const { mockGoto, mockReauthService } = vi.hoisted(() => ({
	mockGoto: vi.fn(),
	mockReauthService: {
		isTokenExpiredError: vi.fn().mockReturnValue(false),
		triggerReauth: vi.fn()
	}
}));

vi.mock('$app/environment', () => ({
	browser: true
}));

vi.mock('$app/navigation', () => ({
	goto: mockGoto
}));

vi.mock('$lib/services/auth/reauth-service', () => ({
	reauthService: mockReauthService
}));

vi.mock('$lib/constants/config', () => ({
	config: {
		apiHost: 'http://localhost',
		apiVersion: 'v1'
	}
}));

import { apiClient, ApiError, NetworkError, TimeoutError } from '$lib/services/core/api-client';

describe('API Client', () => {
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockFetch = vi.fn();
		vi.stubGlobal('fetch', mockFetch);
		vi.useFakeTimers();
		localStorage.clear();
		mockGoto.mockClear();
		mockReauthService.isTokenExpiredError.mockReturnValue(false);
		mockReauthService.triggerReauth.mockClear();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	function createMockResponse(body: unknown, status = 200, ok = true): Response {
		return {
			ok,
			status,
			statusText: ok ? 'OK' : 'Error',
			headers: new Headers(),
			text: vi.fn().mockResolvedValue(JSON.stringify(body)),
			json: vi.fn().mockResolvedValue(body),
			clone: vi.fn()
		} as unknown as Response;
	}

	describe('Successful Requests', () => {
		it('should make a GET request and return data', async () => {
			const responseData = { id: 1, name: 'Test' };
			mockFetch.mockResolvedValue(createMockResponse(responseData));

			const result = await apiClient.get('/test');

			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(result).toEqual(responseData);
		});

		it('should make a POST request with body', async () => {
			const responseData = { id: 1 };
			mockFetch.mockResolvedValue(createMockResponse(responseData));

			const postData = { name: 'New Item' };
			await apiClient.post('/items', postData);

			const [url, config] = mockFetch.mock.calls[0];
			expect(url).toContain('/api/v1/items');
			expect(config.method).toBe('POST');
			expect(config.body).toBe(JSON.stringify(postData));
		});

		it('should make PUT, PATCH, and DELETE requests', async () => {
			mockFetch.mockResolvedValue(createMockResponse({ ok: true }));

			await apiClient.put('/items/1', { name: 'Updated' });
			expect(mockFetch.mock.calls[0][1].method).toBe('PUT');

			await apiClient.patch('/items/1', { name: 'Patched' });
			expect(mockFetch.mock.calls[1][1].method).toBe('PATCH');

			await apiClient.delete('/items/1');
			expect(mockFetch.mock.calls[2][1].method).toBe('DELETE');
		});

		it('should set Content-Type to application/json', async () => {
			mockFetch.mockResolvedValue(createMockResponse({}));

			await apiClient.get('/test');

			const [, config] = mockFetch.mock.calls[0];
			expect(config.headers['Content-Type']).toBe('application/json');
		});
	});

	describe('Response Unwrapping', () => {
		it('should auto-unwrap data field from response', async () => {
			const wrappedResponse = { data: { id: 1, name: 'Test' } };
			mockFetch.mockResolvedValue(createMockResponse(wrappedResponse));

			const result = await apiClient.get('/test');

			expect(result).toEqual({ id: 1, name: 'Test' });
		});

		it('should preserve paginated response structure', async () => {
			const paginatedResponse = {
				data: [{ id: 1 }, { id: 2 }],
				pagination: { page: 1, total: 10 }
			};
			mockFetch.mockResolvedValue(createMockResponse(paginatedResponse));

			const result = await apiClient.get('/items');

			expect(result).toEqual(paginatedResponse);
		});

		it('should return raw response when no data field', async () => {
			const rawResponse = { message: 'ok', count: 5 };
			mockFetch.mockResolvedValue(createMockResponse(rawResponse));

			const result = await apiClient.get('/status');

			expect(result).toEqual(rawResponse);
		});

		it('should handle empty response body', async () => {
			const emptyResponse = {
				ok: true,
				status: 204,
				statusText: 'No Content',
				headers: new Headers(),
				text: vi.fn().mockResolvedValue(''),
				json: vi.fn().mockRejectedValue(new Error('No body'))
			} as unknown as Response;
			mockFetch.mockResolvedValue(emptyResponse);

			const result = await apiClient.delete('/items/1');

			expect(result).toEqual({});
		});
	});

	describe('Error Handling', () => {
		it('should throw ApiError on non-OK response', async () => {
			const errorResponse = {
				ok: false,
				status: 400,
				statusText: 'Bad Request',
				headers: new Headers(),
				text: vi.fn(),
				json: vi.fn().mockResolvedValue({
					error: 'Validation failed',
					code: 'VALIDATION_ERROR'
				})
			} as unknown as Response;
			mockFetch.mockResolvedValue(errorResponse);

			await expect(apiClient.get('/bad-request')).rejects.toThrow(ApiError);
		});

		it('should include status code and error code in ApiError', async () => {
			const errorResponse = {
				ok: false,
				status: 422,
				statusText: 'Unprocessable Entity',
				headers: new Headers(),
				text: vi.fn(),
				json: vi.fn().mockResolvedValue({
					error: 'Invalid input',
					code: 'INVALID_INPUT',
					details: { field: 'name is required' }
				})
			} as unknown as Response;
			mockFetch.mockResolvedValue(errorResponse);

			try {
				await apiClient.get('/validate');
			} catch (e) {
				const error = e as ApiError;
				expect(error.status).toBe(422);
				expect(error.code).toBe('INVALID_INPUT');
				expect(error.details).toEqual({ field: 'name is required' });
			}
		});

		it('should throw NetworkError on fetch failure', async () => {
			mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

			await expect(apiClient.get('/network-fail', { retryAttempts: 0 })).rejects.toThrow(
				NetworkError
			);
		});

		it('should pass AbortSignal to fetch for timeout support', async () => {
			mockFetch.mockResolvedValue(createMockResponse({}));

			await apiClient.get('/test', { timeout: 5000 });

			const [, config] = mockFetch.mock.calls[0];
			expect(config.signal).toBeInstanceOf(AbortSignal);
		});
	});

	describe('TimeoutError class', () => {
		it('should have correct properties', () => {
			const error = new TimeoutError();
			expect(error.name).toBe('TimeoutError');
			expect(error.status).toBe(0);
			expect(error.code).toBe('TIMEOUT');
			expect(error.message).toBe('Request timeout');
			expect(error.isNetworkError()).toBe(true);
		});

		it('should accept custom message', () => {
			const error = new TimeoutError('Custom timeout');
			expect(error.message).toBe('Custom timeout');
		});
	});

	describe('Authentication', () => {
		it('should include Authorization header when token is set', async () => {
			localStorage.setItem('auth_state', JSON.stringify({ token: 'my-jwt-token' }));
			mockFetch.mockResolvedValue(createMockResponse({}));

			await apiClient.get('/protected');

			const [, config] = mockFetch.mock.calls[0];
			expect(config.headers['Authorization']).toBe('Bearer my-jwt-token');
		});

		it('should not include Authorization header when skipAuth is true', async () => {
			localStorage.setItem('auth_state', JSON.stringify({ token: 'my-jwt-token' }));
			mockFetch.mockResolvedValue(createMockResponse({}));

			await apiClient.get('/public', { skipAuth: true });

			const [, config] = mockFetch.mock.calls[0];
			expect(config.headers['Authorization']).toBeUndefined();
		});

		it('should redirect to /login on 401 when no token expired error', async () => {
			const errorResponse = {
				ok: false,
				status: 401,
				statusText: 'Unauthorized',
				headers: new Headers(),
				text: vi.fn(),
				json: vi.fn().mockResolvedValue({
					error: 'Unauthorized',
					code: 'UNAUTHORIZED'
				})
			} as unknown as Response;
			mockFetch.mockResolvedValue(errorResponse);
			mockReauthService.isTokenExpiredError.mockReturnValue(false);

			await expect(apiClient.get('/protected', { retryAttempts: 0 })).rejects.toThrow(ApiError);
			expect(mockGoto).toHaveBeenCalledWith('/login');
		});

		it('should trigger reauth on 401 when token is expired', async () => {
			localStorage.setItem('auth_state', JSON.stringify({ token: 'expired-token' }));

			const errorResponse = {
				ok: false,
				status: 401,
				statusText: 'Unauthorized',
				headers: new Headers(),
				text: vi.fn(),
				json: vi.fn().mockResolvedValue({
					error: 'Token expired',
					code: 'TOKEN_EXPIRED'
				})
			} as unknown as Response;
			mockFetch.mockResolvedValue(errorResponse);
			mockReauthService.isTokenExpiredError.mockReturnValue(true);
			mockReauthService.triggerReauth.mockResolvedValue({ refreshed: true });

			await apiClient.get('/protected', { retryAttempts: 0 });

			expect(mockReauthService.triggerReauth).toHaveBeenCalled();
		});
	});

	describe('Retry Logic', () => {
		it('should retry on 500 server error', async () => {
			const errorResponse = {
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
				headers: new Headers(),
				text: vi.fn(),
				json: vi.fn().mockResolvedValue({ error: 'Server error' })
			} as unknown as Response;

			const successResponse = createMockResponse({ ok: true });

			mockFetch
				.mockResolvedValueOnce(errorResponse)
				.mockResolvedValueOnce(successResponse);

			const promise = apiClient.get('/retry-test', { retryAttempts: 1 });

			// Advance through retry delay
			await vi.advanceTimersByTimeAsync(2000);

			const result = await promise;
			expect(result).toEqual({ ok: true });
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});

		it('should not retry on 400 client error', async () => {
			const errorResponse = {
				ok: false,
				status: 400,
				statusText: 'Bad Request',
				headers: new Headers(),
				text: vi.fn(),
				json: vi.fn().mockResolvedValue({ error: 'Bad request' })
			} as unknown as Response;
			mockFetch.mockResolvedValue(errorResponse);

			await expect(apiClient.get('/no-retry', { retryAttempts: 2 })).rejects.toThrow(ApiError);
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});
	});

	describe('ApiError class', () => {
		it('should correctly identify error types', () => {
			expect(new ApiError(401, 'UNAUTH', 'Unauthorized').isUnauthorized()).toBe(true);
			expect(new ApiError(403, 'FORBIDDEN', 'Forbidden').isForbidden()).toBe(true);
			expect(new ApiError(404, 'NOT_FOUND', 'Not found').isNotFound()).toBe(true);
			expect(new ApiError(422, 'VALIDATION', 'Invalid').isValidationError()).toBe(true);
			expect(new ApiError(500, 'SERVER', 'Server error').isServerError()).toBe(true);
			expect(new ApiError(502, 'BAD_GATEWAY', 'Bad gateway').isServerError()).toBe(true);
			expect(new ApiError(0, 'NETWORK', 'Network error').isNetworkError()).toBe(true);
		});

		it('should not misidentify error types', () => {
			const error = new ApiError(400, 'BAD_REQUEST', 'Bad request');
			expect(error.isUnauthorized()).toBe(false);
			expect(error.isForbidden()).toBe(false);
			expect(error.isNotFound()).toBe(false);
			expect(error.isServerError()).toBe(false);
			expect(error.isNetworkError()).toBe(false);
		});
	});

	describe('Interceptors', () => {
		it('should run request interceptors', async () => {
			mockFetch.mockResolvedValue(createMockResponse({}));

			const removeInterceptor = apiClient.addRequestInterceptor((config) => {
				(config.headers as Record<string, string>)['X-Custom'] = 'test-value';
				return config;
			});

			await apiClient.get('/intercepted');

			const [, fetchConfig] = mockFetch.mock.calls[0];
			expect(fetchConfig.headers['X-Custom']).toBe('test-value');

			removeInterceptor();
		});

		it('should allow removing interceptors', async () => {
			mockFetch.mockResolvedValue(createMockResponse({}));

			const removeInterceptor = apiClient.addRequestInterceptor((config) => {
				(config.headers as Record<string, string>)['X-Temp'] = 'temp';
				return config;
			});

			removeInterceptor();

			await apiClient.get('/no-interceptor');

			const [, fetchConfig] = mockFetch.mock.calls[0];
			expect(fetchConfig.headers['X-Temp']).toBeUndefined();
		});
	});
});
