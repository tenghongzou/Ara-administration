/**
 * Subscriptions 模組服務層
 * 提供訂閱管理的業務邏輯
 */

import type { Subscription, BillingCycle, SubscriptionStats, ServiceCategory } from '$lib/types';
import type {
	SubscriptionFilters,
	SubscriptionFormData,
	SubscriptionFormErrors,
	SubscriptionStatsDisplay,
	CalendarStats,
	CalendarDayData
} from '../types';

class SubscriptionsService {
	// ==================== 格式化方法 ====================

	/**
	 * 格式化貨幣
	 */
	formatCurrency(amount: number, currency: string = 'TWD'): string {
		return new Intl.NumberFormat('zh-TW', {
			style: 'currency',
			currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	/**
	 * 格式化日期
	 */
	formatDate(dateString?: string): string {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}

	/**
	 * 格式化完整日期（含星期）
	 */
	formatFullDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			weekday: 'long'
		});
	}

	/**
	 * 格式化統計數據用於顯示
	 */
	formatStats(stats: SubscriptionStats): SubscriptionStatsDisplay {
		return {
			totalMonthly: this.formatCurrency(stats.totalMonthly),
			totalYearly: this.formatCurrency(stats.totalYearly),
			upcomingCount: stats.upcomingCount,
			activeCount: stats.activeCount
		};
	}

	// ==================== 計算方法 ====================

