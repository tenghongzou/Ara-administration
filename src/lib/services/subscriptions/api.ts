/**
 * 訂閱管理 API 模組
 * 對接後端 /api/v1/subscriptions 端點
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
import { apiClient, ApiError } from '../core/api-client';
import { config } from '$lib/constants';
import { mockSubscriptionsApi } from '$lib/mock';

// ============================================================================
// Types
// ============================================================================

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

/**
 * 後端 /subscriptions/stats 回傳格式
 * 根據 API 文檔：
 * {
 *   "data": {
 *     "totalSubscriptions": 15,
 *     "activeSubscriptions": 12,
 *     "monthlySpending": 2500.00,
 *     "yearlySpending": 30000.00
 *   }
 * }
 */
interface BackendSubscriptionStatsResponse {
	totalSubscriptions: number;
	activeSubscriptions: number;
	monthlySpending: number;
	yearlySpending: number;
}

export interface UpcomingReminder {
	subscriptionId: string;
	name: string;
	type: 'billing_due' | 'overdue' | 'due_today' | 'due_soon';
	message?: string;
	daysUntil: number;
	amount: number;
	currency: string;
}

export interface MonthlySpending {
	month: string;
	spending: number;
	count: number;
}

export interface CategorySpending {
	category: string;
	label: string;
	count: number;
	totalCost: number;
	percentage: number;
}

export interface AnalyticsData {
	monthlyTrend: MonthlySpending[];
	categoryBreakdown: CategorySpending[];
	topSubscriptions: {
		id: string;
		name: string;
		cost: number;
		currency: string;
	}[];
}

export interface CalendarDayData {
	date: string;
	subscriptions: {
		id: string;
		name: string;
		cost: number;
		currency: string;
	}[];
	totalAmount?: number;
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
	status?: 'paid' | 'pending' | 'failed' | 'refunded';
	note?: string;
}

// ============================================================================
// Subscriptions API
// ============================================================================

