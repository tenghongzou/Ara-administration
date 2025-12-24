import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合併 Tailwind CSS 類別名稱
 * 使用 clsx 處理條件類別，使用 tailwind-merge 處理衝突
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export * from './export';
export * from './error';
export * from './theme';
