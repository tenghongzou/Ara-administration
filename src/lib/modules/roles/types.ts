/**
 * Roles 模組類型定義
 */

import type { Role } from '$lib/types';

// ==================== 篩選相關 ====================

export interface RoleFilters {
	search?: string;
	isSystem?: boolean;
}

// ==================== 表單相關 ====================

export interface RoleFormData {
	key: string;
	label: string;
	description: string;
	color: string;
	permissions: string[];
}

export interface RoleFormErrors {
	key?: string;
	label?: string;
}

// ==================== 選項定義 ====================

export interface SelectOption<T = string> {
	value: T;
	label: string;
}

export interface ColorOption {
	value: string;
	label: string;
	class: string;
}

export const roleTypeOptions: SelectOption[] = [
	{ value: '', label: '全部類型' },
	{ value: 'system', label: '系統角色' },
	{ value: 'custom', label: '自訂角色' }
];

// ==================== Badge 變體映射 ====================

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';

export const colorToBadgeVariant: Record<string, BadgeVariant> = {
	red: 'error',
	orange: 'warning',
	amber: 'warning',
	yellow: 'warning',
	green: 'success',
	emerald: 'success',
	teal: 'info',
	cyan: 'info',
	sky: 'info',
	blue: 'info',
	indigo: 'info',
	violet: 'info',
	purple: 'info',
	pink: 'error',
	rose: 'error',
	gray: 'default'
};
