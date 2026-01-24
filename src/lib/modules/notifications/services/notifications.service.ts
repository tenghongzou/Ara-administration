import type { Notification } from '$lib/stores/notifications';
import { notificationApi } from '$lib/services/notifications/api';
import type {
	NotificationFilters,
	NotificationCategory,
	NotificationTypeStyle,
	NotificationBadgeInfo,
	CategoryOption,
	NotificationBatchAction
} from '../types';

// Store 的 Notification type
type StoreNotificationType = Notification['type'];

/**
 * 分類選項配置（匹配後端 NotificationType）
 */
export const categoryOptions: CategoryOption[] = [
	{ value: 'all', label: '全部', icon: '📋' },
	{ value: 'info', label: '資訊', icon: 'ℹ️' },
	{ value: 'success', label: '成功', icon: '✓' },
	{ value: 'warning', label: '警告', icon: '!' },
	{ value: 'error', label: '錯誤', icon: '✕' },
	{ value: 'security', label: '安全', icon: '🔒' },
	{ value: 'system', label: '系統', icon: '⚙️' },
	{ value: 'subscription', label: '訂閱', icon: '📅' },
	{ value: 'subscription_reminder', label: '訂閱提醒', icon: '🔔' },
	{ value: 'payment', label: '付款', icon: '💳' },
	{ value: 'marketing', label: '行銷', icon: '📢' },
	{ value: 'other', label: '其他', icon: '📌' }
];

/**
 * 通知服務
 * 負責通知的業務邏輯處理
 */
class NotificationsService {
	/**
	 * 篩選通知
	 */
	filterNotifications(items: Notification[], filters: NotificationFilters): Notification[] {
		let filtered = [...items];

		// 按分類篩選
		if (filters.category !== 'all') {
			filtered = filtered.filter((item) => item.type === filters.category);
		}

		// 按狀態篩選
		if (filters.status === 'read') {
			filtered = filtered.filter((item) => item.read);
		} else if (filters.status === 'unread') {
			filtered = filtered.filter((item) => !item.read);
		}

		// 按搜尋關鍵字篩選
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			filtered = filtered.filter(
				(item) =>
					item.title.toLowerCase().includes(searchLower) ||
					item.message.toLowerCase().includes(searchLower)
			);
		}

		// 按日期範圍篩選
		if (filters.dateRange) {
			const startDate = new Date(filters.dateRange.start);
			const endDate = new Date(filters.dateRange.end);
			endDate.setHours(23, 59, 59, 999);

			filtered = filtered.filter((item) => {
				const itemDate = new Date(item.createdAt);
				return itemDate >= startDate && itemDate <= endDate;
			});
		}

