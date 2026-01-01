/**
 * 角色管理 API 模組
 */

import type { Role, CreateRoleData, UpdateRoleData, PaginatedData } from '$lib/types';
import { apiClient, ApiError } from '../core/api-client';

// ============================================================================
// Types
// ============================================================================

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

// apiClient 自動解包 data，因此類型定義直接反映解包後的結構

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

// ============================================================================
// Error Messages
// ============================================================================

const ERROR_MESSAGES: Record<string, string> = {
	'Role key already exists': '角色識別碼已存在',
	'Fields key and label are required': '角色識別碼和名稱為必填',
	'Cannot change key of system role': '無法修改系統角色的識別碼'
};

// ============================================================================
// Roles API
// ============================================================================

export const rolesApi = {
	/**
	 * 取得角色列表
	 */
	async getRoles(params: GetRolesParams = {}): Promise<PaginatedData<Role>> {
		const searchParams = new URLSearchParams();

		if (params.page) searchParams.set('page', String(params.page));
		if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
		if (params.search) searchParams.set('search', params.search);
		if (params.sortBy) searchParams.set('sortBy', params.sortBy);
		if (params.sortDirection) searchParams.set('sortDirection', params.sortDirection);

		const query = searchParams.toString();
		const response = await apiClient.get<RolesResponse>(`/roles${query ? `?${query}` : ''}`);

		return {
			data: response.data,
			pagination: response.pagination
		};
	},

	/**
	 * 取得單一角色
	 */
	async getRole(id: string): Promise<Role> {
		try {
			// apiClient 自動解包 { data: Role } 回應
			return await apiClient.get<Role>(`/roles/${id}`);
		} catch (error) {
			if (error instanceof ApiError && error.isNotFound()) {
				throw new Error('角色不存在');
			}
			throw error;
		}
	},

	/**
	 * 依識別碼取得角色
	 */
	async getRoleByKey(key: string): Promise<Role | null> {
		try {
			// apiClient 自動解包 { data: Role } 回應
			return await apiClient.get<Role>(`/roles/${key}`);
		} catch (error) {
			if (error instanceof ApiError && error.isNotFound()) {
				return null;
			}
			throw error;
		}
	},

	/**
	 * 建立角色
	 */
	async createRole(data: CreateRoleData): Promise<Role> {
		try {
			// apiClient 自動解包 { data: Role } 回應
			return await apiClient.post<Role>('/roles', data);
		} catch (error) {
			if (error instanceof ApiError) {
				throw new Error(ERROR_MESSAGES[error.message] || error.message);
			}
			throw error;
		}
	},

	/**
	 * 更新角色
	 */
	async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
		try {
			// apiClient 自動解包 { data: Role } 回應
			return await apiClient.patch<Role>(`/roles/${id}`, data);
		} catch (error) {
			if (error instanceof ApiError) {
				if (error.isNotFound()) {
					throw new Error('角色不存在');
				}
				throw new Error(ERROR_MESSAGES[error.message] || error.message);
			}
			throw error;
		}
	},

	/**
	 * 刪除角色
	 */
	async deleteRole(id: string): Promise<void> {
		try {
			await apiClient.delete(`/roles/${id}`);
		} catch (error) {
			if (error instanceof ApiError) {
				if (error.isNotFound()) {
					throw new Error('角色不存在');
				}
				if (error.message.includes('system role')) {
					throw new Error('無法刪除系統內建角色');
				}
				if (error.message.includes('assigned users')) {
					throw new Error('無法刪除：有使用者正在使用此角色，請先重新分配');
				}
			}
			throw error;
		}
	},

	/**
	 * 取得角色的權限列表
	 */
	async getRolePermissions(roleKey: string): Promise<string[]> {
		try {
			// apiClient 自動解包 { data: Role } 回應
			const role = await apiClient.get<Role>(`/roles/${roleKey}`);
			return role.permissions;
		} catch {
			return [];
		}
	},

	/**
	 * 獲取所有權限（按分組）
	 */
	async getPermissions(): Promise<PermissionGroup[]> {
		return apiClient.get<PermissionGroup[]>('/permissions');
	},

	/**
	 * 獲取所有權限（扁平列表）
	 */
	async getPermissionsFlat(): Promise<Permission[]> {
		return apiClient.get<Permission[]>('/permissions/flat');
	}
};
