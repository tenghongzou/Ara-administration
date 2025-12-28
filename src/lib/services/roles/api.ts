/**
 * 角色管理 API 模組
 */

import type { Role, CreateRoleData, UpdateRoleData, PaginatedData } from '$lib/types';
import { httpClient, HttpError } from '../core/http-client';

export interface GetRolesParams {
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
}

interface RolesResponse {
	data: Role[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
}

interface RoleResponse {
	role: Role;
}

export interface PermissionGroup {
	key: string;
	label: string;
	permissions: Permission[];
}

export interface Permission {
	id: string;
	key: string;
	label: string;
	groupKey: string;
	groupLabel: string;
}

export const rolesApi = {
	async getRoles(params: GetRolesParams = {}): Promise<PaginatedData<Role>> {
		const searchParams = new URLSearchParams();

		if (params.page) searchParams.set('page', String(params.page));
		if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
		if (params.search) searchParams.set('search', params.search);
		if (params.sortBy) searchParams.set('sortBy', params.sortBy);
		if (params.sortDirection) searchParams.set('sortDirection', params.sortDirection);

		const query = searchParams.toString();
		const response = await httpClient.get<RolesResponse>(`/roles${query ? `?${query}` : ''}`);

		return {
			data: response.data,
			pagination: response.pagination
		};
	},

	async getRole(id: string): Promise<Role> {
		try {
			const response = await httpClient.get<RoleResponse>(`/roles/${id}`);
			return response.role;
		} catch (error) {
			if (error instanceof HttpError && error.status === 404) {
				throw new Error('角色不存在');
			}
			throw error;
		}
	},

	async getRoleByKey(key: string): Promise<Role | null> {
		try {
			const response = await httpClient.get<RoleResponse>(`/roles/${key}`);
			return response.role;
		} catch (error) {
			if (error instanceof HttpError && error.status === 404) {
				return null;
			}
			throw error;
		}
	},

	async createRole(data: CreateRoleData): Promise<Role> {
		try {
			const response = await httpClient.post<RoleResponse>('/roles', data);
			return response.role;
		} catch (error) {
			if (error instanceof HttpError) {
				const errorMessages: Record<string, string> = {
					'Role key already exists': '角色識別碼已存在',
					'Fields key and label are required': '角色識別碼和名稱為必填'
				};
				throw new Error(errorMessages[error.error] || error.error);
			}
			throw error;
		}
	},

	async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
		try {
			const response = await httpClient.patch<RoleResponse>(`/roles/${id}`, data);
			return response.role;
		} catch (error) {
			if (error instanceof HttpError) {
				if (error.status === 404) {
					throw new Error('角色不存在');
				}
				const errorMessages: Record<string, string> = {
					'Role key already exists': '角色識別碼已存在',
					'Cannot change key of system role': '無法修改系統角色的識別碼'
				};
				throw new Error(errorMessages[error.error] || error.error);
			}
			throw error;
		}
	},

	async deleteRole(id: string): Promise<void> {
		try {
			await httpClient.delete(`/roles/${id}`);
		} catch (error) {
			if (error instanceof HttpError) {
				if (error.status === 404) {
					throw new Error('角色不存在');
				}
				if (error.error.includes('system role')) {
					throw new Error('無法刪除系統內建角色');
				}
				if (error.error.includes('assigned users')) {
					throw new Error('無法刪除：有使用者正在使用此角色，請先重新分配');
				}
			}
			throw error;
		}
	},

	async getRolePermissions(roleKey: string): Promise<string[]> {
		try {
			const response = await httpClient.get<RoleResponse>(`/roles/${roleKey}`);
			return response.role.permissions;
		} catch {
			return [];
		}
	},

	/**
	 * 獲取所有權限（按分組）
	 */
	async getPermissions(): Promise<PermissionGroup[]> {
		const response = await httpClient.get<{ data: PermissionGroup[] }>('/permissions');
		return response.data;
	},

	/**
	 * 獲取所有權限（扁平列表）
	 */
	async getPermissionsFlat(): Promise<Permission[]> {
		const response = await httpClient.get<{ data: Permission[] }>('/permissions/flat');
		return response.data;
	}
};
