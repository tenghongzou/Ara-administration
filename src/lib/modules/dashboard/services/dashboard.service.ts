import { dashboardApi, subscriptionsApi, type UpcomingReminder } from '$lib/services';
import type { DashboardStats, Activity, DashboardData, ReminderType, ReminderBadgeInfo } from '../types';

/**
 * 儀表板服務
 * 負責數據獲取和業務邏輯處理
 */
class DashboardService {
	/**
	 * 載入儀表板所有數據
	 */
	async loadDashboardData(reminderDays: number = 7): Promise<DashboardData> {
		try {
			const [stats, activities, reminders] = await Promise.all([
				dashboardApi.getStats() as Promise<DashboardStats>,
				dashboardApi.getRecentActivities() as Promise<Activity[]>,
				subscriptionsApi.getUpcomingReminders(reminderDays)
			]);

			return {
				stats,
				activities,
				reminders,
				loading: false,
				error: null
			};
		} catch (error) {
			return {
				stats: null,
				activities: [],
				reminders: [],
				loading: false,
				error: error instanceof Error ? error.message : '載入資料失敗'
			};
		}
	}

	/**
	 * 僅載入統計數據
	 */
	async loadStats(): Promise<DashboardStats | null> {
		try {
			return (await dashboardApi.getStats()) as DashboardStats;
		} catch {
			return null;
		}
	}

	/**
	 * 僅載入活動記錄
	 */
	async loadActivities(): Promise<Activity[]> {
		try {
			return (await dashboardApi.getRecentActivities()) as Activity[];
		} catch {
			return [];
		}
	}

	/**
	 * 僅載入訂閱提醒
	 */
	async loadReminders(days: number = 7): Promise<UpcomingReminder[]> {
		try {
			return await subscriptionsApi.getUpcomingReminders(days);
		} catch {
			return [];
		}
	}

	/**
	 * 格式化日期為相對時間
	 */
	formatRelativeDate(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const hours = Math.floor(diff / (1000 * 60 * 60));

		if (hours < 1) return '剛剛';
		if (hours < 24) return `${hours} 小時前`;
		if (hours < 48) return '昨天';
		return date.toLocaleDateString('zh-TW');
	}

	/**
	 * 格式化數字（支援萬為單位）
	 */
	formatNumber(num: number): string {
		if (num >= 10000) {
			return (num / 10000).toFixed(1) + '萬';
		}
		return num.toLocaleString();
	}

	/**
	 * 格式化貨幣
	 */
	formatCurrency(amount: number, currency: string = 'TWD'): string {
		return new Intl.NumberFormat('zh-TW', {
			style: 'currency',
			currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	/**
	 * 取得提醒徽章資訊
	 */
	getReminderBadge(type: ReminderType): ReminderBadgeInfo {
		switch (type) {
			case 'overdue':
				return { variant: 'error', label: '已逾期' };
			case 'due_today':
				return { variant: 'warning', label: '今日到期' };
			case 'due_soon':
				return { variant: 'default', label: '即將到期' };
		}
	}

	/**
	 * 取得天數標籤
	 */
	getDaysLabel(days: number): string {
		if (days < 0) return `逾期 ${Math.abs(days)} 天`;
		if (days === 0) return '今天';
		return `${days} 天後`;
	}
}

export const dashboardService = new DashboardService();
