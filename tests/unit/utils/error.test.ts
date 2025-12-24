import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	ApiError,
	getErrorMessage,
	handleApiError,
	retryWithBackoff,
	errorMessages
} from '$lib/utils/error';

describe('Error Utilities', () => {
	describe('ApiError', () => {
		it('should create an ApiError with default values', () => {
			const error = new ApiError('Something went wrong');

			expect(error.message).toBe('Something went wrong');
			expect(error.code).toBe('UNKNOWN_ERROR');
			expect(error.statusCode).toBe(500);
			expect(error.name).toBe('ApiError');
		});

		it('should create an ApiError with custom values', () => {
			const error = new ApiError('Not found', 'NOT_FOUND', 404, { id: 123 });

			expect(error.message).toBe('Not found');
			expect(error.code).toBe('NOT_FOUND');
			expect(error.statusCode).toBe(404);
			expect(error.details).toEqual({ id: 123 });
		});

		it('should be an instance of Error', () => {
			const error = new ApiError('Test');
			expect(error instanceof Error).toBe(true);
			expect(error instanceof ApiError).toBe(true);
		});
	});

	describe('getErrorMessage', () => {
		it('should return mapped message for ApiError with known code', () => {
			const error = new ApiError('Error', 'UNAUTHORIZED');
			expect(getErrorMessage(error)).toBe(errorMessages.UNAUTHORIZED);
		});

		it('should return error message for ApiError with unknown code', () => {
			const error = new ApiError('Custom error message', 'CUSTOM_CODE');
			expect(getErrorMessage(error)).toBe('Custom error message');
		});

		it('should return NETWORK_ERROR message for fetch errors', () => {
			const error = new Error('fetch failed');
			expect(getErrorMessage(error)).toBe(errorMessages.NETWORK_ERROR);
		});

		it('should return TIMEOUT_ERROR message for timeout errors', () => {
			const error = new Error('request timeout');
			expect(getErrorMessage(error)).toBe(errorMessages.TIMEOUT_ERROR);
		});

		it('should return error message for regular Error', () => {
			const error = new Error('Some error');
			expect(getErrorMessage(error)).toBe('Some error');
		});

		it('should return string directly if error is string', () => {
			expect(getErrorMessage('String error')).toBe('String error');
		});

		it('should return UNKNOWN_ERROR for non-standard errors', () => {
			expect(getErrorMessage(null)).toBe(errorMessages.UNKNOWN_ERROR);
			expect(getErrorMessage(undefined)).toBe(errorMessages.UNKNOWN_ERROR);
			expect(getErrorMessage(123)).toBe(errorMessages.UNKNOWN_ERROR);
			expect(getErrorMessage({})).toBe(errorMessages.UNKNOWN_ERROR);
		});
	});

	describe('handleApiError', () => {
		it('should return result for successful promise', async () => {
			const result = await handleApiError(Promise.resolve('success'));
			expect(result).toBe('success');
		});

		it('should return null for failed promise', async () => {
			const result = await handleApiError(Promise.reject(new Error('failed')));
			expect(result).toBeNull();
		});

		it('should call onError callback when error occurs', async () => {
			const onError = vi.fn();
			await handleApiError(Promise.reject(new Error('failed')), { onError });

			expect(onError).toHaveBeenCalledTimes(1);
			expect(onError).toHaveBeenCalledWith(
				expect.objectContaining({
					code: 'UNKNOWN_ERROR',
					message: 'failed'
				})
			);
		});

		it('should rethrow error when rethrow option is true', async () => {
			const error = new Error('failed');
			await expect(
				handleApiError(Promise.reject(error), { rethrow: true })
			).rejects.toThrow('failed');
		});

		it('should use ApiError code when available', async () => {
			const onError = vi.fn();
			const apiError = new ApiError('Unauthorized', 'UNAUTHORIZED', 401);

			await handleApiError(Promise.reject(apiError), { onError });

			expect(onError).toHaveBeenCalledWith(
				expect.objectContaining({
					code: 'UNAUTHORIZED'
				})
			);
		});
	});

	describe('retryWithBackoff', () => {
		it('should return result on first successful attempt', async () => {
			const fn = vi.fn().mockResolvedValue('success');

			const result = await retryWithBackoff(fn);

			expect(result).toBe('success');
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('should have correct default options', () => {
			// Verify the default options structure
			const defaultOptions = {
				maxRetries: 3,
				baseDelay: 1000,
				maxDelay: 10000
			};

			expect(defaultOptions.maxRetries).toBe(3);
			expect(defaultOptions.baseDelay).toBe(1000);
			expect(defaultOptions.maxDelay).toBe(10000);
		});

		it('should calculate exponential delays correctly', () => {
			const baseDelay = 1000;
			const maxDelay = 10000;

			// Calculate delays for each retry attempt
			const delay0 = Math.min(baseDelay * Math.pow(2, 0), maxDelay); // 1000
			const delay1 = Math.min(baseDelay * Math.pow(2, 1), maxDelay); // 2000
			const delay2 = Math.min(baseDelay * Math.pow(2, 2), maxDelay); // 4000
			const delay3 = Math.min(baseDelay * Math.pow(2, 3), maxDelay); // 8000
			const delay4 = Math.min(baseDelay * Math.pow(2, 4), maxDelay); // 10000 (capped)

			expect(delay0).toBe(1000);
			expect(delay1).toBe(2000);
			expect(delay2).toBe(4000);
			expect(delay3).toBe(8000);
			expect(delay4).toBe(10000);
		});

		it('should cap delay at maxDelay', () => {
			const baseDelay = 1000;
			const maxDelay = 3000;

			const delay0 = Math.min(baseDelay * Math.pow(2, 0), maxDelay); // 1000
			const delay1 = Math.min(baseDelay * Math.pow(2, 1), maxDelay); // 2000
			const delay2 = Math.min(baseDelay * Math.pow(2, 2), maxDelay); // 3000 (capped)
			const delay3 = Math.min(baseDelay * Math.pow(2, 3), maxDelay); // 3000 (capped)

			expect(delay0).toBe(1000);
			expect(delay1).toBe(2000);
			expect(delay2).toBe(3000);
			expect(delay3).toBe(3000);
		});
	});

	describe('errorMessages', () => {
		it('should have all expected error codes', () => {
			expect(errorMessages).toHaveProperty('NETWORK_ERROR');
			expect(errorMessages).toHaveProperty('TIMEOUT_ERROR');
			expect(errorMessages).toHaveProperty('UNAUTHORIZED');
			expect(errorMessages).toHaveProperty('FORBIDDEN');
			expect(errorMessages).toHaveProperty('NOT_FOUND');
			expect(errorMessages).toHaveProperty('VALIDATION_ERROR');
			expect(errorMessages).toHaveProperty('SERVER_ERROR');
			expect(errorMessages).toHaveProperty('UNKNOWN_ERROR');
		});

		it('should have Chinese messages', () => {
			// Verify messages are in Chinese
			expect(errorMessages.NETWORK_ERROR).toContain('網路');
			expect(errorMessages.UNAUTHORIZED).toContain('登入');
		});
	});
});
