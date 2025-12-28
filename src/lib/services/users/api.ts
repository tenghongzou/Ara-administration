/**
 * 使用者管理 API 模組
 */

import type { User, PaginatedData } from '$lib/types';
import { httpClient, HttpError } from '../core/http-client';

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
	user: User;
}

export const usersApi = {
	async getUsers(params: GetUsersParams = {}): Promise<PaginatedData<User>> {
		const searchParams = new URLSearchParams();

		if (params.page) searchParams.set('page', String(params.page));
		if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
		if (params.search) searchParams.set('search', params.search);
		if (params.role) searchParams.set('role', params.role);
		if (params.status) searchParams.set('status', params.status);
		if (params.sortBy) searchParams.set('sortBy', params.sortBy);
		if (params.sortDirection) searchParams.set('sortDirection', params.sortDirection);

		const query = searchParams.toString();
		const response = await httpClient.get<UsersResponse>(`/users${query ? `?${query}` : ''}`);

		return {
			data: response.data,
			pagination: response.pagination
		};
	},

	async getUser(id: string): Promise<User> {
		try {
			const response = await httpClient.get<UserResponse>(`/users/${id}`);
			return response.user;
		} catch (error) {
			if (error instanceof HttpError && error.status === 404) {
				throw new Error('使用者不存在');
			}
			throw error;
		}
	},

	async createUser(data: CreateUserData): Promise<User> {
		try {
			const response = await httpClient.post<UserResponse>('/users', data);
			return response.user;
		} catch (error) {
			if (error instanceof HttpError) {
				const errorMessages: Record<string, string> = {
					'Username already exists': '使用者名稱已存在',
					'Email already exists': '電子郵件已被使用',
					'Role not found': '角色不存在'
				};
				throw new Error(errorMessages[error.error] || error.error);
			}
			throw error;
		}
	},

	async updateUser(id: string, data: UpdateUserData): Promise<User> {
		try {
			const response = await httpClient.patch<UserResponse>(`/users/${id}`, data);
			return response.user;
		} catch (error) {
			if (error instanceof HttpError) {
				if (error.status === 404) {
					throw new Error('使用者不存在');
				}
				const errorMessages: Record<string, string> = {
					'Username already exists': '使用者名稱已存在',
					'Email already exists': '電子郵件已被使用',
					'Role not found': '角色不存在',
					'Invalid status': '無效的狀態'
				};
				throw new Error(errorMessages[error.error] || error.error);
			}
			throw error;
		}
	},

	async deleteUser(id: string): Promise<void> {
		try {
			await httpClient.delete(`/users/${id}`);
		} catch (error) {
			if (error instanceof HttpError) {
				if (error.status === 404) {
					throw new Error('使用者不存在');
				}
				if (error.error.includes('super admin')) {
					throw new Error('無法刪除超級管理員帳號');
				}
				if (error.error.includes('own account')) {
					throw new Error('無法刪除自己的帳號');
				}
			}
			throw error;
		}
	},

	async changePassword(
		id: string,
		currentPassword: string | null,
		newPassword: string
	): Promise<void> {
		try {
			await httpClient.post(`/users/${id}/change-password`, {
				currentPassword,
				newPassword
			});
		} catch (error) {
			if (error instanceof HttpError) {
				if (error.error.includes('Current password')) {
					throw new Error('目前密碼錯誤');
				}
				if (error.error.includes('at least')) {
					throw new Error('新密碼至少需要 6 個字元');
				}
			}
			throw error;
		}
	},

	async uploadAvatar(id: string, file: File): Promise<string> {
		const formData = new FormData();
		formData.append('avatar', file);

		const response = await httpClient.upload<{ avatarUrl: string }>(
			`/users/${id}/avatar`,
			formData
		);
		return response.avatarUrl;
	}
};
