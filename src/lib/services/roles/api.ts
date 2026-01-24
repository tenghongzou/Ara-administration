/**
 * 角色管理 API 模組
 * 對接後端 /api/v1/roles 和 /api/v1/permissions 端點
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

/**
 * 權限群組結構
 * 對應後端 GET /api/v1/permissions 和 GET /api/v1/permissions/grouped 回應
 */
export interface PermissionGroup {
	key: string;
	label: string;
	permissions: Permission[];
}

/**
 * 單一權限結構
 * 對應後端 GET /api/v1/permissions/flat 回應中的每個項目
 */
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
	 * GET /api/v1/roles
	 *
	 * 回應格式：
	 * {
	 *   "data": [
	 *     {
	 *       "id": "uuid",
	 *       "key": "admin",
	 *       "label": "Administrator",
	 *       "description": "Full system access",
	 *       "color": "red",
	 *       "permissions": ["users:read", "users:create", ...],
	 *       "createdAt": "2023-01-01T00:00:00+00:00",
	 *       "updatedAt": "2024-01-01T00:00:00+00:00"
	 *     }
	 *   ]
	 * }
	 *
	 * 注意：後端目前返回 { data: [...] } 格式，apiClient 會自動解包成數組
	 */
	async getRoles(params: GetRolesParams = {}): Promise<PaginatedData<Role>> {
		const searchParams = new URLSearchParams();

		if (params.page) searchParams.set('page', String(params.page));
		if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
		if (params.search) searchParams.set('search', params.search);
		if (params.sortBy) searchParams.set('sortBy', params.sortBy);
		if (params.sortDirection) searchParams.set('sortDirection', params.sortDirection);

		const query = searchParams.toString();
		const response = await apiClient.get<Role[] | RolesResponse>(`/roles${query ? `?${query}` : ''}`);

		// 處理兩種可能的響應格式：
		// 1. 數組（apiClient 已解包 { data: [...] }）
		// 2. 完整分頁響應 { data: [...], pagination: {...} }
		if (Array.isArray(response)) {
			return {
				data: response,
				pagination: {
					page: 1,
					pageSize: response.length,
					total: response.length,
					totalPages: 1
				}
			};
		}

		return {
			data: response.data,
			pagination: response.pagination
		};
	},

	/**
	 * 取得單一角色
	 * GET /api/v1/roles/{id}
	 *
	 * 回應格式：
	 * {
	 *   "data": {
	 *     "id": "uuid",
	 *     "key": "admin",
	 *     "label": "Administrator",
	 *     "description": "Full system access",
	 *     "color": "red",
	 *     "permissions": ["users:read", "users:create", ...],
	 *     "createdAt": "2023-01-01T00:00:00+00:00",
	 *     "updatedAt": "2024-01-01T00:00:00+00:00"
	 *   }
	 * }
	 */
	async getRole(id: string): Promise<Role> {
		try {
			return await apiClient.get<Role>(`/roles/${id}`);
		} catch (error) {
			if (error instanceof ApiError && error.isNotFound()) {
				throw new Error('角色不存在');
			}
			throw error;
		}
	},

	/**
	 * 依識別碼 (key) 取得角色
	 * 注意：後端只支援 UUID 查詢，此方法會先取得角色列表再過濾
	 */
	async getRoleByKey(key: string): Promise<Role | null> {
		try {
			const { data: roles } = await this.getRoles({ pageSize: 100 });
			return roles.find((role) => role.key === key) ?? null;
		} catch {
			return null;
		}
	},

	/**
	 * 建立角色
	 * POST /api/v1/roles
	 *
	 * 請求格式：
	 * {
	 *   "key": "editor",
	 *   "label": "Editor",
	 *   "description": "Can edit content",
	 *   "color": "green",
	 *   "permissions": ["users:read", "subscriptions:read", "subscriptions:update"]
	 * }
	 *
	 * 回應格式：
	 * {
	 *   "data": { ... Role object ... }
	 * }
	 */
	async createRole(data: CreateRoleData): Promise<Role> {
		try {
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
	 * PUT/PATCH /api/v1/roles/{id}
	 *
	 * 請求格式（部分更新）：
	 * {
	 *   "label": "Content Editor",
	 *   "permissions": ["users:read", "subscriptions:read", ...]
	 * }
	 *
	 * 注意：key 欄位不可更新
	 *
	 * 回應格式：
	 * {
	 *   "data": { ... Role object ... }
	 * }
	 */
	async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
		try {
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
	 * DELETE /api/v1/roles/{id}
	 *
	 * 回應：204 No Content
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
	 * @param roleId - 角色 UUID
	 */
	async getRolePermissions(roleId: string): Promise<string[]> {
		try {
			const role = await this.getRole(roleId);
			return role.permissions;
		} catch {
			return [];
		}
	},

	/**
	 * 獲取所有權限（按分組）
	 * GET /api/v1/permissions
	 *
	 * 回應格式：
	 * {
	 *   "data": [
	 *     {
	 *       "key": "users",
	 *       "label": "Users",
	 *       "permissions": [
	 *         {
	 *           "id": "uuid",
	 *           "key": "users:read",
	 *           "label": "View Users",
	 *           "groupKey": "users",
	 *           "groupLabel": "Users"
	 *         },
	 *         ...
	 *       ]
	 *     },
	 *     ...
	 *   ]
	 * }
	 *
	 * 等同於 GET /api/v1/permissions/grouped
	 */
	async getPermissions(): Promise<PermissionGroup[]> {
		return apiClient.get<PermissionGroup[]>('/permissions');
	},

	/**
	 * 獲取所有權限（按分組）- 別名
	 * GET /api/v1/permissions/grouped
	 */
	async getPermissionsGrouped(): Promise<PermissionGroup[]> {
		return apiClient.get<PermissionGroup[]>('/permissions/grouped');
	},

	/**
	 * 獲取所有權限（扁平列表）
	 * GET /api/v1/permissions/flat
	 *
	 * 回應格式：
	 * {
	 *   "data": [
	 *     {
	 *       "id": "uuid",
	 *       "key": "users:read",
	 *       "label": "View Users",
	 *       "groupKey": "users",
	 *       "groupLabel": "Users"
	 *     },
	 *     ...
	 *   ]
	 * }
	 */
	async getPermissionsFlat(): Promise<Permission[]> {
		return apiClient.get<Permission[]>('/permissions/flat');
	}
};
