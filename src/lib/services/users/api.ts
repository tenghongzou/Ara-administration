/**
 * 使用者管理 API 模組
 */

import type { User, PaginatedData } from '$lib/types';
import { apiClient, ApiError } from '../core/api-client';
import { config } from '$lib/constants';
import { mockUsersApi } from '$lib/mock';

// ============================================================================
// Types
// ============================================================================

export interface GetUsersParams {
	page?: number;
	pageSize?: number;
	search?: string;
	role?: string;
	status?: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
}

export interface CreateUserData {
	username: string;
	email: string;
	name: string;
	password: string;
	role: string;
	status?: string;
	phone?: string;
	bio?: string;
	avatar?: string;
	birthday?: string;
}

export interface UpdateUserData {
	username?: string;
	email?: string;
	name?: string;
	role?: string;
	status?: string;
	phone?: string;
	bio?: string;
	avatar?: string;
	birthday?: string;
}

interface UsersResponse {
	data: User[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
}

interface UserResponse {
	data: {
		user: User;
	};
}

// ============================================================================
// Error Messages
// ============================================================================

const ERROR_MESSAGES: Record<string, string> = {
	'Username already exists': '使用者名稱已存在',
	'Email already exists': '電子郵件已被使用',
	'Role not found': '角色不存在',
	'Invalid status': '無效的狀態'
};

// ============================================================================
// Users API
// ============================================================================

export const usersApi = {
	/**
	 * 取得使用者列表
	 */
	async getUsers(params: GetUsersParams = {}): Promise<PaginatedData<User>> {
		if (config.isMockMode) {
			return mockUsersApi.getUsers(params);
		}

		const searchParams = new URLSearchParams();

		if (params.page) searchParams.set('page', String(params.page));
		if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
		if (params.search) searchParams.set('search', params.search);
		if (params.role) searchParams.set('role', params.role);
		if (params.status) searchParams.set('status', params.status);
		if (params.sortBy) searchParams.set('sortBy', params.sortBy);
		if (params.sortDirection) searchParams.set('sortDirection', params.sortDirection);

		const query = searchParams.toString();
		const response = await apiClient.get<UsersResponse>(`/users${query ? `?${query}` : ''}`);

		return {
			data: response.data,
			pagination: response.pagination
		};
	},

	/**
	 * 取得單一使用者
	 */
	async getUser(id: string): Promise<User> {
		if (config.isMockMode) {
			return mockUsersApi.getUser(id);
		}

		try {
			const response = await apiClient.get<UserResponse>(`/users/${id}`);
			return response.data.user;
		} catch (error) {
			if (error instanceof ApiError && error.isNotFound()) {
				throw new Error('使用者不存在');
			}
			throw error;
		}
	},

	/**
	 * 建立使用者
	 */
	async createUser(data: CreateUserData): Promise<User> {
		if (config.isMockMode) {
			return mockUsersApi.createUser(data);
		}

		try {
			const response = await apiClient.post<UserResponse>('/users', data);
			return response.data.user;
		} catch (error) {
			if (error instanceof ApiError) {
				throw new Error(ERROR_MESSAGES[error.message] || error.message);
			}
			throw error;
		}
	},

	/**
	 * 更新使用者
	 */
	async updateUser(id: string, data: UpdateUserData): Promise<User> {
		if (config.isMockMode) {
			return mockUsersApi.updateUser(id, data);
		}

		try {
			const response = await apiClient.patch<UserResponse>(`/users/${id}`, data);
			return response.data.user;
		} catch (error) {
			if (error instanceof ApiError) {
				if (error.isNotFound()) {
					throw new Error('使用者不存在');
				}
				throw new Error(ERROR_MESSAGES[error.message] || error.message);
			}
			throw error;
		}
	},

	/**
	 * 刪除使用者
	 */
	async deleteUser(id: string): Promise<void> {
		if (config.isMockMode) {
			return mockUsersApi.deleteUser(id);
		}

		try {
			await apiClient.delete(`/users/${id}`);
		} catch (error) {
			if (error instanceof ApiError) {
				if (error.isNotFound()) {
					throw new Error('使用者不存在');
				}
				if (error.message.includes('super admin')) {
					throw new Error('無法刪除超級管理員帳號');
				}
				if (error.message.includes('own account')) {
					throw new Error('無法刪除自己的帳號');
				}
			}
			throw error;
		}
	},

	/**
	 * 變更使用者密碼
	 */
	async changePassword(
		id: string,
		currentPassword: string | null,
		newPassword: string
	): Promise<void> {
		try {
			await apiClient.post(`/users/${id}/change-password`, {
				currentPassword,
				newPassword
			});
		} catch (error) {
			if (error instanceof ApiError) {
				if (error.message.includes('Current password')) {
					throw new Error('目前密碼錯誤');
				}
				if (error.message.includes('at least')) {
					throw new Error('新密碼至少需要 6 個字元');
				}
			}
			throw error;
		}
	},

	/**
	 * 上傳使用者頭像
	 */
	async uploadAvatar(id: string, file: File): Promise<string> {
		const formData = new FormData();
		formData.append('avatar', file);

		const response = await apiClient.upload<{ data: { avatarUrl: string } }>(
			`/users/${id}/avatar`,
			formData
		);
		return response.data.avatarUrl;
	}
};
