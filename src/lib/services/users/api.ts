/**
 * 使用者管理 API 模組
 * 對接後端 /api/v1/users 端點
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

// 分頁響應保持完整結構（apiClient 不會自動解包有 pagination 的響應）
interface UsersResponse {
	data: User[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
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
	 * GET /api/v1/users
	 *
	 * 查詢參數：
	 * - page: 頁碼 (預設 1)
	 * - pageSize: 每頁數量 (預設 10，最大 100)
	 * - search: 搜尋關鍵字 (比對 username, email, name)
	 * - status: 狀態篩選 (active, inactive, pending, suspended)
	 * - role: 角色篩選 (角色 key)
	 * - sortBy: 排序欄位 (username, email, name, status, createdAt, lastLoginAt)
	 * - sortDirection: 排序方向 (asc, desc)
	 *
	 * 回應格式：
	 * {
	 *   "data": [...],
	 *   "pagination": {
	 *     "total": 50,
	 *     "count": 20,
	 *     "page": 1,
	 *     "pageSize": 20,
	 *     "totalPages": 3,
	 *     "links": { ... }
	 *   }
	 * }
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
	 * GET /api/v1/users/{id}
	 *
	 * 回應格式：
	 * {
	 *   "data": {
	 *     "id": "uuid",
	 *     "username": "johndoe",
	 *     "email": "john@example.com",
	 *     "name": "John Doe",
	 *     "avatar": "https://example.com/avatar.jpg",
	 *     "role": "user",
	 *     "status": "active",
	 *     "phone": "+886912345678",
	 *     "birthday": "1990-05-15",
	 *     "bio": "Software Developer",
	 *     "twoFactorEnabled": false,
	 *     "isSuperAdmin": false,
	 *     "lastLoginAt": "2024-01-15T10:30:00+00:00",
	 *     "passwordChangedAt": "2024-01-01T00:00:00+00:00",
	 *     "createdAt": "2023-06-01T00:00:00+00:00",
	 *     "updatedAt": "2024-01-15T10:30:00+00:00"
	 *   }
	 * }
	 */
	async getUser(id: string): Promise<User> {
		if (config.isMockMode) {
			return mockUsersApi.getUser(id);
		}

		try {
			// apiClient 自動解包 { data: User } 回應
			return await apiClient.get<User>(`/users/${id}`);
		} catch (error) {
			if (error instanceof ApiError && error.isNotFound()) {
				throw new Error('使用者不存在');
			}
			throw error;
		}
	},

	/**
	 * 建立使用者
	 * POST /api/v1/users
	 *
	 * 請求格式：
	 * {
	 *   "username": "newuser",
	 *   "email": "newuser@example.com",
	 *   "name": "New User",
	 *   "password": "SecurePass123",
	 *   "role": "user",
	 *   "status": "active",
	 *   "phone": "+886912345678",
	 *   "bio": "New team member"
	 * }
	 *
	 * 回應格式：
	 * {
	 *   "data": { ... User object ... }
	 * }
	 */
	async createUser(data: CreateUserData): Promise<User> {
		if (config.isMockMode) {
			return mockUsersApi.createUser(data);
		}

		try {
			// apiClient 自動解包 { data: User } 回應
			return await apiClient.post<User>('/users', data);
		} catch (error) {
			if (error instanceof ApiError) {
				throw new Error(ERROR_MESSAGES[error.message] || error.message);
			}
			throw error;
		}
	},

	/**
	 * 更新使用者
	 * PUT/PATCH /api/v1/users/{id}
	 *
	 * 請求格式（部分更新）：
	 * {
	 *   "name": "Updated Name",
	 *   "status": "inactive",
	 *   "bio": null
	 * }
	 *
	 * 回應格式：
	 * {
	 *   "data": { ... User object ... }
	 * }
	 */
	async updateUser(id: string, data: UpdateUserData): Promise<User> {
		if (config.isMockMode) {
			return mockUsersApi.updateUser(id, data);
		}

		try {
			// apiClient 自動解包 { data: User } 回應
			return await apiClient.patch<User>(`/users/${id}`, data);
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
	 * DELETE /api/v1/users/{id}
	 *
	 * 回應：204 No Content
	 *
	 * 錯誤情況：
	 * - 400: 無法刪除超級管理員帳號
	 * - 400: 無法刪除自己的帳號
	 * - 404: 使用者不存在
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
	 * POST /api/v1/users/{id}/change-password
	 *
	 * 請求格式（修改自己的密碼）：
	 * {
	 *   "currentPassword": "OldPassword123",
	 *   "newPassword": "NewPassword456"
	 * }
	 *
	 * 請求格式（管理員修改其他使用者的密碼）：
	 * {
	 *   "newPassword": "NewPassword456"
	 * }
	 *
	 * 回應格式：
	 * {
	 *   "data": {
	 *     "success": true,
	 *     "message": "Password changed successfully"
	 *   }
	 * }
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
	 * POST /api/v1/users/{id}/avatar
	 *
	 * 請求：multipart/form-data，欄位名稱為 "avatar"
	 *
	 * 回應格式：
	 * {
	 *   "data": {
	 *     "id": "uuid",
	 *     "avatar": "https://example.com/avatars/new-avatar.jpg",
	 *     ... 其他 User 欄位 ...
	 *   }
	 * }
	 *
	 * 注意：後端返回完整 User 物件，其中包含 avatar 欄位
	 */
	async uploadAvatar(id: string, file: File): Promise<string> {
		const formData = new FormData();
		formData.append('avatar', file);

		// 後端返回完整的 User 物件，其中包含 avatar 欄位
		const response = await apiClient.upload<User>(
			`/users/${id}/avatar`,
			formData
		);
		return response.avatar || '';
	}
};
