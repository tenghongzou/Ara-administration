import type { UpcomingReminder } from '$lib/services';

/**
 * 儀表板統計數據
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
 * 活動記錄
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
