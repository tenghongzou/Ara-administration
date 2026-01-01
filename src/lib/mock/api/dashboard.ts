/**
 * Mock Dashboard API
 */
import type { DashboardStats, DashboardActivity } from '$lib/types';
import { mockUsers, mockAuditLogs } from '../data';

const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockDashboardApi = {
	async getStats(): Promise<DashboardStats> {
		await delay();

		const activeUsers = mockUsers.filter((u) => u.status === 'active').length;
		const inactiveUsers = mockUsers.filter((u) => u.status === 'inactive').length;
		const pendingUsers = mockUsers.filter((u) => u.status === 'pending').length;
		const suspendedUsers = mockUsers.filter((u) => u.status === 'suspended').length;
		const now = new Date();
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const newThisMonth = mockUsers.filter((u) => new Date(u.createdAt) >= monthStart).length;
		const newLastMonth = mockUsers.filter(
			(u) => new Date(u.createdAt) >= lastMonthStart && new Date(u.createdAt) < monthStart
		).length;

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

		const successCount = mockAuditLogs.filter((l) => l.status === 'success').length;
		const successRate = mockAuditLogs.length > 0 ? (successCount / mockAuditLogs.length) * 100 : 100;

		return {
			users: {
				total: mockUsers.length,
				active: activeUsers,
				inactive: inactiveUsers,
				pending: pendingUsers,
				suspended: suspendedUsers,
				newThisMonth,
				newLastMonth,
				growthPercentage: 8.3
			},
			subscriptions: {
				total: 10,
				active: 7,
				paused: 1,
				cancelled: 1,
				monthlySpending: 125000,
				yearlySpending: 1500000,
				upcomingCount: 2
			},
			activity: {
				totalThisMonth: mockAuditLogs.length,
				byAction,
				byResource,
				successRate
			},
			generatedAt: new Date().toISOString()
		};
	},

	async getRecentActivities(): Promise<DashboardActivity[]> {
		await delay();

		return mockAuditLogs.slice(0, 10).map((log) => ({
			id: log.id,
			type: 'audit',
			action: log.action,
			resource: log.resource,
			resourceId: log.resourceId ?? null,
			description: log.description ?? '',
			user: log.userName
				? {
						id: log.userId ?? '',
						name: log.userName,
						avatar: null
					}
				: null,
			status: log.status,
			createdAt: log.createdAt
		}));
	},

	async getOverview(): Promise<{
		stats: DashboardStats;
		activities: DashboardActivity[];
	}> {
		const [stats, activities] = await Promise.all([this.getStats(), this.getRecentActivities()]);
		return { stats, activities };
	}
};
