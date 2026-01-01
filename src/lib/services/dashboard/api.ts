/**
 * 儀表板 API 模組
 * 對接後端 /api/v1/dashboard 端點
 */

import type { DashboardStats, DashboardActivity } from '$lib/types';
import { apiClient } from '../core/api-client';
import { config } from '$lib/constants';
import { mockDashboardApi } from '$lib/mock';

// ============================================================================
// Dashboard API
// ============================================================================

export const dashboardApi = {
	/**
	 * 取得儀表板統計資料
	 */
	async getStats(): Promise<DashboardStats> {
		if (config.isMockMode) {
			return mockDashboardApi.getStats();
		}

		return apiClient.get<DashboardStats>('/dashboard/stats');
	},

	/**
	 * 取得最近活動
	 */
	async getRecentActivities(limit: number = 10): Promise<DashboardActivity[]> {
		if (config.isMockMode) {
			return mockDashboardApi.getRecentActivities();
		}

		return apiClient.get<DashboardActivity[]>(`/dashboard/recent-activities?limit=${limit}`);
	},

	/**
	 * 取得儀表板概覽（快速統計）
	 */
	async getOverview(): Promise<{
		quickStats: {
			totalUsers: number;
			activeUsers: number;
			newUsersThisMonth: number;
			totalSubscriptions: number;
			activeSubscriptions: number;
			monthlySpending: number;
			actionsToday: number;
		};
		generatedAt: string;
	}> {
		if (config.isMockMode) {
			const { stats } = await mockDashboardApi.getOverview();
			return {
				quickStats: {
					totalUsers: stats.users.total,
					activeUsers: stats.users.active,
					newUsersThisMonth: stats.users.newThisMonth,
					totalSubscriptions: stats.subscriptions.total,
					activeSubscriptions: stats.subscriptions.active,
					monthlySpending: stats.subscriptions.monthlySpending,
					actionsToday: stats.activity.totalThisMonth
				},
				generatedAt: new Date().toISOString()
			};
		}

		return apiClient.get<{
			quickStats: {
				totalUsers: number;
				activeUsers: number;
				newUsersThisMonth: number;
				totalSubscriptions: number;
				activeSubscriptions: number;
				monthlySpending: number;
				actionsToday: number;
			};
			generatedAt: string;
		}>('/dashboard/overview');
	}
};
