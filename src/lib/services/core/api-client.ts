/**
 * API Client 模組
 * 提供統一的 API 請求處理，支援攔截器、重試機制、錯誤處理
 *
 * 設計為將來可輕鬆遷移至 OpenAPI Codegen
 */

import { browser } from '$app/environment';

// ============================================================================
// Types
// ============================================================================

export interface ApiClientConfig {
	baseUrl: string;
	version: string;
	timeout?: number;
	retryAttempts?: number;
	retryDelay?: number;
}

export interface RequestConfig extends RequestInit {
	timeout?: number;
	retryAttempts?: number;
	skipAuth?: boolean;
}

export interface ApiResponse<T> {
	data: T;
	status: number;
	headers: Headers;
}

export interface ApiErrorResponse {
	error: string;
	message?: string;
	code?: string;
	details?: Record<string, string>;
}

export type RequestInterceptor = (config: RequestInit & { url: string }) =>
	(RequestInit & { url: string }) | Promise<RequestInit & { url: string }>;

export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

// ============================================================================
// Error Classes
// ============================================================================

export class ApiError extends Error {
	constructor(
		public status: number,
		public code: string,
		message: string,
		public details?: Record<string, string>
	) {
		super(message);
		this.name = 'ApiError';
	}

	/** 是否為認證錯誤 */
	isUnauthorized(): boolean {
		return this.status === 401;
	}

	/** 是否為權限錯誤 */
	isForbidden(): boolean {
		return this.status === 403;
	}

	/** 是否為驗證錯誤 */
	isValidationError(): boolean {
		return this.status === 422;
	}

	/** 是否為找不到資源 */
	isNotFound(): boolean {
		return this.status === 404;
	}

	/** 是否為伺服器錯誤 */
	isServerError(): boolean {
		return this.status >= 500;
	}

	/** 是否為網路錯誤 */
	isNetworkError(): boolean {
		return this.status === 0;
	}
}

export class NetworkError extends ApiError {
	constructor(message: string = 'Network error') {
		super(0, 'NETWORK_ERROR', message);
		this.name = 'NetworkError';
	}
}

export class TimeoutError extends ApiError {
	constructor(message: string = 'Request timeout') {
		super(0, 'TIMEOUT', message);
		this.name = 'TimeoutError';
	}
}

// ============================================================================
// Token Management
// ============================================================================

class TokenManager {
	private static readonly STORAGE_KEY = 'auth_state';

	getToken(): string | null {
		if (!browser) return null;

		try {
			const authState = localStorage.getItem(TokenManager.STORAGE_KEY);
			if (authState) {
				const parsed = JSON.parse(authState);
				return parsed.token || null;
			}
		} catch {
			// Ignore parse errors
		}
		return null;
	}

	setToken(token: string): void {
		if (!browser) return;

		try {
			const authState = localStorage.getItem(TokenManager.STORAGE_KEY);
			const parsed = authState ? JSON.parse(authState) : {};
			parsed.token = token;
			localStorage.setItem(TokenManager.STORAGE_KEY, JSON.stringify(parsed));
		} catch {
			// Ignore errors
		}
	}

	clearToken(): void {
		if (!browser) return;
		localStorage.removeItem(TokenManager.STORAGE_KEY);
	}
}

// ============================================================================
// API Client Class
// ============================================================================

class ApiClient {
	private config: Required<ApiClientConfig>;
	private tokenManager: TokenManager;
	private requestInterceptors: RequestInterceptor[] = [];
	private responseInterceptors: ResponseInterceptor[] = [];
	private errorInterceptors: ErrorInterceptor[] = [];

	constructor(config: ApiClientConfig) {
		this.config = {
			baseUrl: config.baseUrl,
			version: config.version,
			timeout: config.timeout ?? 30000,
			retryAttempts: config.retryAttempts ?? 0,
			retryDelay: config.retryDelay ?? 1000,
		};
		this.tokenManager = new TokenManager();
	}

	// --------------------------------------------------------------------------
	// Configuration
	// --------------------------------------------------------------------------

	/** 取得完整的 API URL */
	get apiUrl(): string {
		return `${this.config.baseUrl}/api/${this.config.version}`;
	}

	/** 更新配置 */
	updateConfig(config: Partial<ApiClientConfig>): void {
		Object.assign(this.config, config);
	}

	// --------------------------------------------------------------------------
	// Interceptors
	// --------------------------------------------------------------------------

	/** 添加請求攔截器 */
	addRequestInterceptor(interceptor: RequestInterceptor): () => void {
		this.requestInterceptors.push(interceptor);
		return () => {
			const index = this.requestInterceptors.indexOf(interceptor);
			if (index > -1) this.requestInterceptors.splice(index, 1);
		};
	}

