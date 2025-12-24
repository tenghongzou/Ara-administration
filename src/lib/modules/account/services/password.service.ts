/**
 * Password 服務
 * 負責密碼管理的業務邏輯
 */

import { authApi } from '$lib/services';
import type { PasswordChangeFormData, PasswordValidation } from '../types';

class PasswordService {
	/**
	 * 變更密碼
	 */
	async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
		return authApi.changePassword(userId, currentPassword, newPassword);
	}

	/**
	 * 驗證密碼強度
	 */
	validatePassword(password: string): PasswordValidation {
		const hasLength = password.length >= 8;
		const hasLower = /[a-z]/.test(password);
		const hasUpper = /[A-Z]/.test(password);
		const hasDigit = /\d/.test(password);
		const isValid = hasLength && hasLower && hasUpper && hasDigit;

		return {
			hasLength,
			hasLower,
			hasUpper,
			hasDigit,
			isValid
		};
	}

	/**
	 * 驗證密碼變更表單
	 */
	validateChangeForm(form: PasswordChangeFormData): string | null {
		if (!form.current) {
			return '請輸入目前密碼';
		}

		if (!form.new) {
			return '請輸入新密碼';
		}

		const validation = this.validatePassword(form.new);
		if (!validation.isValid) {
			if (!validation.hasLength) {
				return '新密碼至少需要 8 個字元';
			}
			return '密碼需包含大小寫字母和數字';
		}

		if (form.new !== form.confirm) {
			return '新密碼與確認密碼不一致';
		}

		return null;
	}

	/**
	 * 計算密碼變更天數
	 */
	getPasswordChangeDays(passwordChangedAt: string | undefined): number | null {
		if (!passwordChangedAt) return null;

		const days = Math.floor(
			(Date.now() - new Date(passwordChangedAt).getTime()) / (1000 * 60 * 60 * 24)
		);
		return days;
	}

	/**
	 * 取得密碼變更描述
	 */
	getPasswordChangeDescription(passwordChangedAt: string | undefined): string {
		const days = this.getPasswordChangeDays(passwordChangedAt);

		if (days === null) {
			return '尚未變更過密碼';
		}

		if (days === 0) {
			return '今天已變更';
		}

		return `上次變更於 ${days} 天前`;
	}
}

export const passwordService = new PasswordService();
