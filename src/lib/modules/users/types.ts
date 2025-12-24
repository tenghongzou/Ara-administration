/**
 * Users 模組類型定義
 */

import type { User } from '$lib/types';

// ==================== 篩選相關 ====================

export interface UserFilters {
	search?: string;
	role?: string;
	status?: string;
}

export interface UserSortOptions {
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
}

// ==================== 表單相關 ====================

export interface UserFormData {
	name: string;
	email: string;
	username: string;
	role: string;
	status: string;
	avatar?: string;
}

export interface UserFormErrors {
	name?: string;
	email?: string;
	username?: string;
	role?: string;
}

// ==================== 選項定義 ====================

export interface SelectOption<T = string> {
	value: T;
	label: string;
}

export const roleFilterOptions: SelectOption[] = [
	{ value: '', label: '全部角色' },
	{ value: 'admin', label: '管理員' },
	{ value: 'editor', label: '編輯者' },
	{ value: 'viewer', label: '檢視者' }
];

export const statusFilterOptions: SelectOption[] = [
	{ value: '', label: '全部狀態' },
	{ value: 'active', label: '啟用' },
	{ value: 'inactive', label: '停用' },
	{ value: 'pending', label: '待審核' }
];

export const roleFormOptions: SelectOption[] = [
	{ value: 'admin', label: '管理員' },
	{ value: 'editor', label: '編輯者' },
	{ value: 'viewer', label: '檢視者' }
];

export const statusFormOptions: SelectOption[] = [
	{ value: 'active', label: '啟用' },
	{ value: 'inactive', label: '停用' },
	{ value: 'pending', label: '待審核' }
];

// ==================== 標籤和顏色映射 ====================

export const roleLabels: Record<string, string> = {
	admin: '管理員',
	editor: '編輯者',
	viewer: '檢視者'
};

export const statusLabels: Record<string, string> = {
	active: '啟用',
	inactive: '停用',
	pending: '待審核'
};

export const statusColors: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
	active: 'success',
	inactive: 'error',
	pending: 'warning'
};