	/** 添加響應攔截器 */
	addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
		this.responseInterceptors.push(interceptor);
		return () => {
			const index = this.responseInterceptors.indexOf(interceptor);
			if (index > -1) this.responseInterceptors.splice(index, 1);
		};
	}

	/** 添加錯誤攔截器 */
	addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
		this.errorInterceptors.push(interceptor);
		return () => {
			const index = this.errorInterceptors.indexOf(interceptor);
			if (index > -1) this.errorInterceptors.splice(index, 1);
		};
	}

	// --------------------------------------------------------------------------
	// Token Management
	// --------------------------------------------------------------------------

	getToken(): string | null {
		return this.tokenManager.getToken();
	}

	setToken(token: string): void {
		this.tokenManager.setToken(token);
	}

	clearToken(): void {
		this.tokenManager.clearToken();
	}

	// --------------------------------------------------------------------------
	// HTTP Methods
	// --------------------------------------------------------------------------

	async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
		return this.request<T>(endpoint, { ...config, method: 'GET' });
	}

	async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
		return this.request<T>(endpoint, {
			...config,
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
		return this.request<T>(endpoint, {
			...config,
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
		return this.request<T>(endpoint, {
			...config,
			method: 'PATCH',
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
		return this.request<T>(endpoint, { ...config, method: 'DELETE' });
	}

	async upload<T>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<T> {
		return this.request<T>(endpoint, {
			...config,
			method: 'POST',
			body: formData,
			headers: {
				// Don't set Content-Type for FormData - browser will set it with boundary
				...config?.headers,
			},
		}, true);
	}

	// --------------------------------------------------------------------------
	// Core Request Method
	// --------------------------------------------------------------------------

	private async request<T>(
		endpoint: string,
		config: RequestConfig,
		isFormData: boolean = false
	): Promise<T> {
		const url = `${this.apiUrl}${endpoint}`;
		const timeout = config.timeout ?? this.config.timeout;
		const retryAttempts = config.retryAttempts ?? this.config.retryAttempts;

		// Build headers
		const headers: HeadersInit = {
			...(isFormData ? {} : { 'Content-Type': 'application/json' }),
			...config.headers,
		};

		// Add auth token if not skipped
		if (!config.skipAuth) {
			const token = this.tokenManager.getToken();
			if (token) {
				(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
			}
		}

		// Build request config
		let requestConfig: RequestInit & { url: string } = {
			...config,
			url,
			headers,
		};

		// Run request interceptors
		for (const interceptor of this.requestInterceptors) {
			requestConfig = await interceptor(requestConfig);
		}

		// Execute with retry
		return this.executeWithRetry<T>(requestConfig, timeout, retryAttempts);
	}

	private async executeWithRetry<T>(
		config: RequestInit & { url: string },
		timeout: number,
		retryAttempts: number,
		attempt: number = 0
	): Promise<T> {
		try {
			return await this.executeRequest<T>(config, timeout);
		} catch (error) {
			const apiError = error instanceof ApiError ? error : new NetworkError();

			// Run error interceptors
			let processedError = apiError;
			for (const interceptor of this.errorInterceptors) {
				processedError = await interceptor(processedError);
			}

			// Retry on network errors or 5xx errors
			if (attempt < retryAttempts && (processedError.isNetworkError() || processedError.isServerError())) {
				await this.delay(this.config.retryDelay * (attempt + 1));
				return this.executeWithRetry<T>(config, timeout, retryAttempts, attempt + 1);
			}

			throw processedError;
		}
	}

	private async executeRequest<T>(
		config: RequestInit & { url: string },
		timeout: number
	): Promise<T> {
		const { url, ...fetchConfig } = config;

		// Create abort controller for timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			let response = await fetch(url, {
				...fetchConfig,
				signal: controller.signal,
			});

			// Run response interceptors
			for (const interceptor of this.responseInterceptors) {
				response = await interceptor(response);
			}

			return await this.handleResponse<T>(response);
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				throw new TimeoutError();
			}
			if (error instanceof ApiError) {
				throw error;
			}
			throw new NetworkError(error instanceof Error ? error.message : 'Unknown error');
		} finally {
			clearTimeout(timeoutId);
		}
	}

	private async handleResponse<T>(response: Response): Promise<T> {
		if (!response.ok) {
			let errorMessage = 'Request failed';
			let errorCode = 'UNKNOWN_ERROR';
			let errorDetails: Record<string, string> | undefined;

			try {
				const errorData: ApiErrorResponse = await response.json();
				errorMessage = errorData.error || errorData.message || errorMessage;
				errorCode = errorData.code || errorCode;
				errorDetails = errorData.details;
			} catch {
				errorMessage = response.statusText || errorMessage;
			}

			throw new ApiError(response.status, errorCode, errorMessage, errorDetails);
		}

		// Handle empty responses
		const text = await response.text();
		if (!text) {
			return {} as T;
		}

		try {
			return JSON.parse(text) as T;
		} catch {
			return {} as T;
		}
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

// ============================================================================
// Singleton Instance
// ============================================================================

import { config } from '$lib/constants/config';

export const apiClient = new ApiClient({
	baseUrl: config.apiHost,
	version: config.apiVersion,
	timeout: 30000,
	retryAttempts: 2,
	retryDelay: 1000,
});

// ============================================================================
// Convenience Exports (保持向後兼容)
// ============================================================================

/** @deprecated 使用 apiClient.get() 代替 */
export const httpClient = {
	get: <T>(endpoint: string, options?: RequestInit) =>
		apiClient.get<T>(endpoint, options),
	post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
		apiClient.post<T>(endpoint, data, options),
	put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
		apiClient.put<T>(endpoint, data, options),
	patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
		apiClient.patch<T>(endpoint, data, options),
	delete: <T>(endpoint: string, options?: RequestInit) =>
		apiClient.delete<T>(endpoint, options),
	upload: <T>(endpoint: string, formData: FormData, options?: RequestInit) =>
		apiClient.upload<T>(endpoint, formData, options),
};

/** @deprecated 使用 ApiError 代替 */
export { ApiError as HttpError };
