// Types
export type { DashboardStats, Activity, DashboardData, ReminderType, ReminderBadgeInfo } from './types';

// Services
export { dashboardService } from './services/dashboard.service';

// Components
export { default as StatsGrid } from './components/StatsGrid.svelte';
export { default as ActivityFeed } from './components/ActivityFeed.svelte';
export { default as QuickActions } from './components/QuickActions.svelte';
export { default as SubscriptionReminders } from './components/SubscriptionReminders.svelte';

// Module config for registration
import type { ModuleConfig } from '../types';
import { navIcons } from '../navigation';

export const dashboardModuleConfig: ModuleConfig = {
	id: 'dashboard',
	name: '儀表板',
	description: '系統概覽和統計數據',
	basePath: '/dashboard',
	navigation: [
		{
			id: 'dashboard',
			label: '儀表板',
			href: '/dashboard',
			icon: navIcons.dashboard,
			order: 0
		}
	],
	enabled: true
};
