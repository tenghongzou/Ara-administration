/**
 * 訂閱管理 API 模組
 */

import type {
	Subscription,
	PaymentHistory,
	CreateSubscriptionData,
	UpdateSubscriptionData,
	SubscriptionStats,
	ServiceCategory,
	PaginatedData
} from '$lib/types';
import { httpClient, HttpError } from '../core/http-client';

export interface GetSubscriptionsParams {
	page?: number;
	pageSize?: number;
	search?: string;
	category?: string;
	status?: string;
	billingCycle?: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
}

interface SubscriptionsResponse {
	data: Subscription[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
}

interface SubscriptionResponse {
	subscription: Subscription;
}

interface PaymentResponse {
	payment: PaymentHistory;
}

export const subscriptionsApi = {
	async getSubscriptions(params: GetSubscriptionsParams = {}): Promise<PaginatedData<Subscription>> {
		const searchParams = new URLSearchParams();

		if (params.page) searchParams.set('page', String(params.page));
		if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
		if (params.search) searchParams.set('search', params.search);
		if (params.category) searchParams.set('category', params.category);
		if (params.status) searchParams.set('status', params.status);
		if (params.billingCycle) searchParams.set('billingCycle', params.billingCycle);
		if (params.sortBy) searchParams.set('sortBy', params.sortBy);
		if (params.sortDirection) searchParams.set('sortDirection', params.sortDirection);

		const query = searchParams.toString();
		const response = await httpClient.get<SubscriptionsResponse>(
			`/subscriptions${query ? `?${query}` : ''}`
		);

		// 確保空資料時也返回正確格式，不拋出錯誤
		return {
			data: response.data || [],
			pagination: response.pagination || {
				page: params.page || 1,
				pageSize: params.pageSize || 10,
				total: 0,
				totalPages: 0
			}
		};
	},

	async getSubscription(id: string): Promise<Subscription> {
		try {
			const response = await httpClient.get<SubscriptionResponse>(`/subscriptions/${id}`);
			return response.subscription;
		} catch (error) {
			if (error instanceof HttpError && error.status === 404) {
				throw new Error('訂閱不存在');
			}
			throw error;
		}
	},

	async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
		try {
			const response = await httpClient.post<SubscriptionResponse>('/subscriptions', data);
			return response.subscription;
		} catch (error) {
			if (error instanceof HttpError) {
				throw new Error(error.error || '建立訂閱失敗');
			}
			throw error;
		}
	},

	async updateSubscription(id: string, data: UpdateSubscriptionData): Promise<Subscription> {
		try {
			const response = await httpClient.patch<SubscriptionResponse>(`/subscriptions/${id}`, data);
			return response.subscription;
		} catch (error) {
			if (error instanceof HttpError) {
				if (error.status === 404) {
					throw new Error('訂閱不存在');
				}
				throw new Error(error.error || '更新訂閱失敗');
			}
			throw error;
		}
	},

	async deleteSubscription(id: string): Promise<void> {
		try {
			await httpClient.delete(`/subscriptions/${id}`);
		} catch (error) {
			if (error instanceof HttpError) {
				if (error.status === 404) {
					throw new Error('訂閱不存在');
				}
			}
			throw error;
		}
	},

	async getStatistics(): Promise<SubscriptionStats> {
		const response = await httpClient.get<SubscriptionStats>('/subscriptions/stats');
		// 確保空資料時也返回正確格式
		return {
			totalMonthly: response.totalMonthly ?? 0,
			totalYearly: response.totalYearly ?? 0,
			upcomingCount: response.upcomingCount ?? 0,
			activeCount: response.activeCount ?? 0
		};
	},

	async getUpcoming(days: number = 7): Promise<Subscription[]> {
		const response = await httpClient.get<{ data: Subscription[] }>(
			`/subscriptions/upcoming?days=${days}`
		);
		return response.data || [];
	},

	/**
	 * 取得即將到期的訂閱提醒
	 */
	async getUpcomingReminders(days: number = 7): Promise<UpcomingReminder[]> {
		const response = await httpClient.get<{ data: UpcomingReminder[] }>(
			`/subscriptions/reminders?days=${days}`
		);
		return response.data || [];
	},

	/**
	 * 取得付款歷史
	 */
	async getPaymentHistory(subscriptionId: string): Promise<PaymentHistory[]> {
		const response = await httpClient.get<{ data: PaymentHistory[] }>(
			`/subscriptions/${subscriptionId}/payments`
		);
		return response.data || [];
	},

	/**
	 * 新增付款記錄
	 */
	async createPayment(subscriptionId: string, data: CreatePaymentData): Promise<PaymentHistory> {
		const response = await httpClient.post<PaymentResponse>(
			`/subscriptions/${subscriptionId}/payments`,
			data
		);
		return response.payment;
	},

	/**
	 * 取得訂閱分析數據
	 */
	async getAnalytics(): Promise<AnalyticsData> {
		const response = await httpClient.get<AnalyticsData>('/subscriptions/analytics');
		// 確保空資料時也返回正確格式
		return {
			monthlyTrend: response.monthlyTrend || [],
			categoryBreakdown: response.categoryBreakdown || [],
			yearlyProjection: response.yearlyProjection ?? 0,
			averageMonthly: response.averageMonthly ?? 0
		};
	},

	/**
	 * 取得日曆視圖數據
	 */
	async getCalendarData(year: number, month: number): Promise<CalendarDayData[]> {
		const response = await httpClient.get<{ data: CalendarDayData[] }>(
			`/subscriptions/calendar?year=${year}&month=${month + 1}`
		);
		return response.data || [];
	},

	/**
	 * 批量匯入訂閱
	 */
	async importSubscriptions(data: CreateSubscriptionData[]): Promise<ImportResult> {
		let success = 0;
		let failed = 0;
		const errors: ImportResult['errors'] = [];

		for (let i = 0; i < data.length; i++) {
			const item = data[i];
			try {
				await this.createSubscription(item);
				success++;
			} catch (error) {
				failed++;
				errors.push({
					row: i + 1,
					field: 'general',
					message: error instanceof Error ? error.message : '匯入失敗'
				});
			}
		}

		return {
			success,
			failed,
			duplicates: 0,
			errors
		};
	},

	/**
	 * 取得所有訂閱名稱 (用於重複檢測)
	 */
	async getSubscriptionNames(): Promise<string[]> {
		const { data: subscriptions } = await this.getSubscriptions({ pageSize: 100 });
		return subscriptions.map((s) => s.name);
	}
};

// 類型定義
export interface UpcomingReminder {
	subscription: Subscription;
	daysUntilBilling: number;
	reminderType: 'due_soon' | 'due_today' | 'overdue';
}

export interface MonthlySpending {
	month: string;
	amount: number;
	count: number;
}

export interface CategorySpending {
	category: ServiceCategory;
	amounts: Record<string, number>;
	percentages: Record<string, number>;
	count?: number;
}

export interface AnalyticsData {
	monthlyTrend: MonthlySpending[];
	categoryBreakdown: CategorySpending[];
	yearlyProjection: number;
	averageMonthly: number;
}

export interface CalendarDayData {
	date: string;
	subscriptions: Subscription[];
	totalAmounts: Record<string, number>;
}

export interface ImportResult {
	success: number;
	failed: number;
	duplicates: number;
	errors: { row: number; field: string; message: string }[];
}

export interface CreatePaymentData {
	amount?: number;
	currency?: string;
	paidAt?: string;
	status?: 'paid' | 'failed' | 'pending';
	note?: string;
}
