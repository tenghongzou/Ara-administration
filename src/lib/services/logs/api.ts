/**
 * 審計日誌 API 模組
 */

import type { PaginatedData } from '$lib/types';
import { mockAuditLogs, type AuditLog } from '../mock-data';
import { delay, createPaginatedResponse } from '../core';

export interface GetLogsParams {
	page?: number;
	pageSize?: number;
	action?: string;
	resource?: string;
	status?: 'success' | 'failure';
	startDate?: string;
	endDate?: string;
}

export const logsApi = {
	async getLogs(params: GetLogsParams = {}): Promise<PaginatedData<AuditLog>> {
		await delay(500);

		const { page = 1, pageSize = 10, action, resource, status, startDate, endDate } = params;

		let filtered = [...mockAuditLogs];

		// 操作類型過濾
		if (action) {
			filtered = filtered.filter((log) => log.action === action);
		}

		// 資源類型過濾
		if (resource) {
			filtered = filtered.filter((log) => log.resource === resource);
		}

		// 狀態過濾
		if (status) {
			filtered = filtered.filter((log) => log.status === status);
		}

		// 日期範圍過濾
		if (startDate) {
			const start = new Date(startDate).getTime();
			filtered = filtered.filter((log) => new Date(log.timestamp).getTime() >= start);
		}

		if (endDate) {
			const end = new Date(endDate).getTime();
			filtered = filtered.filter((log) => new Date(log.timestamp).getTime() <= end);
		}

		// 按時間倒序排列
		filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

		return createPaginatedResponse(mockAuditLogs, filtered, page, pageSize);
	}
};

// 重新匯出 AuditLog 類型
export type { AuditLog };