	/**
	 * 將費用轉換為月費
	 */
	toMonthlyCost(cost: number, cycle: BillingCycle): number {
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

	/**
	 * 檢查是否即將到期（7天內）
	 */
	isUpcoming(dateString: string, days: number = 7): boolean {
		const date = new Date(dateString);
		const now = new Date();
		const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
		return date >= now && date <= futureDate;
	}

	/**
	 * 計算距離下次扣款的天數
	 */
	getDaysUntilBilling(dateString: string): number {
		const now = new Date();
		now.setHours(0, 0, 0, 0);
		const billingDate = new Date(dateString);
		billingDate.setHours(0, 0, 0, 0);
		return Math.ceil((billingDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
	}

	/**
	 * 計算日曆統計
	 */
	calculateCalendarStats(calendarData: CalendarDayData[]): CalendarStats {
		return {
			monthlyTotal: calendarData.reduce((sum, day) => sum + day.totalAmount, 0),
			monthlyCount: calendarData.reduce((sum, day) => sum + day.subscriptions.length, 0),
			daysWithPayments: calendarData.length
		};
	}

	/**
	 * 計算月度變化百分比
	 */
	calculateMonthlyChange(monthlyTrend: { month: string; amount: number }[]): number {
		if (monthlyTrend.length < 2) return 0;
		const current = monthlyTrend[monthlyTrend.length - 1].amount;
		const previous = monthlyTrend[monthlyTrend.length - 2].amount;
		if (previous === 0) return 0;
		return Math.round(((current - previous) / previous) * 100);
	}

	// ==================== 驗證方法 ====================

	/**
	 * 驗證訂閱表單
	 */
	validateForm(form: SubscriptionFormData): SubscriptionFormErrors {
		const errors: SubscriptionFormErrors = {};

		if (!form.name.trim()) {
			errors.name = '請輸入服務名稱';
		}

		if (form.cost === '' || form.cost <= 0) {
			errors.cost = '請輸入有效的費用金額';
		}

		if (!form.nextBillingDate) {
			errors.nextBillingDate = '請選擇下次扣款日';
		}

		if (form.accountEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.accountEmail)) {
			errors.accountEmail = '請輸入有效的電子郵件格式';
		}

		if (form.website && !/^https?:\/\/.+/.test(form.website)) {
			errors.website = '請輸入有效的網址（需包含 http:// 或 https://）';
		}

		return errors;
	}

	/**
	 * 檢查表單是否有效
	 */
	isFormValid(errors: SubscriptionFormErrors): boolean {
		return Object.keys(errors).length === 0;
	}

	// ==================== 篩選方法 ====================

	/**
	 * 過濾訂閱列表
	 */
	filterSubscriptions(subscriptions: Subscription[], filters: SubscriptionFilters): Subscription[] {
		let result = [...subscriptions];

		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			result = result.filter(
				(sub) =>
					sub.name.toLowerCase().includes(searchLower) ||
					sub.description?.toLowerCase().includes(searchLower)
			);
		}

		if (filters.category) {
			result = result.filter((sub) => sub.category === filters.category);
		}

		if (filters.status) {
			result = result.filter((sub) => sub.status === filters.status);
		}

		if (filters.billingCycle) {
			result = result.filter((sub) => sub.billingCycle === filters.billingCycle);
		}

		return result;
	}

	/**
	 * 檢查篩選器是否有任何值
	 */
	hasActiveFilters(filters: SubscriptionFilters): boolean {
		return !!(filters.search || filters.category || filters.status || filters.billingCycle);
	}

	/**
	 * 清空篩選器
	 */
	clearFilters(): SubscriptionFilters {
		return {
			search: '',
			category: '',
			status: '',
			billingCycle: ''
		};
	}

	// ==================== 初始化方法 ====================

	/**
	 * 建立空白表單數據
	 */
	createEmptyFormData(): SubscriptionFormData {
		return {
			name: '',
			category: 'streaming',
			cost: '',
			currency: 'TWD',
			billingCycle: 'monthly',
			nextBillingDate: '',
			status: 'active',
			description: '',
			website: '',
			accountEmail: '',
			paymentMethod: '',
			autoRenew: true,
			reminderDays: ''
		};
	}

	/**
	 * 從訂閱數據建立表單數據
	 */
	subscriptionToFormData(subscription: Subscription): SubscriptionFormData {
		return {
			name: subscription.name,
			category: subscription.category,
			cost: subscription.cost,
			currency: subscription.currency,
			billingCycle: subscription.billingCycle,
			nextBillingDate: subscription.nextBillingDate,
			status: subscription.status,
			description: subscription.description || '',
			website: subscription.website || '',
			accountEmail: subscription.accountEmail || '',
			paymentMethod: subscription.paymentMethod || '',
			autoRenew: subscription.autoRenew,
			reminderDays: subscription.reminderDays || ''
		};
	}

	/**
	 * 將表單數據轉換為 API 請求數據
	 */
	formDataToApiData(form: SubscriptionFormData) {
		return {
			name: form.name.trim(),
			category: form.category,
			cost: Number(form.cost),
			currency: form.currency,
			billingCycle: form.billingCycle,
			nextBillingDate: form.nextBillingDate,
			status: form.status,
			description: form.description.trim() || undefined,
			website: form.website.trim() || undefined,
			accountEmail: form.accountEmail.trim() || undefined,
			paymentMethod: form.paymentMethod || undefined,
			autoRenew: form.autoRenew,
			reminderDays: form.reminderDays ? Number(form.reminderDays) : undefined
		};
	}

	// ==================== 匯出相關 ====================

	/**
	 * 準備匯出數據
	 */
	prepareExportData(subscriptions: Subscription[]) {
		return subscriptions.map((s) => ({
			name: s.name,
			category: this.getCategoryLabel(s.category),
			cost: s.cost,
			currency: s.currency,
			billingCycle: this.getBillingCycleLabel(s.billingCycle),
			nextBillingDate: s.nextBillingDate,
			status: this.getStatusLabel(s.status),
			description: s.description || '',
			website: s.website || '',
			accountEmail: s.accountEmail || ''
		}));
	}

	/**
	 * 取得匯出欄位配置
	 */
	getExportColumns() {
		return [
			{ key: 'name' as const, label: '服務名稱' },
			{ key: 'category' as const, label: '分類' },
			{ key: 'cost' as const, label: '費用' },
			{ key: 'currency' as const, label: '貨幣' },
			{ key: 'billingCycle' as const, label: '週期' },
			{ key: 'nextBillingDate' as const, label: '下次扣款日' },
			{ key: 'status' as const, label: '狀態' }
		];
	}

	// ==================== 標籤轉換 ====================

	getCategoryLabel(category: ServiceCategory): string {
		const labels: Record<ServiceCategory, string> = {
			streaming: '影音串流',
			music: '音樂',
			cloud: '雲端儲存',
			productivity: '生產力工具',
			gaming: '遊戲',
			other: '其他'
		};
		return labels[category];
	}

	getBillingCycleLabel(cycle: BillingCycle): string {
		const labels: Record<BillingCycle, string> = {
			weekly: '週繳',
			monthly: '月繳',
			quarterly: '季繳',
			'semi-annual': '半年繳',
			annual: '年繳'
		};
		return labels[cycle];
	}

	getStatusLabel(status: string): string {
		const labels: Record<string, string> = {
			active: '啟用中',
			paused: '已暫停',
			cancelled: '已取消',
			expired: '已過期'
		};
		return labels[status] || status;
	}

	getCategoryColorClass(category: ServiceCategory): string {
		const colors: Record<ServiceCategory, string> = {
			streaming: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
			music: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
			cloud: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
			productivity: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
			gaming: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
			other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
		};
		return colors[category];
	}

	getCategoryChartColor(category: ServiceCategory): string {
		const colors: Record<ServiceCategory, string> = {
			streaming: 'rgb(239, 68, 68)',
			music: 'rgb(34, 197, 94)',
			cloud: 'rgb(59, 130, 246)',
			productivity: 'rgb(168, 85, 247)',
			gaming: 'rgb(249, 115, 22)',
			other: 'rgb(107, 114, 128)'
		};
		return colors[category];
	}
}

export const subscriptionsService = new SubscriptionsService();
