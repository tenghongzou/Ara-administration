import type { UpcomingReminder } from '$lib/services';
import type { DashboardStats as ApiDashboardStats, DashboardActivity } from '$lib/types';

// 重新匯出 API 類型
export type { DashboardStats as ApiDashboardStats, DashboardActivity } from '$lib/types';

/**
 * 儀表板統計數據（本地格式，用於 UI 顯示）
 */
export interface DashboardStats {
	totalUsers: number;
	activeUsers: number;
	newUsersThisMonth: number;
	revenue: number;
	revenueChange: number;
	activeUsersChange: number;
	newUsersChange: number;
	pageViews: number;
	pageViewsChange: number;
}

/**
 * 活動記錄（本地格式）
 */
export interface Activity {
	id: string;
	user: string;
	action: string;
	target: string;
	timestamp: string;
}

/**
 * 儀表板資料狀態
 */
export interface DashboardData {
	stats: DashboardStats | null;
	activities: Activity[];
	reminders: UpcomingReminder[];
	loading: boolean;
	error: string | null;
}

/**
 * 提醒類型
 */
export type ReminderType = 'overdue' | 'due_today' | 'due_soon';

/**
 * 提醒徽章資訊
 */
export interface ReminderBadgeInfo {
	variant: 'error' | 'warning' | 'default';
	label: string;
}

/**
 * 將 API DashboardStats 轉換為本地 DashboardStats
 */
export function fromApiDashboardStats(apiStats: ApiDashboardStats): DashboardStats {
	return {
		totalUsers: apiStats.users.total,
		activeUsers: apiStats.users.active,
		newUsersThisMonth: apiStats.users.newThisMonth,
		revenue: apiStats.subscriptions.monthlySpending,
		revenueChange: 0, // TODO: Calculate from API
		activeUsersChange: apiStats.users.growthPercentage,
		newUsersChange: apiStats.users.growthPercentage,
		pageViews: apiStats.activity.totalThisMonth,
		pageViewsChange: 0 // TODO: Calculate from API
	};
}

/**
 * 將 API DashboardActivity 轉換為本地 Activity
 */
export function fromApiActivity(apiActivity: DashboardActivity): Activity {
	return {
		id: apiActivity.id,
		user: apiActivity.user?.name || 'System',
		action: apiActivity.description,
		target: `${apiActivity.resource}${apiActivity.resourceId ? ` #${apiActivity.resourceId}` : ''}`,
		timestamp: apiActivity.createdAt
	};
}
