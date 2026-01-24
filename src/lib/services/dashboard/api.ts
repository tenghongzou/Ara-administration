/**
 * 儀表板 API 模組
 * 對接後端 /api/v1/dashboard 端點
 */

import type { DashboardStats, DashboardActivity } from '$lib/types';
import { apiClient } from '../core/api-client';
import { config } from '$lib/constants';
import { mockDashboardApi } from '$lib/mock';

// ============================================================================
// Types
// ============================================================================

/**
 * 儀表板概覽響應格式
 * GET /api/v1/dashboard/overview
 */
export interface DashboardOverviewResponse {
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
}

// ============================================================================
// Dashboard API
// ============================================================================

export const dashboardApi = {
	/**
	 * 取得儀表板統計資料
	 * GET /api/v1/dashboard/stats
	 *
	 * 回應格式：
	 * {
	 *   "data": {
	 *     "users": {
	 *       "total": 150,
	 *       "active": 120,
	 *       "inactive": 15,
	 *       "pending": 10,
	 *       "suspended": 5,
	 *       "newThisMonth": 12,
	 *       "newLastMonth": 8,
	 *       "growthPercentage": 50.0
	 *     },
	 *     "subscriptions": {
	 *       "total": 450,
	 *       "active": 380,
	 *       "paused": 40,
	 *       "cancelled": 30,
	 *       "monthlySpending": 125000.00,
	 *       "yearlySpending": 1500000.00,
	 *       "upcomingCount": 25
	 *     },
	 *     "activity": {
	 *       "totalThisMonth": 2500,
	 *       "byAction": { ... },
	 *       "byResource": { ... },
	 *       "successRate": 98.5
	 *     },
	 *     "generatedAt": "2024-01-15T10:30:00+00:00"
	 *   }
	 * }
	 */
	async getStats(): Promise<DashboardStats> {
		if (config.isMockMode) {
			return mockDashboardApi.getStats();
		}

		return apiClient.get<DashboardStats>('/dashboard/stats');
	},

	/**
	 * 取得最近活動
	 * GET /api/v1/dashboard/recent-activities
	 *
	 * 查詢參數：
	 * - limit: 回傳數量 (預設 10，最大 50)
	 *
	 * 回應格式：
	 * {
	 *   "data": [
	 *     {
	 *       "id": "uuid",
	 *       "type": "auth",
	 *       "action": "login",
	 *       "resource": "auth",
	 *       "resourceId": "uuid",
	 *       "description": "Administrator logged in",
	 *       "user": {
	 *         "id": "uuid",
	 *         "name": "Administrator",
	 *         "avatar": "https://example.com/avatar.jpg"
	 *       },
	 *       "status": "success",
	 *       "createdAt": "2024-01-15T10:30:00+00:00"
	 *     }
	 *   ]
	 * }
	 */
	async getRecentActivities(limit: number = 10): Promise<DashboardActivity[]> {
		if (config.isMockMode) {
			return mockDashboardApi.getRecentActivities();
		}

		return apiClient.get<DashboardActivity[]>(`/dashboard/recent-activities?limit=${limit}`);
	},

	/**
	 * 取得儀表板概覽（快速統計）
	 * GET /api/v1/dashboard/overview
	 *
	 * 回應格式：
	 * {
	 *   "data": {
	 *     "quickStats": {
	 *       "totalUsers": 150,
	 *       "activeUsers": 120,
	 *       "newUsersThisMonth": 12,
	 *       "totalSubscriptions": 450,
	 *       "activeSubscriptions": 380,
	 *       "monthlySpending": 125000.00,
	 *       "actionsToday": 85
	 *     },
	 *     "generatedAt": "2024-01-15T10:30:00+00:00"
	 *   }
	 * }
	 */
	async getOverview(): Promise<DashboardOverviewResponse> {
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

		return apiClient.get<DashboardOverviewResponse>('/dashboard/overview');
	}
};
