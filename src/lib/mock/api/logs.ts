/**
 * Mock Logs API
 */
import type { AuditLog, AuditLogStatistics, PaginatedData } from '$lib/types';
import { mockAuditLogs } from '../data';

const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockLogsApi = {
	async getLogs(params?: {
		page?: number;
		pageSize?: number;
		search?: string;
		action?: string;
		resource?: string;
		status?: string;
		userId?: string;
		startDate?: string;
		endDate?: string;
	}): Promise<PaginatedData<AuditLog>> {
		await delay();

		let filtered = [...mockAuditLogs];
		const page = params?.page ?? 1;
		const pageSize = params?.pageSize ?? 20;

		// Apply filters
		if (params?.search) {
			const search = params.search.toLowerCase();
			filtered = filtered.filter(
				(log) =>
					log.userName?.toLowerCase().includes(search) ||
					log.description?.toLowerCase().includes(search) ||
					log.resource.toLowerCase().includes(search)
			);
		}

		if (params?.action) {
			filtered = filtered.filter((log) => log.action === params.action);
		}

		if (params?.resource) {
			filtered = filtered.filter((log) => log.resource === params.resource);
		}

		if (params?.status) {
			filtered = filtered.filter((log) => log.status === params.status);
		}

		if (params?.userId) {
			filtered = filtered.filter((log) => log.userId === params.userId);
		}

		if (params?.startDate) {
			const start = new Date(params.startDate);
			filtered = filtered.filter((log) => new Date(log.createdAt) >= start);
		}

		if (params?.endDate) {
			const end = new Date(params.endDate);
			filtered = filtered.filter((log) => new Date(log.createdAt) <= end);
		}

		// Sort by createdAt descending
		filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		const total = filtered.length;
		const totalPages = Math.ceil(total / pageSize);
		const start = (page - 1) * pageSize;
		const data = filtered.slice(start, start + pageSize);

		return {
			data,
			pagination: {
				page,
				pageSize,
				total,
				totalPages
			}
		};
	},

	async getLog(id: string): Promise<AuditLog> {
		await delay();
		const log = mockAuditLogs.find((l) => l.id === id);
		if (!log) {
			throw new Error('Log not found');
		}
		return log;
	},

	async getRecentLogs(limit: number = 10): Promise<AuditLog[]> {
		await delay();
		return mockAuditLogs
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, limit);
	},

	async getStatistics(): Promise<AuditLogStatistics> {
		await delay();

		// Count by action
		const byAction: Record<string, number> = {};
		for (const log of mockAuditLogs) {
			byAction[log.action] = (byAction[log.action] || 0) + 1;
		}

		// Count by resource
		const byResource: Record<string, number> = {};
		for (const log of mockAuditLogs) {
			byResource[log.resource] = (byResource[log.resource] || 0) + 1;
		}

		// Count by status
		const byStatus: Record<string, number> = {
			success: mockAuditLogs.filter((l) => l.status === 'success').length,
			failure: mockAuditLogs.filter((l) => l.status === 'failure').length
		};

		return {
			total: mockAuditLogs.length,
			byAction,
			byResource,
			byStatus
		};
	},

	async getFilterOptions(): Promise<{
		actions: string[];
		resources: string[];
		users: Array<{ id: string; name: string }>;
	}> {
		await delay();

		const actions = [...new Set(mockAuditLogs.map((l) => l.action))];
		const resources = [...new Set(mockAuditLogs.map((l) => l.resource))];
		const usersMap = new Map<string, string>();

		for (const log of mockAuditLogs) {
			if (log.userId && log.userName) {
				usersMap.set(log.userId, log.userName);
			}
		}

		const users = Array.from(usersMap.entries()).map(([id, name]) => ({ id, name }));

		return { actions, resources, users };
	}
};
