/**
 * 角色管理 API 模組
 */

import type { Role, CreateRoleData, UpdateRoleData, PaginatedData } from '$lib/types';
import { mockRoles, mockUsers } from '../mock-data';
import { type Permission, allPermissions } from '$lib/permissions';
import { delay, createPaginatedResponse, filterBySearch } from '../core';

export interface GetRolesParams {
	page?: number;
	pageSize?: number;
	search?: string;
}

export const rolesApi = {
	async getRoles(params: GetRolesParams = {}): Promise<PaginatedData<Role>> {
		await delay(400);

		const { page = 1, pageSize = 50, search } = params;

		let filtered = mockRoles.map((role) => ({
			...role,
			userCount: mockUsers.filter((u) => u.role === role.key).length
		}));

		// 搜尋過濾
		if (search) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter(
				(role) =>
					role.label.toLowerCase().includes(searchLower) ||
					role.key.toLowerCase().includes(searchLower) ||
					role.description.toLowerCase().includes(searchLower)
			);
		}

		return createPaginatedResponse(filtered, filtered, page, pageSize);
	},

	async getRole(id: string): Promise<Role> {
		await delay(300);

		const role = mockRoles.find((r) => r.id === id || r.key === id);
		if (!role) throw new Error('角色不存在');

		return {
			...role,
			userCount: mockUsers.filter((u) => u.role === role.key).length
		};
	},

	async getRoleByKey(key: string): Promise<Role | null> {
		await delay(200);
		const role = mockRoles.find((r) => r.key === key);
		if (!role) return null;
		return {
			...role,
			userCount: mockUsers.filter((u) => u.role === role.key).length
		};
	},

	async createRole(data: CreateRoleData): Promise<Role> {
		await delay(600);

		// 檢查 key 是否重複
		if (mockRoles.some((r) => r.key === data.key)) {
			throw new Error('角色識別碼已存在');
		}

		// 驗證權限
		const validPermissions = data.permissions.filter((p) =>
			allPermissions.includes(p as Permission)
		);

		const now = new Date().toISOString();
		const newRole: Role = {
			id: String(Date.now()),
			key: data.key,
			label: data.label,
			description: data.description,
			color: data.color || 'gray',
			permissions: validPermissions,
			isSystem: false,
			userCount: 0,
			createdAt: now,
			updatedAt: now
		};

		mockRoles.push(newRole);
		return newRole;
	},

	async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
		await delay(500);

		const index = mockRoles.findIndex((r) => r.id === id || r.key === id);
		if (index === -1) throw new Error('角色不存在');

		const role = mockRoles[index];

		// 系統角色只能修改權限，不能修改名稱等
		if (role.isSystem && role.key === 'admin') {
			throw new Error('無法修改系統管理員角色');
		}

		// 驗證權限
		let permissions = role.permissions;
		if (data.permissions) {
			permissions = data.permissions.filter((p) =>
				allPermissions.includes(p as Permission)
			);
		}

		mockRoles[index] = {
			...role,
			label: data.label ?? role.label,
			description: data.description ?? role.description,
			color: data.color ?? role.color,
			permissions,
			updatedAt: new Date().toISOString()
		};

		return {
			...mockRoles[index],
			userCount: mockUsers.filter((u) => u.role === role.key).length
		};
	},

	async deleteRole(id: string): Promise<void> {
		await delay(400);

		const index = mockRoles.findIndex((r) => r.id === id || r.key === id);
		if (index === -1) throw new Error('角色不存在');

		const role = mockRoles[index];

		if (role.isSystem) {
			throw new Error('無法刪除系統內建角色');
		}

		// 檢查是否有使用者正在使用此角色
		const usersWithRole = mockUsers.filter((u) => u.role === role.key);
		if (usersWithRole.length > 0) {
			throw new Error(`無法刪除：有 ${usersWithRole.length} 位使用者正在使用此角色`);
		}

		mockRoles.splice(index, 1);
	},

	async getRolePermissions(roleKey: string): Promise<string[]> {
		await delay(200);

		const role = mockRoles.find((r) => r.key === roleKey);
		if (!role) return [];

		return [...role.permissions];
	}
};
