/**
 * HTTP Client 模組
 * 提供統一的 API 請求處理
 */

import { browser } from '$app/environment';
import { config } from '$lib/constants/config';

const API_BASE_URL = config.apiBaseUrl;

export interface ApiError {
	error: string;
	message?: string;
	status: number;
}

export class HttpError extends Error {
	constructor(
		public status: number,
		public error: string,
		public details?: string
	) {
		super(error);
		this.name = 'HttpError';
	}
}

function getAuthToken(): string | null {
	if (!browser) return null;

	try {
		const authState = localStorage.getItem('auth_state');
		if (authState) {
			const parsed = JSON.parse(authState);
			return parsed.token || null;
		}
	} catch {
		// Ignore parse errors
	}
	return null;
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		let errorMessage = 'Request failed';
		let errorDetails: string | undefined;

		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorData.message || errorMessage;
			errorDetails = errorData.message;
		} catch {
			// Response is not JSON
			errorMessage = response.statusText || errorMessage;
		}

		throw new HttpError(response.status, errorMessage, errorDetails);
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

export const httpClient = {
	async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
		const token = getAuthToken();
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...options?.headers
		};

		if (token) {
			(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'GET',
			headers,
			...options
		});

		return handleResponse<T>(response);
	},

	async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
		const token = getAuthToken();
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...options?.headers
		};

		if (token) {
			(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'POST',
			headers,
			body: data ? JSON.stringify(data) : undefined,
			...options
		});

		return handleResponse<T>(response);
	},

	async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
		const token = getAuthToken();
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...options?.headers
		};

		if (token) {
			(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'PUT',
			headers,
			body: data ? JSON.stringify(data) : undefined,
			...options
		});

		return handleResponse<T>(response);
	},

	async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
		const token = getAuthToken();
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...options?.headers
		};

		if (token) {
			(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'PATCH',
			headers,
			body: data ? JSON.stringify(data) : undefined,
			...options
		});

		return handleResponse<T>(response);
	},

	async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
		const token = getAuthToken();
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...options?.headers
		};

		if (token) {
			(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'DELETE',
			headers,
			...options
		});

		return handleResponse<T>(response);
	},

	async upload<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> {
		const token = getAuthToken();
		const headers: HeadersInit = {
			...options?.headers
		};

		if (token) {
			(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
		}

		// Don't set Content-Type for FormData - browser will set it with boundary
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'POST',
			headers,
			body: formData,
			...options
		});

		return handleResponse<T>(response);
	}
};
