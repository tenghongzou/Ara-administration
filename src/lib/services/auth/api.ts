/**
 * 認證 API 模組
 * 處理登入、登出、密碼管理、個人資料等
 */

import type { User, UpdateProfileData } from '$lib/types';
import { mockUsers } from '../mock-data';
import { delay } from '../core';

export interface LoginRequest {
	account: string; // 可以是 username 或 email
	password: string;
}

export interface LoginResponse {
	user: User;
	token: string;
}

export const authApi = {
	async login(data: LoginRequest): Promise<LoginResponse> {
		await delay(800);

		// 查找使用者：支援 username 或 email 登入
		const user = mockUsers.find(
			(u) =>
				(u.username === data.account || u.email === data.account) &&
				u.status === 'active'
		);

		// 檢查密碼（Mock：所有帳號密碼都是 admin123）
		if (user && data.password === 'admin123') {
			return {
				user,
				token: 'mock-jwt-token-' + Date.now()
			};
		}

		// 檢查帳號是否存在但狀態不對
		const existingUser = mockUsers.find(
			(u) => u.username === data.account || u.email === data.account
		);

		if (existingUser && existingUser.status !== 'active') {
			const statusMessages: Record<string, string> = {
				inactive: '帳號已停用，請聯絡管理員',
				pending: '帳號尚未審核通過',
				suspended: '帳號已被停權，請聯絡管理員'
			};
			throw new Error(statusMessages[existingUser.status] || '帳號無法登入');
		}

		throw new Error('帳號或密碼錯誤');
	},

	async logout(): Promise<void> {
		await delay(300);
	},

	async getCurrentUser(): Promise<User> {
		await delay(500);
		return mockUsers[0];
	},

	async forgotPassword(email: string): Promise<void> {
		await delay(1000);
		// Mock: always succeed if email is valid
		if (!email.includes('@')) {
			throw new Error('無效的電子郵件格式');
		}
	},

	async resetPassword(token: string, newPassword: string): Promise<void> {
		await delay(800);
		if (!token || newPassword.length < 6) {
			throw new Error('密碼重設失敗');
		}
	},

	async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
		await delay(600);
		if (currentPassword !== 'admin123') {
			throw new Error('目前密碼錯誤');
		}
		if (newPassword.length < 6) {
			throw new Error('新密碼至少需要 6 個字元');
		}

		// 更新密碼變更時間
		const index = mockUsers.findIndex((u) => u.id === userId);
		if (index !== -1) {
			mockUsers[index].passwordChangedAt = new Date().toISOString();
		}
	},

	async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
		await delay(600);
		const index = mockUsers.findIndex((u) => u.id === userId);
		if (index === -1) throw new Error('使用者不存在');

		// 檢查 email 是否已被其他使用者使用
		if (data.email) {
			const emailExists = mockUsers.some(
				(u) => u.id !== userId && u.email === data.email
			);
			if (emailExists) {
				throw new Error('此電子郵件已被使用');
			}
		}

		mockUsers[index] = {
			...mockUsers[index],
			...data,
			updatedAt: new Date().toISOString()
		};
		return mockUsers[index];
	},

	async uploadAvatar(userId: string, _file: File): Promise<string> {
		await delay(800);
		// Mock: 回傳一個假的頭像 URL
		// 實際應用中會上傳到 S3/GCS 等雲端儲存
		const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}-${Date.now()}`;

		const index = mockUsers.findIndex((u) => u.id === userId);
		if (index !== -1) {
			mockUsers[index].avatar = avatarUrl;
		}

		return avatarUrl;
	}
};
