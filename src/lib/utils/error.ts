/**
 * Error handling utilities
 */

export interface AppError {
	code: string;
	message: string;
	details?: unknown;
}

export class ApiError extends Error {
	code: string;
	statusCode: number;
	details?: unknown;

	constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, details?: unknown) {
		super(message);
		this.name = 'ApiError';
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;
	}
}

/**
 * Common error codes and their user-friendly messages
 */
export const errorMessages: Record<string, string> = {
	NETWORK_ERROR: '網路連線錯誤，請檢查您的網路連線',
	TIMEOUT_ERROR: '請求逾時，請稍後再試',
	UNAUTHORIZED: '您的登入已過期，請重新登入',
	FORBIDDEN: '您沒有權限執行此操作',
	NOT_FOUND: '找不到請求的資源',
	VALIDATION_ERROR: '輸入資料格式錯誤',
	SERVER_ERROR: '伺服器發生錯誤，請稍後再試',
	UNKNOWN_ERROR: '發生未知錯誤，請稍後再試'
};

/**
 * Get user-friendly error message from error object
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		return errorMessages[error.code] || error.message;
	}

	if (error instanceof Error) {
		// Check for common error patterns
		if (error.message.includes('fetch')) {
			return errorMessages.NETWORK_ERROR;
		}
		if (error.message.includes('timeout')) {
			return errorMessages.TIMEOUT_ERROR;
		}
		return error.message;
	}

	if (typeof error === 'string') {
		return error;
	}

	return errorMessages.UNKNOWN_ERROR;
}

/**
 * Handle API errors with common patterns
 */
export async function handleApiError<T>(
	promise: Promise<T>,
	options: {
		onError?: (error: AppError) => void;
		rethrow?: boolean;
	} = {}
): Promise<T | null> {
	try {
		return await promise;
	} catch (error) {
		const appError: AppError = {
			code: error instanceof ApiError ? error.code : 'UNKNOWN_ERROR',
			message: getErrorMessage(error),
			details: error
		};

		options.onError?.(appError);

		if (options.rethrow) {
			throw error;
		}

		return null;
	}
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	options: {
		maxRetries?: number;
		baseDelay?: number;
		maxDelay?: number;
	} = {}
): Promise<T> {
	const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;
	let lastError: Error | null = null;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			if (attempt < maxRetries - 1) {
				const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw lastError;
}
