/**
 * 審計日誌 API 模組
 * 對接後端 /api/v1/audit-logs 端點
 */

import type { AuditLog, AuditLogStatistics, AuditLogFilters, PaginatedData } from '$lib/types';
import { apiClient, ApiError } from '../core/api-client';
import { config } from '$lib/constants';
import { mockLogsApi } from '$lib/mock';

// ============================================================================
// Types
// ============================================================================

export interface GetLogsParams {
	page?: number;
	pageSize?: number;
	action?: string;
	resource?: string;
	status?: 'success' | 'failure';
	userId?: string;
	startDate?: string;
	endDate?: string;
	search?: string;
}

interface LogsResponse {
	data: AuditLog[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
}

/**
 * 後端統計資料響應結構
 * GET /api/v1/audit-logs/statistics
 */
interface AuditLogStatisticsResponse {
	total: number;
	byAction: Record<string, number>;
	byResource: Record<string, number>;
	byStatus: Record<string, number>;
	byDay?: { date: string; count: number }[];
}

// ============================================================================
// Logs API
// ============================================================================

export const logsApi = {
	/**
	 * 取得審計日誌列表（分頁）
	 * GET /api/v1/audit-logs
	 *
	 * 查詢參數：
	 * - page: 頁碼 (預設 1)
	 * - pageSize: 每頁數量 (預設 20，最大 100)
	 * - action: 操作類型篩選 (login, logout, create, update, delete, view, export, import)
	 * - resource: 資源類型篩選 (auth, user, role, permission, subscription, notification, audit_log)
	 * - status: 狀態篩選 (success, failure)
	 * - userId: 使用者 ID 篩選
	 * - startDate: 開始日期 (ISO 8601 格式)
	 * - endDate: 結束日期 (ISO 8601 格式)
	 * - search: 搜尋關鍵字 (比對描述)
	 *
	 * 回應格式：
	 * {
	 *   "data": [
	 *     {
	 *       "id": "uuid",
	 *       "action": "login",
	 *       "resource": "auth",
	 *       "resourceId": "uuid",
	 *       "description": "User logged in: admin",
	 *       "status": "success",
	 *       "ipAddress": "192.168.1.100",
	 *       "userAgent": "Mozilla/5.0...",
	 *       "user": {
	 *         "id": "uuid",
	 *         "name": "Administrator",
	 *         "email": "admin@example.com"
	 *       },
	 *       "metadata": { ... },
	 *       "createdAt": "2024-01-15T10:30:00+00:00"
	 *     }
	 *   ],
	 *   "pagination": { ... }
	 * }
	 */
	async getLogs(params: GetLogsParams = {}): Promise<PaginatedData<AuditLog>> {
		if (config.isMockMode) {
			return mockLogsApi.getLogs(params);
		}

		const searchParams = new URLSearchParams();

		if (params.page) searchParams.set('page', String(params.page));
		if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
		if (params.action) searchParams.set('action', params.action);
		if (params.resource) searchParams.set('resource', params.resource);
		if (params.status) searchParams.set('status', params.status);
		if (params.userId) searchParams.set('userId', params.userId);
		if (params.startDate) searchParams.set('startDate', params.startDate);
		if (params.endDate) searchParams.set('endDate', params.endDate);
		if (params.search) searchParams.set('search', params.search);

		const query = searchParams.toString();
		const response = await apiClient.get<LogsResponse>(
			`/audit-logs${query ? `?${query}` : ''}`
		);

		return {
			data: response.data || [],
			pagination: response.pagination || {
				page: params.page || 1,
				pageSize: params.pageSize || 20,
				total: 0,
				totalPages: 0
			}
		};
	},

	/**
	 * 取得單一審計日誌
	 * GET /api/v1/audit-logs/{id}
	 *
	 * 回應格式：
	 * {
	 *   "data": {
	 *     "id": "uuid",
	 *     "action": "update",
	 *     "resource": "subscription",
	 *     "resourceId": "uuid",
	 *     "description": "Updated subscription: Netflix",
	 *     "status": "success",
	 *     "ipAddress": "192.168.1.100",
	 *     "userAgent": "Mozilla/5.0...",
	 *     "user": {
	 *       "id": "uuid",
	 *       "name": "Administrator",
	 *       "email": "admin@example.com",
	 *       "avatar": "https://example.com/avatar.jpg"
	 *     },
	 *     "metadata": {
	 *       "changes": {
	 *         "cost": { "old": 390, "new": 450 },
	 *         "status": { "old": "active", "new": "paused" }
	 *       }
	 *     },
	 *     "createdAt": "2024-01-15T10:30:00+00:00"
	 *   }
	 * }
	 */
	async getLog(id: string): Promise<AuditLog> {
		if (config.isMockMode) {
			return mockLogsApi.getLog(id);
		}

		try {
			return await apiClient.get<AuditLog>(`/audit-logs/${id}`);
		} catch (error) {
			if (error instanceof ApiError && error.isNotFound()) {
				throw new Error('審計日誌不存在');
			}
			throw error;
		}
	},

	/**
	 * 取得最近的審計日誌
	 * GET /api/v1/audit-logs/recent
	 *
	 * 查詢參數：
	 * - limit: 回傳數量 (預設 20，最大 50)
	 */
	async getRecentLogs(limit: number = 20): Promise<AuditLog[]> {
		if (config.isMockMode) {
			return mockLogsApi.getRecentLogs(limit);
		}

		return apiClient.get<AuditLog[]>(`/audit-logs/recent?limit=${limit}`);
	},

	/**
	 * 取得審計日誌統計
	 * GET /api/v1/audit-logs/statistics
	 *
	 * 查詢參數：
	 * - days: 統計天數範圍 (預設 30)
	 *
	 * 回應格式：
	 * {
	 *   "data": {
	 *     "total": 500,
	 *     "byAction": {
	 *       "login": 150,
	 *       "logout": 120,
	 *       "create": 80,
	 *       "update": 100,
	 *       "delete": 30,
	 *       "view": 20
	 *     },
	 *     "byResource": {
	 *       "auth": 270,
	 *       "user": 50,
	 *       "subscription": 120,
	 *       "role": 30,
	 *       "notification": 30
	 *     },
	 *     "byStatus": {
	 *       "success": 480,
	 *       "failure": 20
	 *     },
	 *     "byDay": [
	 *       { "date": "2024-01-15", "count": 75 },
	 *       { "date": "2024-01-14", "count": 68 }
	 *     ]
	 *   }
	 * }
	 */
	async getStatistics(days: number = 30): Promise<AuditLogStatistics> {
		if (config.isMockMode) {
			return mockLogsApi.getStatistics();
		}

		const response = await apiClient.get<AuditLogStatisticsResponse>(
			`/audit-logs/statistics?days=${days}`
		);

		return {
			total: response.total,
			byAction: response.byAction,
			byResource: response.byResource,
			byStatus: response.byStatus
		};
	},

	/**
	 * 取得篩選選項（可用的 action、resource、status）
	 * GET /api/v1/audit-logs/filters
	 *
	 * 回應格式：
	 * {
	 *   "data": {
	 *     "actions": ["login", "logout", "create", "update", "delete", "view", "export", "import"],
	 *     "resources": ["auth", "user", "role", "permission", "subscription", "notification", "audit_log"],
	 *     "statuses": ["success", "failure"]
	 *   }
	 * }
	 */
	async getFilters(): Promise<AuditLogFilters> {
		if (config.isMockMode) {
			const options = await mockLogsApi.getFilterOptions();
			return {
				actions: options.actions,
				resources: options.resources,
				statuses: ['success', 'failure']
			};
		}

		return apiClient.get<AuditLogFilters>('/audit-logs/filters');
	},

	/**
	 * 取得指定資源的審計日誌
	 * GET /api/v1/audit-logs/resource/{resource}/{resourceId}
	 *
	 * 查詢參數：
	 * - limit: 回傳數量 (預設 50，最大 100)
	 */
	async getLogsByResource(resource: string, resourceId: string, limit: number = 50): Promise<AuditLog[]> {
		if (config.isMockMode) {
			const result = await mockLogsApi.getLogs({ resource });
			return result.data.filter((log) => log.resourceId === resourceId).slice(0, limit);
		}

		return apiClient.get<AuditLog[]>(
			`/audit-logs/resource/${resource}/${resourceId}?limit=${limit}`
		);
	},

	/**
	 * 取得當前使用者的活動日誌
	 * GET /api/v1/audit-logs/my-activity
	 *
	 * 查詢參數：
	 * - limit: 回傳數量 (預設 20，最大 50)
	 */
	async getMyActivity(limit: number = 20): Promise<AuditLog[]> {
		if (config.isMockMode) {
			// Return logs for the first user as "current user" in mock mode
			const result = await mockLogsApi.getLogs({ userId: '1' });
			return result.data.slice(0, limit);
		}

		return apiClient.get<AuditLog[]>(`/audit-logs/my-activity?limit=${limit}`);
	}
};

// 重新匯出 AuditLog 類型
export type { AuditLog };
