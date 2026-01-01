/**
 * 認證 API 模組
 * 處理登入、登出、密碼管理、個人資料等
 */

import type { User, UpdateProfileData } from '$lib/types';
import { apiClient, ApiError } from '../core/api-client';

// ============================================================================
// Types
// ============================================================================

export interface LoginRequest {
	account: string; // 可以是 username 或 email
	password: string;
}

export interface LoginResponse {
	user: User;
	token: string;
}

// ============================================================================
// Error Messages
// ============================================================================

const ERROR_MESSAGES: Record<string, string> = {
	'Invalid credentials.': '帳號或密碼錯誤',
	'Account is deactivated. Please contact administrator.': '帳號已停用，請聯絡管理員',
	'Account is pending approval.': '帳號尚未審核通過',
	'Account has been suspended. Please contact administrator.': '帳號已被停權，請聯絡管理員'
};

// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
	/**
	 * 使用者登入
	 */
	async login(data: LoginRequest): Promise<LoginResponse> {
		try {
			// apiClient 自動解包 data，直接返回 LoginResponse
			const response = await apiClient.post<LoginResponse>('/auth/login', data, {
				skipAuth: true
			});

			if (response.token) {
				apiClient.setToken(response.token);
			}

			return response;
		} catch (error) {
			if (error instanceof ApiError) {
				throw new Error(ERROR_MESSAGES[error.message] || error.message);
			}
			throw error;
		}
	},

	/**
	 * 使用者登出
	 */
	async logout(): Promise<void> {
		try {
			await apiClient.post('/auth/logout');
		} catch {
			// Ignore logout errors - we'll clear local state anyway
		} finally {
			apiClient.clearToken();
		}
	},

	/**
	 * 取得目前登入的使用者
	 */
	async getCurrentUser(): Promise<User> {
		// apiClient 自動解包 { data: User } 回應
		return apiClient.get<User>('/auth/me');
	},

	/**
	 * 取得使用者權限列表
	 */
	async getPermissions(): Promise<string[]> {
		const response = await apiClient.get<{ permissions: string[] }>('/auth/permissions');
		return response.permissions || [];
	},

	/**
	 * 忘記密碼 - 發送重設密碼信件
	 */
	async forgotPassword(email: string): Promise<void> {
		if (!email.includes('@')) {
			throw new Error('無效的電子郵件格式');
		}
		await apiClient.post('/auth/forgot-password', { email }, { skipAuth: true });
	},

	/**
	 * 重設密碼
	 */
	async resetPassword(token: string, newPassword: string): Promise<void> {
		if (!token || newPassword.length < 6) {
			throw new Error('密碼重設失敗');
		}
		await apiClient.post('/auth/reset-password', { token, newPassword }, { skipAuth: true });
	},

	/**
	 * 變更密碼
	 */
	async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
		if (newPassword.length < 6) {
			throw new Error('新密碼至少需要 6 個字元');
		}
		try {
			await apiClient.post(`/users/${userId}/change-password`, {
				currentPassword,
				newPassword
			});
		} catch (error) {
			if (error instanceof ApiError && error.status === 400) {
				throw new Error('目前密碼錯誤');
			}
			throw error;
		}
	},

	/**
	 * 更新個人資料
	 */
	async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
		try {
			// apiClient 自動解包 { data: User } 回應
			return await apiClient.patch<User>(`/users/${userId}`, data);
		} catch (error) {
			if (error instanceof ApiError && error.message.includes('email')) {
				throw new Error('此電子郵件已被使用');
			}
			throw error;
		}
	},

	/**
	 * 上傳頭像
	 */
	async uploadAvatar(userId: string, file: File): Promise<string> {
		const formData = new FormData();
		formData.append('avatar', file);

		const response = await apiClient.upload<{ avatarUrl: string }>(
			`/users/${userId}/avatar`,
			formData
		);
		return response.avatarUrl;
	}
};
