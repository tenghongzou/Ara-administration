/**
 * 安全設定 API 模組
 * 處理 Session 管理、兩步驟驗證等
 */

import type { LoginSession, TwoFactorSetup, User } from '$lib/types';
import { mockUsers } from '../mock-data';
import { delay, apiClient, ApiError } from '../core';
import { config } from '$lib/constants';

/**
 * Check if mock mode is active.
 * In non-mock mode 2FA talks to /auth/2fa/* and session management to
 * /auth/sessions* on the real backend.
 */
function isMockMode(): boolean {
	return config.isMockMode;
}

/** Translate a wrong-password ApiError into the UI's expected message. */
function translatePasswordError(error: unknown): never {
	if (error instanceof ApiError && error.status === 401) {
		throw new Error('密碼錯誤');
	}
	throw error;
}

// Mock sessions data — only allocated in dev builds
let mockSessions: LoginSession[] | undefined;

function getMockSessions(): LoginSession[] {
	if (!mockSessions) {
		mockSessions = [
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
	}
	return mockSessions;
}

/**
 * Validate a mock password. Only available in development mode.
 * In production builds, Vite statically replaces the condition and
 * tree-shakes the hardcoded credential.
 */
function validateMockPassword(password: string): boolean {
	if (import.meta.env.DEV) {
		return password === 'admin123';
	}
	throw new Error('Mock password validation is not available in production');
}

/**
 * Get a mock TOTP secret. Only available in development mode.
 */
function getMockTotpSecret(): string {
	if (import.meta.env.DEV) {
		return 'JBSWY3DPEHPK3PXP';
	}
	throw new Error('Mock TOTP secret is not available in production');
}

export const securityApi = {
	// 取得登入裝置列表
	async getSessions(userId: string): Promise<LoginSession[]> {
		if (!isMockMode()) {
			return apiClient.get<LoginSession[]>('/auth/sessions');
		}
		await delay(500);
		return getMockSessions()
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
		if (!isMockMode()) {
			try {
				await apiClient.delete(`/auth/sessions/${sessionId}`);
				return;
			} catch (error) {
				if (error instanceof ApiError && error.code === 'CURRENT_SESSION') {
					throw new Error('無法登出目前使用的裝置');
				}
				if (error instanceof ApiError && error.status === 404) {
					throw new Error('Session 不存在');
				}
				throw error;
			}
		}
		await delay(400);
		const sessions = getMockSessions();
		const index = sessions.findIndex((s) => s.id === sessionId);
		if (index === -1) throw new Error('Session 不存在');
		if (sessions[index].isCurrent) throw new Error('無法登出目前使用的裝置');
		sessions.splice(index, 1);
	},

	// 登出所有其他裝置
	async revokeAllOtherSessions(userId: string): Promise<number> {
		if (!isMockMode()) {
			const result = await apiClient.post<{ revoked: number }>('/auth/sessions/revoke-others', {});
			return result.revoked;
		}
		await delay(600);
		const sessions = getMockSessions();
		const before = sessions.length;
		mockSessions = sessions.filter((s) => s.userId !== userId || s.isCurrent);
		return before - mockSessions.length;
	},

	// 設定兩步驟驗證 (產生 secret 和 QR code)
	async setup2FA(userId: string): Promise<TwoFactorSetup> {
		if (!isMockMode()) {
			return apiClient.post<TwoFactorSetup>('/auth/2fa/setup', {});
		}
		await delay(800);

		const secret = getMockTotpSecret();
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
		if (!isMockMode()) {
			try {
				await apiClient.post<{ enabled: boolean }>('/auth/2fa/confirm', { code });
				return true;
			} catch (error) {
				if (error instanceof ApiError && error.code === 'INVALID_2FA_CODE') {
					throw new Error('驗證碼錯誤，請確認驗證器 App 中的最新代碼');
				}
				throw error;
			}
		}
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
		if (!isMockMode()) {
			try {
				await apiClient.post('/auth/2fa/disable', { password });
				return;
			} catch (error) {
				translatePasswordError(error);
			}
		}
		await delay(600);

		if (!validateMockPassword(password)) {
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
		if (!isMockMode()) {
			const user = await apiClient.get<User>('/auth/me');
			return { enabled: user.twoFactorEnabled ?? false };
		}
		await delay(300);
		const user = mockUsers.find((u) => u.id === userId);
		return {
			enabled: user?.twoFactorEnabled || false,
			enabledAt: user?.twoFactorEnabled ? user.updatedAt : undefined
		};
	},

	// 重新產生備份碼
	async regenerateBackupCodes(userId: string, password: string): Promise<string[]> {
		if (!isMockMode()) {
			try {
				const result = await apiClient.post<{ backupCodes: string[] }>('/auth/2fa/backup-codes', {
					password
				});
				return result.backupCodes;
			} catch (error) {
				translatePasswordError(error);
			}
		}
		await delay(600);

		if (!validateMockPassword(password)) {
			throw new Error('密碼錯誤');
		}

		return Array.from({ length: 8 }, () =>
			Math.random().toString(36).substring(2, 6).toUpperCase() +
			'-' +
			Math.random().toString(36).substring(2, 6).toUpperCase()
		);
	}
};
