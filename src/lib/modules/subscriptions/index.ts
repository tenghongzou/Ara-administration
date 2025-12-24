/**
 * Subscriptions 模組
 * 訂閱管理功能模組
 */

// Types
export type {
	SubscriptionFilters,
	SubscriptionSortOptions,
	SubscriptionFormData,
	SubscriptionFormErrors,
	SubscriptionStatsDisplay,
	MonthlySpending,
	CategorySpending,
	AnalyticsData,
	CalendarDayData,
	CalendarStats,
	UpcomingReminder,
	ImportResult,
	ImportError,
	SelectOption
} from './types';

export {
	categoryOptions,
	statusOptions,
	billingCycleOptions,
	currencyOptions,
	paymentMethodOptions
} from './types';

// Services
export { subscriptionsService } from './services/subscriptions.service';

// Components
export { default as StatsCards } from './components/StatsCards.svelte';
export { default as SubscriptionFiltersPanel } from './components/SubscriptionFiltersPanel.svelte';
export { default as PaymentHistoryList } from './components/PaymentHistoryList.svelte';
export { default as CategoryBreakdown } from './components/CategoryBreakdown.svelte';
export { default as SubscriptionCard } from './components/SubscriptionCard.svelte';
export { default as CalendarStatsPanel } from './components/CalendarStatsPanel.svelte';

// Module config for registration
import type { ModuleConfig } from '../types';

export const subscriptionsModuleConfig: ModuleConfig = {
	id: 'subscriptions',
	name: '訂閱管理',
	description: '管理訂閱服務和費用追蹤',
	basePath: '/subscriptions',
	// 導航由 core 模組處理，見 navigation/config.ts
	navigation: [],
	enabled: true
};
