/**
 * Two-Factor Authentication 服務
 * 負責兩步驟驗證的業務邏輯
 */

import { securityApi } from '$lib/services';
import type { TwoFactorSetup } from '$lib/types';

class TwoFactorService {
	/**
	 * 設定兩步驟驗證
	 */
	async setup(userId: string): Promise<TwoFactorSetup> {
		return securityApi.setup2FA(userId);
	}

	/**
	 * 驗證並啟用兩步驟驗證
	 */
	async verify(userId: string, code: string, secret: string): Promise<boolean> {
		// 前端驗證
		if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
			throw new Error('請輸入 6 位數驗證碼');
		}

		return securityApi.verify2FA(userId, code, secret);
	}

	/**
	 * 停用兩步驟驗證
	 */
	async disable(userId: string, password: string): Promise<void> {
		if (!password) {
			throw new Error('請輸入密碼');
		}

		return securityApi.disable2FA(userId, password);
	}

	/**
	 * 取得兩步驟驗證狀態
	 */
	async getStatus(userId: string): Promise<{ enabled: boolean; enabledAt?: string }> {
		return securityApi.get2FAStatus(userId);
	}

	/**
	 * 重新產生備份碼
	 */
	async regenerateBackupCodes(userId: string, password: string): Promise<string[]> {
		if (!password) {
			throw new Error('請輸入密碼');
		}

		return securityApi.regenerateBackupCodes(userId, password);
	}

	/**
	 * 複製備份碼到剪貼簿
	 */
	async copyBackupCodes(codes: string[]): Promise<void> {
		const text = codes.join('\n');
		await navigator.clipboard.writeText(text);
	}

	/**
	 * 下載備份碼
	 */
	downloadBackupCodes(codes: string[]): void {
		const text = `Ara Admin 兩步驟驗證備份碼\n${'='.repeat(30)}\n\n${codes.join('\n')}\n\n請妥善保管這些備份碼，每個備份碼只能使用一次。`;
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'ara-admin-backup-codes.txt';
		a.click();
		URL.revokeObjectURL(url);
	}

	/**
	 * 驗證碼格式化（自動加入空格）
	 */
	formatCode(code: string): string {
		return code.replace(/\D/g, '').slice(0, 6);
	}
}

export const twoFactorService = new TwoFactorService();