		return filtered;
	}

	/**
	 * 按分類分組通知
	 */
	groupByCategory(items: Notification[]): Record<NotificationCategory, Notification[]> {
		const groups: Record<NotificationCategory, Notification[]> = {
			all: items,
			info: [],
			success: [],
			warning: [],
			error: [],
			security: [],
			system: [],
			subscription: [],
			subscription_reminder: [],
			payment: [],
			marketing: [],
			other: []
		};

		items.forEach((item) => {
			const category = item.type as NotificationCategory;
			if (groups[category]) {
				groups[category].push(item);
			}
		});

		return groups;
	}

	/**
	 * 統計各分類數量
	 */
	getCategoryCounts(items: Notification[]): Record<NotificationCategory, number> {
		const counts: Record<NotificationCategory, number> = {
			all: items.length,
			info: 0,
			success: 0,
			warning: 0,
			error: 0,
			security: 0,
			system: 0,
			subscription: 0,
			subscription_reminder: 0,
			payment: 0,
			marketing: 0,
			other: 0
		};

		items.forEach((item) => {
			const category = item.type as NotificationCategory;
			if (counts[category] !== undefined) {
				counts[category]++;
			}
		});

		return counts;
	}

	/**
	 * 執行批量操作
	 */
	async executeBatchAction(action: NotificationBatchAction): Promise<void> {
		const { type, ids } = action;

		switch (type) {
			case 'markRead':
				await Promise.all(ids.map((id) => notificationApi.markAsRead(id)));
				break;
			case 'delete':
				await Promise.all(ids.map((id) => notificationApi.deleteNotification(id)));
				break;
			case 'markUnread':
				// API 不支持標記未讀，可能需要擴展
				console.warn('Mark as unread is not supported by the API');
				break;
		}
	}

	/**
	 * 格式化時間為相對時間
	 */
	formatTime(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (minutes < 1) return '剛剛';
		if (minutes < 60) return `${minutes} 分鐘前`;
		if (hours < 24) return `${hours} 小時前`;
		if (days < 7) return `${days} 天前`;

		return date.toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	/**
	 * 格式化為完整日期時間
	 */
	formatFullDateTime(timestamp: string): string {
		return new Date(timestamp).toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			weekday: 'long',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	/**
	 * 取得通知類型樣式
	 */
	getTypeStyle(type: StoreNotificationType): NotificationTypeStyle {
		switch (type) {
			case 'success':
				return {
					icon: '✓',
					bg: 'bg-green-100 dark:bg-green-900/30',
					text: 'text-green-600 dark:text-green-400',
					border: 'border-green-200 dark:border-green-800'
				};
			case 'warning':
				return {
					icon: '!',
					bg: 'bg-yellow-100 dark:bg-yellow-900/30',
					text: 'text-yellow-600 dark:text-yellow-400',
					border: 'border-yellow-200 dark:border-yellow-800'
				};
			case 'error':
				return {
					icon: '✕',
					bg: 'bg-red-100 dark:bg-red-900/30',
					text: 'text-red-600 dark:text-red-400',
					border: 'border-red-200 dark:border-red-800'
				};
			case 'security':
				return {
					icon: '🔒',
					bg: 'bg-purple-100 dark:bg-purple-900/30',
					text: 'text-purple-600 dark:text-purple-400',
					border: 'border-purple-200 dark:border-purple-800'
				};
			case 'system':
				return {
					icon: '⚙️',
					bg: 'bg-gray-100 dark:bg-gray-800/50',
					text: 'text-gray-600 dark:text-gray-400',
					border: 'border-gray-200 dark:border-gray-700'
				};
			case 'subscription':
				return {
					icon: '📅',
					bg: 'bg-indigo-100 dark:bg-indigo-900/30',
					text: 'text-indigo-600 dark:text-indigo-400',
					border: 'border-indigo-200 dark:border-indigo-800'
				};
			case 'subscription_reminder':
				return {
					icon: '🔔',
					bg: 'bg-amber-100 dark:bg-amber-900/30',
					text: 'text-amber-600 dark:text-amber-400',
					border: 'border-amber-200 dark:border-amber-800'
				};
			case 'payment':
				return {
					icon: '💳',
					bg: 'bg-emerald-100 dark:bg-emerald-900/30',
					text: 'text-emerald-600 dark:text-emerald-400',
					border: 'border-emerald-200 dark:border-emerald-800'
				};
			case 'marketing':
				return {
					icon: '📢',
					bg: 'bg-pink-100 dark:bg-pink-900/30',
					text: 'text-pink-600 dark:text-pink-400',
					border: 'border-pink-200 dark:border-pink-800'
				};
			case 'other':
				return {
					icon: '📌',
					bg: 'bg-slate-100 dark:bg-slate-900/30',
					text: 'text-slate-600 dark:text-slate-400',
					border: 'border-slate-200 dark:border-slate-800'
				};
			case 'info':
			default:
				return {
					icon: 'ℹ️',
					bg: 'bg-blue-100 dark:bg-blue-900/30',
					text: 'text-blue-600 dark:text-blue-400',
					border: 'border-blue-200 dark:border-blue-800'
				};
		}
	}

	/**
	 * 取得通知類型徽章
	 */
	getTypeBadge(type: StoreNotificationType): NotificationBadgeInfo {
		switch (type) {
			case 'success':
				return { variant: 'success', label: '成功' };
			case 'warning':
				return { variant: 'warning', label: '警告' };
			case 'error':
				return { variant: 'error', label: '錯誤' };
			case 'security':
				return { variant: 'default', label: '安全' };
			case 'system':
				return { variant: 'default', label: '系統' };
			case 'subscription':
				return { variant: 'info', label: '訂閱' };
			case 'subscription_reminder':
				return { variant: 'warning', label: '訂閱提醒' };
			case 'payment':
				return { variant: 'success', label: '付款' };
			case 'marketing':
				return { variant: 'info', label: '行銷' };
			case 'other':
				return { variant: 'default', label: '其他' };
			case 'info':
			default:
				return { variant: 'info', label: '資訊' };
		}
	}

	/**
	 * 取得分類標籤
	 */
	getCategoryLabel(category: NotificationCategory): string {
		const option = categoryOptions.find((opt) => opt.value === category);
		return option?.label ?? '未知';
	}
}

export const notificationsService = new NotificationsService();
