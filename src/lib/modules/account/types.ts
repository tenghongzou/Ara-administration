/**
 * Account 模組類型定義
 */

// 重新匯出基礎類型
export type { User, LoginSession, TwoFactorSetup, UpdateProfileData } from '$lib/types';

/**
 * 個人資料表單資料
 */
export interface ProfileFormData {
	name: string;
	email: string;
	phone?: string;
	birthday?: string;
	bio?: string;
	avatar?: string;
}

/**
 * 密碼變更表單資料
 */
export interface PasswordChangeFormData {
	current: string;
	new: string;
	confirm: string;
}

/**
 * 密碼驗證結果
 */
export interface PasswordValidation {
	hasLength: boolean;
	hasLower: boolean;
	hasUpper: boolean;
	hasDigit: boolean;
	isValid: boolean;
}

/**
 * 兩步驟驗證設定步驟
 */
export type TwoFactorStep = 'setup' | 'verify' | 'backup';

/**
 * 登入裝置資訊
 */
export interface DeviceInfo {
	type: 'desktop' | 'mobile' | 'tablet';
	icon: string;
}

/**
 * 帳號刪除確認
 */
export interface DeleteAccountConfirmation {
	confirmText: string;
	isValid: boolean;
}