export const subscriptionsApi = {
	/**
	 * 取得訂閱列表
	 * GET /api/v1/subscriptions
	 */
	async getSubscriptions(params: GetSubscriptionsParams = {}): Promise<PaginatedData<Subscription>> {
		if (config.isMockMode) {
			return mockSubscriptionsApi.getSubscriptions(params);
		}

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
		const response = await apiClient.get<SubscriptionsResponse>(
			`/subscriptions${query ? `?${query}` : ''}`
		);

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

	/**
	 * 取得單一訂閱
	 * GET /api/v1/subscriptions/{id}
	 */
	async getSubscription(id: string): Promise<Subscription> {
		if (config.isMockMode) {
			return mockSubscriptionsApi.getSubscription(id);
		}

		try {
			return await apiClient.get<Subscription>(`/subscriptions/${id}`);
		} catch (error) {
			if (error instanceof ApiError && error.isNotFound()) {
				throw new Error('訂閱不存在');
			}
			throw error;
		}
	},

	/**
	 * 建立訂閱
	 * POST /api/v1/subscriptions
	 */
	async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
		if (config.isMockMode) {
			return mockSubscriptionsApi.createSubscription(data);
		}

		try {
			return await apiClient.post<Subscription>('/subscriptions', data);
		} catch (error) {
			if (error instanceof ApiError) {
				throw new Error(error.message || '建立訂閱失敗');
			}
			throw error;
		}
	},

	/**
	 * 更新訂閱
	 * PUT/PATCH /api/v1/subscriptions/{id}
	 */
	async updateSubscription(id: string, data: UpdateSubscriptionData): Promise<Subscription> {
		if (config.isMockMode) {
			// Convert UpdateSubscriptionData to Partial<Subscription> for mock API
			const mockData: Partial<Subscription> = {};
			if (data.name !== undefined) mockData.name = data.name;
			if (data.logo !== undefined) mockData.logo = data.logo;
			if (data.category !== undefined) mockData.category = data.category;
			if (data.cost !== undefined) mockData.cost = data.cost;
			if (data.currency !== undefined) mockData.currency = data.currency;
			if (data.billingCycle !== undefined) mockData.billingCycle = data.billingCycle;
			if (data.nextBillingDate !== undefined) mockData.nextBillingDate = data.nextBillingDate;
			if (data.status !== undefined) mockData.status = data.status;
			if (data.description !== undefined) mockData.description = data.description ?? undefined;
			if (data.website !== undefined) mockData.website = data.website ?? undefined;
			if (data.accountEmail !== undefined) mockData.accountEmail = data.accountEmail ?? undefined;
			if (data.paymentMethod !== undefined) mockData.paymentMethod = data.paymentMethod ?? undefined;
			if (data.autoRenew !== undefined) mockData.autoRenew = data.autoRenew;
			if (data.reminderDays !== undefined) mockData.reminderDays = data.reminderDays ?? undefined;
			if (data.startDate !== undefined) mockData.startDate = data.startDate;
			return mockSubscriptionsApi.updateSubscription(id, mockData);
		}

		try {
			return await apiClient.patch<Subscription>(`/subscriptions/${id}`, data);
		} catch (error) {
			if (error instanceof ApiError) {
				if (error.isNotFound()) {
					throw new Error('訂閱不存在');
				}
				throw new Error(error.message || '更新訂閱失敗');
			}
			throw error;
		}
	},

	/**
	 * 刪除訂閱
	 * DELETE /api/v1/subscriptions/{id}
	 */
	async deleteSubscription(id: string): Promise<void> {
		if (config.isMockMode) {
			return mockSubscriptionsApi.deleteSubscription(id);
		}

		try {
			await apiClient.delete(`/subscriptions/${id}`);
		} catch (error) {
			if (error instanceof ApiError && error.isNotFound()) {
				throw new Error('訂閱不存在');
			}
			throw error;
		}
	},

	/**
	 * 取得訂閱統計
	 * GET /api/v1/subscriptions/stats + GET /api/v1/subscriptions/upcoming
	 *
	 * 後端 /stats 返回格式：
	 * {
	 *   "data": {
	 *     "totalSubscriptions": 15,
	 *     "activeSubscriptions": 12,
	 *     "monthlySpending": 2500.00,
	 *     "yearlySpending": 30000.00
	 *   }
	 * }
	 *
	 * 由於後端 /stats 不包含 upcomingCount，額外呼叫 /upcoming 取得
	 */
	async getStatistics(): Promise<SubscriptionStats> {
		if (config.isMockMode) {
			const [stats, reminders] = await Promise.all([
				mockSubscriptionsApi.getStatistics(),
				mockSubscriptionsApi.getUpcomingReminders(7)
			]);
			return {
				totalMonthly: stats.monthlySpending,
				totalYearly: stats.yearlySpending,
				upcomingCount: reminders.length,
				activeCount: stats.activeCount
			};
		}

		// 並行呼叫 /stats 和 /upcoming 以取得完整統計
		const [statsData, upcomingData] = await Promise.all([
			apiClient.get<BackendSubscriptionStatsResponse>('/subscriptions/stats'),
			apiClient.get<Subscription[]>('/subscriptions/upcoming?days=7').catch(() => [] as Subscription[])
		]);

		// 映射後端欄位到前端預期格式
		return {
			totalMonthly: statsData.monthlySpending ?? 0,
			totalYearly: statsData.yearlySpending ?? 0,
			upcomingCount: upcomingData.length,
			activeCount: statsData.activeSubscriptions ?? 0
		};
	},

	/**
	 * 取得即將到期的訂閱
	 * GET /api/v1/subscriptions/upcoming
	 */
	async getUpcoming(days: number = 7): Promise<Subscription[]> {
		if (config.isMockMode) {
			const reminders = await mockSubscriptionsApi.getUpcomingReminders(days);
			const { data: subs } = await mockSubscriptionsApi.getSubscriptions();
			return reminders
				.map((r) => subs.find((s) => s.id === r.subscriptionId))
				.filter((s): s is Subscription => s !== undefined);
		}

		return apiClient.get<Subscription[]>(`/subscriptions/upcoming?days=${days}`);
	},

	/**
	 * 取得即將到期的訂閱提醒
	 * GET /api/v1/subscriptions/reminders
	 *
	 * 後端返回格式：
	 * {
	 *   "data": [
	 *     {
	 *       "subscriptionId": "uuid",
	 *       "name": "Netflix",
	 *       "type": "billing_due",
	 *       "message": "Netflix 將於 3 天後扣款",
	 *       "daysUntil": 3,
	 *       "amount": 390,
	 *       "currency": "TWD"
	 *     }
	 *   ]
	 * }
	 */
	async getUpcomingReminders(days: number = 7): Promise<UpcomingReminder[]> {
		if (config.isMockMode) {
			const reminders = await mockSubscriptionsApi.getUpcomingReminders(days);
			return reminders.map((r) => ({
				subscriptionId: r.subscriptionId,
				name: r.subscriptionName || '',
				type: r.type === 'overdue' ? 'overdue' : r.type === 'due_today' ? 'due_today' : 'due_soon',
				daysUntil: r.daysUntilDue,
				amount: r.amount || 0,
				currency: r.currency || 'TWD'
			}));
		}

		return apiClient.get<UpcomingReminder[]>(`/subscriptions/reminders?days=${days}`);
	},

	/**
	 * 取得付款歷史
	 * GET /api/v1/subscriptions/{id}/payments
	 */
	async getPaymentHistory(subscriptionId: string): Promise<PaymentHistory[]> {
		if (config.isMockMode) {
			return mockSubscriptionsApi.getPaymentHistory(subscriptionId);
		}

		return apiClient.get<PaymentHistory[]>(`/subscriptions/${subscriptionId}/payments`);
	},

	/**
	 * 新增付款記錄
	 * POST /api/v1/subscriptions/{id}/payments
	 */
	async createPayment(subscriptionId: string, data: CreatePaymentData): Promise<PaymentHistory> {
		return apiClient.post<PaymentHistory>(
			`/subscriptions/${subscriptionId}/payments`,
			data
		);
	},

	/**
	 * 取得訂閱分析數據
	 * GET /api/v1/subscriptions/analytics
	 */
	async getAnalytics(): Promise<AnalyticsData> {
		const data = await apiClient.get<AnalyticsData>('/subscriptions/analytics');
		return {
			monthlyTrend: data.monthlyTrend || [],
			categoryBreakdown: data.categoryBreakdown || [],
			topSubscriptions: data.topSubscriptions || []
		};
	},

	/**
	 * 取得日曆視圖數據
	 * GET /api/v1/subscriptions/calendar
	 */
	async getCalendarData(year: number, month: number): Promise<CalendarDayData[]> {
		return apiClient.get<CalendarDayData[]>(
			`/subscriptions/calendar?year=${year}&month=${month + 1}`
		);
	},

	/**
	 * 批量匯入訂閱
	 * 使用 POST /api/v1/subscriptions 逐一建立
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
