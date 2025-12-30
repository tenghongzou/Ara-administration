/**
 * Subscriptions 模組類型定義
 */

import type {
	Subscription,
	ServiceCategory,
	BillingCycle,
	PaymentMethod,
	SubscriptionStatus
} from '$lib/types';

// ==================== 篩選相關 ====================

export interface SubscriptionFilters {
	search?: string;
	category?: ServiceCategory | '';
	status?: SubscriptionStatus | '';
	billingCycle?: BillingCycle | '';
}

export interface SubscriptionSortOptions {
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
}

// ==================== 表單相關 ====================

export interface SubscriptionFormData {
	name: string;
	category: ServiceCategory;
	cost: number | '';
	currency: string;
	billingCycle: BillingCycle;
	nextBillingDate: string;
	status: SubscriptionStatus;
	description: string;
	website: string;
	accountEmail: string;
	paymentMethod: PaymentMethod | '';
	autoRenew: boolean;
	reminderDays: number | '';
}

export interface SubscriptionFormErrors {
	name?: string;
	cost?: string;
	nextBillingDate?: string;
	accountEmail?: string;
	website?: string;
}

// ==================== 統計和分析 ====================

export interface SubscriptionStatsDisplay {
	totalMonthly: string[];
	totalYearly: string[];
	upcomingCount: number;
	activeCount: number;
}

export interface MonthlySpending {
	month: string;
	amount: number;
	count: number;
}

export interface CategorySpending {
	category: ServiceCategory;
	amount: number;
	percentage: number;
}

export interface AnalyticsData {
	monthlyTrend: MonthlySpending[];
	categoryBreakdown: CategorySpending[];
	yearlyProjection: number;
	averageMonthly: number;
}

// ==================== 日曆相關 ====================

export interface CalendarDayData {
	date: string;
	subscriptions: Subscription[];
	totalAmounts: Record<string, number>;
}

export interface CalendarStats {
	monthlyTotals: Record<string, number>;
	monthlyCount: number;
	daysWithPayments: number;
}

// ==================== 提醒相關 ====================

export interface UpcomingReminder {
	subscription: Subscription;
	daysUntilBilling: number;
	reminderType: 'due_soon' | 'due_today' | 'overdue';
}

// ==================== 匯入相關 ====================

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'complete';

export interface ImportResult {
	success: number;
	failed: number;
	duplicates: number;
	errors: ImportError[];
}

export interface ImportError {
	row: number;
	field: string;
	message: string;
}

// ==================== 選項定義 ====================

export interface SelectOption<T = string> {
	value: T;
	label: string;
}

export const categoryOptions: SelectOption<ServiceCategory | ''>[] = [
	{ value: '', label: '全部分類' },
	{ value: 'streaming', label: '影音串流' },
	{ value: 'music', label: '音樂' },
	{ value: 'cloud', label: '雲端儲存' },
	{ value: 'productivity', label: '生產力工具' },
	{ value: 'gaming', label: '遊戲' },
	{ value: 'other', label: '其他' }
];

export const statusOptions: SelectOption<SubscriptionStatus | ''>[] = [
	{ value: '', label: '全部狀態' },
	{ value: 'active', label: '啟用中' },
	{ value: 'paused', label: '已暫停' },
	{ value: 'cancelled', label: '已取消' },
	{ value: 'expired', label: '已過期' }
];

export const billingCycleOptions: SelectOption<BillingCycle | ''>[] = [
	{ value: '', label: '全部週期' },
	{ value: 'weekly', label: '週繳' },
	{ value: 'monthly', label: '月繳' },
	{ value: 'quarterly', label: '季繳' },
	{ value: 'semi-annual', label: '半年繳' },
	{ value: 'annual', label: '年繳' }
];

export const currencyOptions: SelectOption[] = [
	{ value: 'TWD', label: 'TWD (新台幣)' },
	{ value: 'USD', label: 'USD (美元)' },
	{ value: 'EUR', label: 'EUR (歐元)' },
	{ value: 'JPY', label: 'JPY (日圓)' }
];

export const paymentMethodOptions: SelectOption<PaymentMethod | ''>[] = [
	{ value: '', label: '請選擇' },
	{ value: 'credit_card', label: '信用卡' },
	{ value: 'debit_card', label: '金融卡' },
	{ value: 'bank_transfer', label: '銀行轉帳' },
	{ value: 'paypal', label: 'PayPal' },
	{ value: 'other', label: '其他' }
];
