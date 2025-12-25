// Types
export type {
	NotificationCategory,
	NotificationStatus,
	NotificationFilters,
	BatchActionType,
	NotificationBatchAction,
	NotificationTypeStyle,
	NotificationBadgeInfo,
	CategoryOption,
	SelectableNotification,
	NotificationDetail
} from './types';

// Services
export { notificationsService, categoryOptions } from './services/notifications.service';

// Components - 使用不同名稱避免衝突
export { default as NotificationFiltersPanel } from './components/NotificationFilters.svelte';
export { default as NotificationItem } from './components/NotificationItem.svelte';
export { default as NotificationBatchActions } from './components/NotificationBatchActions.svelte';
export { default as NotificationHeader } from './components/NotificationHeader.svelte';
export { default as NotificationEmptyState } from './components/NotificationEmptyState.svelte';
export { default as NotificationList } from './components/NotificationList.svelte';
export { default as NotificationsContent } from './components/NotificationsContent.svelte';
export { default as NotificationDetailContent } from './components/NotificationDetailContent.svelte';

// Module config for registration
import type { ModuleConfig } from '../types';
import { navIcons } from '../navigation';

export const notificationsModuleConfig: ModuleConfig = {
	id: 'notifications',
	name: '通知中心',
	description: '系統通知管理',
	basePath: '/notifications',
	navigation: [
		{
			id: 'notifications',
			label: '通知中心',
			href: '/notifications',
			icon: navIcons.notifications,
			order: 20
		}
	],
	enabled: true
};
