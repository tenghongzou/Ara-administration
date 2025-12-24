/**
 * 安全設定 API 模組
 * 處理 Session 管理、兩步驟驗證等
 */

import type { LoginSession, TwoFactorSetup } from '$lib/types';
import { mockUsers } from '../mock-data';
import { delay } from '../core';

// Mock sessions data
let mockSessions: LoginSession[] = [
	{
		id: '1',
		userId: '1',
		device: 'Desktop',
		browser: 'Chrome 120',
		os: 'Windows 11',
		ip: '192.168.1.100',
		location: '台北, 台灣',
		lastActiveAt: new Date().toISOString(),
		createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		isCurrent: true
	},
	{
		id: '2',
		userId: '1',
		device: 'Mobile',
		browser: 'Safari 17',
		os: 'iOS 17',
		ip: '192.168.1.101',
		location: '新北, 台灣',
		lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
		isCurrent: false
	},
	{
		id: '3',
		userId: '1',
		device: 'Laptop',
		browser: 'Firefox 121',
		os: 'macOS Sonoma',
		ip: '192.168.1.102',
		location: '台中, 台灣',
		lastActiveAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
		createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		isCurrent: false
	}
];

export const securityApi = {
	// 取得登入裝置列表
	async getSessions(userId: string): Promise<LoginSession[]> {
		await delay(500);
		return mockSessions
			.filter((s) => s.userId === userId)
			.sort((a, b) => {
				// Current session first, then by lastActiveAt
				if (a.isCurrent) return -1;
				if (b.isCurrent) return 1;
				return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
			});
	},

	// 登出指定裝置
	async revokeSession(sessionId: string): Promise<void> {
		await delay(400);
		const index = mockSessions.findIndex((s) => s.id === sessionId);
		if (index === -1) throw new Error('Session 不存在');
		if (mockSessions[index].isCurrent) throw new Error('無法登出目前使用的裝置');
		mockSessions.splice(index, 1);
	},

	// 登出所有其他裝置
	async revokeAllOtherSessions(userId: string): Promise<number> {
		await delay(600);
		const before = mockSessions.length;
		mockSessions = mockSessions.filter((s) => s.userId !== userId || s.isCurrent);
		return before - mockSessions.length;
	},

	// 設定兩步驟驗證 (產生 secret 和 QR code)
	async setup2FA(userId: string): Promise<TwoFactorSetup> {
		await delay(800);

		// 產生模擬的 secret (實際應該用 speakeasy 或類似的庫)
		const secret = 'JBSWY3DPEHPK3PXP'; // Mock secret
		const appName = encodeURIComponent('Ara Admin');
		const userEmail = mockUsers.find((u) => u.id === userId)?.email || 'user@example.com';

		// 產生備份碼
		const backupCodes = Array.from({ length: 8 }, () =>
			Math.random().toString(36).substring(2, 6).toUpperCase() +
			'-' +
			Math.random().toString(36).substring(2, 6).toUpperCase()
		);

		return {
			secret,
			qrCodeUrl: `otpauth://totp/${appName}:${userEmail}?secret=${secret}&issuer=${appName}`,
			backupCodes
		};
	},

	// 驗證並啟用兩步驟驗證
	async verify2FA(userId: string, code: string, secret: string): Promise<boolean> {
		await delay(600);

		// Mock 驗證 (實際應該驗證 TOTP)
		if (code.length !== 6 || !/^\d{6}$/.test(code)) {
			throw new Error('驗證碼格式錯誤');
		}

		// 模擬：接受任何 6 位數字
		const index = mockUsers.findIndex((u) => u.id === userId);
		if (index !== -1) {
			mockUsers[index].twoFactorEnabled = true;
			mockUsers[index].twoFactorSecret = secret;
		}

		return true;
	},

	// 停用兩步驟驗證
	async disable2FA(userId: string, password: string): Promise<void> {
		await delay(600);

		// 驗證密碼
		if (password !== 'admin123') {
			throw new Error('密碼錯誤');
		}

		const index = mockUsers.findIndex((u) => u.id === userId);
		if (index !== -1) {
			mockUsers[index].twoFactorEnabled = false;
			mockUsers[index].twoFactorSecret = undefined;
		}
	},

	// 取得兩步驟驗證狀態
	async get2FAStatus(userId: string): Promise<{ enabled: boolean; enabledAt?: string }> {
		await delay(300);
		const user = mockUsers.find((u) => u.id === userId);
		return {
			enabled: user?.twoFactorEnabled || false,
			enabledAt: user?.twoFactorEnabled ? user.updatedAt : undefined
		};
	},

	// 重新產生備份碼
	async regenerateBackupCodes(userId: string, password: string): Promise<string[]> {
		await delay(600);

		if (password !== 'admin123') {
			throw new Error('密碼錯誤');
		}

		return Array.from({ length: 8 }, () =>
			Math.random().toString(36).substring(2, 6).toUpperCase() +
			'-' +
			Math.random().toString(36).substring(2, 6).toUpperCase()
		);
	}
};
