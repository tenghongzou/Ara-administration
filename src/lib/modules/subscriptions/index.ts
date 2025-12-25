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

// Components - List Page
export { default as StatsCards } from './components/StatsCards.svelte';
export { default as SubscriptionFiltersPanel } from './components/SubscriptionFiltersPanel.svelte';
export { default as SubscriptionActions } from './components/SubscriptionActions.svelte';
export { default as SubscriptionTableCells } from './components/SubscriptionTableCells.svelte';
export { default as SubscriptionDeleteModals } from './components/SubscriptionDeleteModals.svelte';
export { default as SubscriptionDataGrid } from './components/SubscriptionDataGrid.svelte';
export { default as SubscriptionListView } from './components/SubscriptionListView.svelte';
export { default as SubscriptionsContent } from './components/SubscriptionsContent.svelte';

// Components - Analytics Page
export { default as AnalyticsStatsCards } from './components/AnalyticsStatsCards.svelte';
export { default as MonthlyTrendCard } from './components/MonthlyTrendCard.svelte';
export { default as CategoryPieCard } from './components/CategoryPieCard.svelte';
export { default as CategoryBreakdownCard } from './components/CategoryBreakdownCard.svelte';
export { default as AnalyticsContent } from './components/AnalyticsContent.svelte';

// Components - Calendar Page
export { default as CalendarStatsPanel } from './components/CalendarStatsPanel.svelte';
export { default as CalendarDayModal } from './components/CalendarDayModal.svelte';
export { default as CalendarHelpCard } from './components/CalendarHelpCard.svelte';
export { default as CalendarContent } from './components/CalendarContent.svelte';

// Components - Form Page
export { default as SubscriptionForm } from './components/SubscriptionForm.svelte';

// Components - Detail Page
export { default as SubscriptionInfoCard } from './components/SubscriptionInfoCard.svelte';
export { default as SubscriptionDetailContent } from './components/SubscriptionDetailContent.svelte';

// Components - Import Page
export { default as ImportStepIndicator } from './components/ImportStepIndicator.svelte';
export { default as ImportUploadStep } from './components/ImportUploadStep.svelte';
export { default as ImportMappingStep } from './components/ImportMappingStep.svelte';
export { default as ImportPreviewStep } from './components/ImportPreviewStep.svelte';
export { default as ImportCompleteStep } from './components/ImportCompleteStep.svelte';
export { default as ImportContent } from './components/ImportContent.svelte';
export type { ImportStep } from './components/ImportStepIndicator.svelte';

// Components - Shared
export { default as PaymentHistoryList } from './components/PaymentHistoryList.svelte';
export { default as CategoryBreakdown } from './components/CategoryBreakdown.svelte';
export { default as SubscriptionCard } from './components/SubscriptionCard.svelte';

// Re-export cell utilities
export {
	formatCurrency,
	formatDate,
	isUpcoming,
	getCategoryLabel,
	getCategoryColor,
	getStatusLabel,
	getStatusColor,
	getBillingCycleLabel
} from './components/SubscriptionTableCells.svelte';

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
