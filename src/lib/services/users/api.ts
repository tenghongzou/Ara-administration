/**
 * 使用者管理 API 模組
 */

import type { User, PaginatedData } from '$lib/types';
import { mockUsers } from '../mock-data';
import { delay, createPaginatedResponse, sortByField, filterBySearch } from '../core';

export interface GetUsersParams {
	page?: number;
	pageSize?: number;
	search?: string;
	role?: string;
	status?: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
}

export const usersApi = {
	async getUsers(params: GetUsersParams = {}): Promise<PaginatedData<User>> {
		await delay(600);

		const { page = 1, pageSize = 10, search, role, status, sortBy, sortDirection = 'asc' } = params;

		let filtered = [...mockUsers];

		// 搜尋過濾
		filtered = filterBySearch(filtered, search, ['name', 'email']);

		// 角色過濾
		if (role) {
			filtered = filtered.filter((user) => user.role === role);
		}

		// 狀態過濾
		if (status) {
			filtered = filtered.filter((user) => user.status === status);
		}

		// 排序
		filtered = sortByField(filtered, sortBy, sortDirection);

		return createPaginatedResponse(mockUsers, filtered, page, pageSize);
	},

	async getUser(id: string): Promise<User> {
		await delay(400);
		const user = mockUsers.find((u) => u.id === id);
		if (!user) throw new Error('使用者不存在');
		return user;
	},

	async createUser(data: Partial<User>): Promise<User> {
		await delay(600);
		const newUser: User = {
			id: String(mockUsers.length + 1),
			username: data.username || data.email?.split('@')[0] || '',
			email: data.email || '',
			name: data.name || '',
			role: data.role || 'viewer',
			status: 'pending',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		mockUsers.push(newUser);
		return newUser;
	},

	async updateUser(id: string, data: Partial<User>): Promise<User> {
		await delay(500);
		const index = mockUsers.findIndex((u) => u.id === id);
		if (index === -1) throw new Error('使用者不存在');

		mockUsers[index] = {
			...mockUsers[index],
			...data,
			updatedAt: new Date().toISOString()
		};
		return mockUsers[index];
	},

	async deleteUser(id: string): Promise<void> {
		await delay(400);
		const index = mockUsers.findIndex((u) => u.id === id);
		if (index === -1) throw new Error('使用者不存在');
		mockUsers.splice(index, 1);
	}
};
