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

// ============================================================================
// Logs API
// ============================================================================

export const logsApi = {
	/**
	 * 取得審計日誌列表（分頁）
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
	 */
	async getRecentLogs(limit: number = 20): Promise<AuditLog[]> {
		if (config.isMockMode) {
			return mockLogsApi.getRecentLogs(limit);
		}

		return apiClient.get<AuditLog[]>(`/audit-logs/recent?limit=${limit}`);
	},

	/**
	 * 取得審計日誌統計
	 */
	async getStatistics(days: number = 30): Promise<AuditLogStatistics> {
		if (config.isMockMode) {
			return mockLogsApi.getStatistics();
		}

		return apiClient.get<AuditLogStatistics>(`/audit-logs/statistics?days=${days}`);
	},

	/**
	 * 取得篩選選項（可用的 action、resource、status）
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
