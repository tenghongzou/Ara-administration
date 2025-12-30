import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合併 Tailwind CSS 類別名稱
 * 使用 clsx 處理條件類別，使用 tailwind-merge 處理衝突
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * 生成 UUID v4
 * 優先使用 crypto.randomUUID()，在不支援的環境下使用 fallback
 */
export function generateUUID(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	// Fallback for environments without crypto.randomUUID (e.g., non-HTTPS)
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export * from './export';
export * from './error';
export * from './theme';
