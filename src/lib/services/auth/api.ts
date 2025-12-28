/**
 * 認證 API 模組
 * 處理登入、登出、密碼管理、個人資料等
 */

import type { User, UpdateProfileData } from '$lib/types';
import { httpClient, HttpError } from '../core/http-client';

export interface LoginRequest {
	account: string; // 可以是 username 或 email
	password: string;
}

export interface LoginResponse {
	user: User;
	token: string;
}

export interface PermissionsResponse {
	permissions: string[];
}

export const authApi = {
	async login(data: LoginRequest): Promise<LoginResponse> {
		try {
			const response = await httpClient.post<LoginResponse>('/auth/login', data);
			return response;
		} catch (error) {
			if (error instanceof HttpError) {
				// Map backend error messages to Chinese
				const errorMessages: Record<string, string> = {
					'Invalid credentials.': '帳號或密碼錯誤',
					'Account is deactivated. Please contact administrator.': '帳號已停用，請聯絡管理員',
					'Account is pending approval.': '帳號尚未審核通過',
					'Account has been suspended. Please contact administrator.': '帳號已被停權，請聯絡管理員'
				};
				throw new Error(errorMessages[error.error] || error.error);
			}
			throw error;
		}
	},

	async logout(): Promise<void> {
		try {
			await httpClient.post('/auth/logout');
		} catch {
			// Ignore logout errors - we'll clear local state anyway
		}
	},

	async getCurrentUser(): Promise<{ user: User }> {
		return httpClient.get<{ user: User }>('/auth/me');
	},

	async getPermissions(): Promise<string[]> {
		const response = await httpClient.get<PermissionsResponse>('/auth/permissions');
		return response.permissions;
	},

	async forgotPassword(email: string): Promise<void> {
		if (!email.includes('@')) {
			throw new Error('無效的電子郵件格式');
		}
		await httpClient.post('/auth/forgot-password', { email });
	},

	async resetPassword(token: string, newPassword: string): Promise<void> {
		if (!token || newPassword.length < 6) {
			throw new Error('密碼重設失敗');
		}
		await httpClient.post('/auth/reset-password', { token, newPassword });
	},

	async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
		if (newPassword.length < 6) {
			throw new Error('新密碼至少需要 6 個字元');
		}
		try {
			await httpClient.post(`/users/${userId}/change-password`, {
				currentPassword,
				newPassword
			});
		} catch (error) {
			if (error instanceof HttpError) {
				if (error.status === 400) {
					throw new Error('目前密碼錯誤');
				}
			}
			throw error;
		}
	},

	async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
		try {
			const response = await httpClient.patch<{ user: User }>(`/users/${userId}`, data);
			return response.user;
		} catch (error) {
			if (error instanceof HttpError) {
				if (error.error.includes('email')) {
					throw new Error('此電子郵件已被使用');
				}
			}
			throw error;
		}
	},

	async uploadAvatar(userId: string, file: File): Promise<string> {
		const formData = new FormData();
		formData.append('avatar', file);

		const response = await httpClient.upload<{ avatarUrl: string }>(
			`/users/${userId}/avatar`,
			formData
		);
		return response.avatarUrl;
	}
};
