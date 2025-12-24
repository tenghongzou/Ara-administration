/**
 * 訂閱管理 API 模組
 */

import type {
	Subscription,
	PaymentHistory,
	CreateSubscriptionData,
	UpdateSubscriptionData,
	SubscriptionStats,
	BillingCycle,
	ServiceCategory,
	PaginatedData
} from '$lib/types';
import { mockSubscriptions, mockPaymentHistory } from '../mock-data';
import { delay, createPaginatedResponse, sortByField, filterBySearch } from '../core';

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

function toMonthlyCost(cost: number, cycle: BillingCycle): number {
	switch (cycle) {
		case 'weekly':
			return cost * 4;
		case 'monthly':
			return cost;
		case 'quarterly':
			return cost / 3;
		case 'semi-annual':
			return cost / 6;
		case 'annual':
			return cost / 12;
	}
}

export const subscriptionsApi = {
	async getSubscriptions(params: GetSubscriptionsParams = {}): Promise<PaginatedData<Subscription>> {
		await delay(600);

		const {
			page = 1,
			pageSize = 10,
			search,
			category,
			status,
			billingCycle,
			sortBy,
			sortDirection = 'asc'
		} = params;

		let filtered = [...mockSubscriptions];

		// 搜尋過濾
		filtered = filterBySearch(filtered, search, ['name']);

		// 分類過濾
		if (category) {
			filtered = filtered.filter((sub) => sub.category === category);
		}

		// 狀態過濾
		if (status) {
			filtered = filtered.filter((sub) => sub.status === status);
		}

		// 帳單週期過濾
		if (billingCycle) {
			filtered = filtered.filter((sub) => sub.billingCycle === billingCycle);
		}

		// 排序
		filtered = sortByField(filtered, sortBy, sortDirection);

		return createPaginatedResponse(mockSubscriptions, filtered, page, pageSize);
	},

	async getSubscription(id: string): Promise<Subscription> {
		await delay(400);
		const subscription = mockSubscriptions.find((s) => s.id === id);
		if (!subscription) throw new Error('訂閱不存在');
		return subscription;
	},

	async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
		await delay(600);
		const newSubscription: Subscription = {
			id: String(mockSubscriptions.length + 1),
			name: data.name,
			category: data.category,
			cost: data.cost,
			currency: data.currency || 'TWD',
			billingCycle: data.billingCycle,
			nextBillingDate: data.nextBillingDate,
			status: data.status || 'active',
			description: data.description,
			website: data.website,
			accountEmail: data.accountEmail,
			paymentMethod: data.paymentMethod,
			autoRenew: data.autoRenew ?? true,
			reminderDays: data.reminderDays,
			startDate: data.startDate || new Date().toISOString().split('T')[0],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		mockSubscriptions.push(newSubscription);
		return newSubscription;
	},

	async updateSubscription(id: string, data: UpdateSubscriptionData): Promise<Subscription> {
		await delay(500);
		const index = mockSubscriptions.findIndex((s) => s.id === id);
		if (index === -1) throw new Error('訂閱不存在');

		mockSubscriptions[index] = {
			...mockSubscriptions[index],
			...data,
			updatedAt: new Date().toISOString()
		};
		return mockSubscriptions[index];
	},

	async deleteSubscription(id: string): Promise<void> {
		await delay(400);
		const index = mockSubscriptions.findIndex((s) => s.id === id);
		if (index === -1) throw new Error('訂閱不存在');
		mockSubscriptions.splice(index, 1);
	},

	async getPaymentHistory(subscriptionId: string): Promise<PaymentHistory[]> {
		await delay(400);
		return mockPaymentHistory
			.filter((p) => p.subscriptionId === subscriptionId)
			.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
	},

	async getStatistics(): Promise<SubscriptionStats> {
		await delay(300);

		const activeSubscriptions = mockSubscriptions.filter((s) => s.status === 'active');

		const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
			return sum + toMonthlyCost(sub.cost, sub.billingCycle);
		}, 0);

		const now = new Date();
		const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

		const upcomingCount = activeSubscriptions.filter((sub) => {
			const nextBilling = new Date(sub.nextBillingDate);
			return nextBilling >= now && nextBilling <= sevenDaysLater;
		}).length;

		return {
			totalMonthly: Math.round(totalMonthly),
			totalYearly: Math.round(totalMonthly * 12),
			upcomingCount,
			activeCount: activeSubscriptions.length
		};
	},

	/**
	 * 取得即將到期的訂閱提醒
	 */
	async getUpcomingReminders(days: number = 7): Promise<UpcomingReminder[]> {
		await delay(300);

		const now = new Date();
		now.setHours(0, 0, 0, 0);
		const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

		const activeSubscriptions = mockSubscriptions.filter((s) => s.status === 'active');

		const reminders: UpcomingReminder[] = [];

		for (const subscription of activeSubscriptions) {
			const nextBilling = new Date(subscription.nextBillingDate);
			nextBilling.setHours(0, 0, 0, 0);

			const daysUntilBilling = Math.ceil(
				(nextBilling.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
			);

			// 檢查是否在提醒範圍內 (考慮用戶設定的提醒天數)
			const reminderDays = subscription.reminderDays || 3;

			if (daysUntilBilling <= reminderDays && daysUntilBilling >= -7) {
				let reminderType: UpcomingReminder['reminderType'];
				if (daysUntilBilling < 0) {
					reminderType = 'overdue';
				} else if (daysUntilBilling === 0) {
					reminderType = 'due_today';
				} else {
					reminderType = 'due_soon';
				}

				reminders.push({
					subscription,
					daysUntilBilling,
					reminderType
				});
			}
		}

		// 按日期排序 (最近的在前)
		return reminders.sort((a, b) => a.daysUntilBilling - b.daysUntilBilling);
	},

	/**
	 * 取得訂閱分析數據
	 */
	async getAnalytics(): Promise<AnalyticsData> {
		await delay(400);

		const activeSubscriptions = mockSubscriptions.filter((s) => s.status === 'active');

		// 計算分類支出
		const categoryMap = new Map<ServiceCategory, number>();
		let totalMonthly = 0;

		for (const sub of activeSubscriptions) {
			const monthlyCost = toMonthlyCost(sub.cost, sub.billingCycle);
			totalMonthly += monthlyCost;

			const current = categoryMap.get(sub.category) || 0;
			categoryMap.set(sub.category, current + monthlyCost);
		}

		const categoryBreakdown: CategorySpending[] = Array.from(categoryMap.entries()).map(
			([category, amount]) => ({
				category,
				amount: Math.round(amount),
				percentage: Math.round((amount / totalMonthly) * 100)
			})
		);

		// 按金額排序
		categoryBreakdown.sort((a, b) => b.amount - a.amount);

		// 生成過去12個月的模擬趨勢數據
		const monthlyTrend: MonthlySpending[] = [];
		const now = new Date();

		for (let i = 11; i >= 0; i--) {
			const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const month = date.toISOString().slice(0, 7);

			// 模擬數據：基礎值 + 隨機波動
			const baseAmount = totalMonthly;
			const variance = (Math.random() - 0.5) * baseAmount * 0.2; // ±10% 波動
			const amount = Math.round(baseAmount + variance);

			monthlyTrend.push({
				month,
				amount,
				count: activeSubscriptions.length + Math.floor((Math.random() - 0.5) * 3)
			});
		}

		return {
			monthlyTrend,
			categoryBreakdown,
			yearlyProjection: Math.round(totalMonthly * 12),
			averageMonthly: Math.round(totalMonthly)
		};
	},

	/**
	 * 取得日曆視圖數據
	 */
	async getCalendarData(year: number, month: number): Promise<CalendarDayData[]> {
		await delay(300);

		const activeSubscriptions = mockSubscriptions.filter((s) => s.status === 'active');
		const calendarData: CalendarDayData[] = [];

		// 取得該月的所有日期
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		for (let day = 1; day <= daysInMonth; day++) {
			const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

			const subscriptionsOnDay = activeSubscriptions.filter((sub) => {
				const billingDate = new Date(sub.nextBillingDate);
				return billingDate.getDate() === day;
			});

			if (subscriptionsOnDay.length > 0) {
				const totalAmount = subscriptionsOnDay.reduce((sum, sub) => sum + sub.cost, 0);
				calendarData.push({
					date: dateStr,
					subscriptions: subscriptionsOnDay,
					totalAmount
				});
			}
		}

		return calendarData;
	},

	/**
	 * 批量匯入訂閱
	 */
	async importSubscriptions(data: CreateSubscriptionData[]): Promise<ImportResult> {
		await delay(800);

		let success = 0;
		let failed = 0;
		const errors: ImportResult['errors'] = [];

		for (let i = 0; i < data.length; i++) {
			const item = data[i];
			try {
				// 驗證必填欄位
				if (!item.name || !item.cost || !item.nextBillingDate) {
					throw new Error('缺少必填欄位');
				}

				const newSubscription: Subscription = {
					id: String(mockSubscriptions.length + success + 1),
					name: item.name,
					category: item.category,
					cost: item.cost,
					currency: item.currency || 'TWD',
					billingCycle: item.billingCycle,
					nextBillingDate: item.nextBillingDate,
					status: item.status || 'active',
					description: item.description,
					website: item.website,
					accountEmail: item.accountEmail,
					paymentMethod: item.paymentMethod,
					autoRenew: item.autoRenew ?? true,
					reminderDays: item.reminderDays,
					startDate: item.startDate || new Date().toISOString().split('T')[0],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				};
				mockSubscriptions.push(newSubscription);
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
		await delay(100);
		return mockSubscriptions.map((s) => s.name);
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
	amount: number;
	percentage: number;
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
	totalAmount: number;
}

export interface ImportResult {
	success: number;
	failed: number;
	duplicates: number;
	errors: { row: number; field: string; message: string }[];
}
