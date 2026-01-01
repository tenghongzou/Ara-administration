import type { Notification } from '$lib/stores/notifications';

import type { NotificationType } from '$lib/types';

/**
 * 通知分類（匹配後端 NotificationType + 'all' 選項）
 */
export type NotificationCategory = 'all' | NotificationType;

/**
 * 通知狀態篩選
 */
export type NotificationStatus = 'all' | 'read' | 'unread';

/**
 * 通知篩選條件
 */
export interface NotificationFilters {
	category: NotificationCategory;
	status: NotificationStatus;
	search?: string;
	dateRange?: {
		start: string;
		end: string;
	};
}

/**
 * 批量操作類型
 */
export type BatchActionType = 'markRead' | 'markUnread' | 'delete';

/**
 * 批量操作
 */
export interface NotificationBatchAction {
	type: BatchActionType;
	ids: string[];
}

/**
 * 通知類型樣式
 */
export interface NotificationTypeStyle {
	icon: string;
	bg: string;
	text: string;
	border: string;
}

/**
 * 通知徽章資訊
 */
export interface NotificationBadgeInfo {
	variant: 'success' | 'warning' | 'error' | 'default' | 'info';
	label: string;
}

/**
 * 分類選項
 */
export interface CategoryOption {
	value: NotificationCategory;
	label: string;
	icon: string;
}

/**
 * 擴展通知類型（包含選擇狀態）
 */
export interface SelectableNotification extends Notification {
	selected?: boolean;
}

/**
 * 通知詳情（用於詳情頁）
 */
export interface NotificationDetail extends Notification {
	relatedNotifications?: Notification[];
}
