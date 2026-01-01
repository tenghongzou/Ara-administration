/**
 * Mock Subscriptions API
 */
import type { Subscription, PaymentHistory, PaginatedData } from '$lib/types';
import { mockSubscriptions, mockPaymentHistory } from '../data';

const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockSubscriptionsApi = {
	async getSubscriptions(params?: {
		page?: number;
		pageSize?: number;
		search?: string;
		category?: string;
		status?: string;
	}): Promise<PaginatedData<Subscription>> {
		await delay();

		let filtered = [...mockSubscriptions];
		const page = params?.page ?? 1;
		const pageSize = params?.pageSize ?? 10;

		if (params?.search) {
			const search = params.search.toLowerCase();
			filtered = filtered.filter(
				(s) =>
					s.name.toLowerCase().includes(search) ||
					s.description?.toLowerCase().includes(search)
			);
		}

		if (params?.category) {
			filtered = filtered.filter((s) => s.category === params.category);
		}

		if (params?.status) {
			filtered = filtered.filter((s) => s.status === params.status);
		}

		const total = filtered.length;
		const totalPages = Math.ceil(total / pageSize);
		const start = (page - 1) * pageSize;
		const data = filtered.slice(start, start + pageSize);

		return {
			data,
			pagination: {
				page,
				pageSize,
				total,
				totalPages
			}
		};
	},

	async getSubscription(id: string): Promise<Subscription> {
		await delay();
		const subscription = mockSubscriptions.find((s) => s.id === id);
		if (!subscription) {
			throw new Error('Subscription not found');
		}
		return subscription;
	},

	async createSubscription(data: Partial<Subscription>): Promise<Subscription> {
		await delay();
		const newSubscription: Subscription = {
			id: String(mockSubscriptions.length + 1),
			name: data.name || '',
			category: data.category || 'other',
			cost: data.cost || 0,
			currency: data.currency || 'TWD',
			billingCycle: data.billingCycle || 'monthly',
			nextBillingDate: data.nextBillingDate || new Date().toISOString().split('T')[0],
			status: 'active',
			description: data.description,
			website: data.website,
			accountEmail: data.accountEmail,
			paymentMethod: data.paymentMethod || 'credit_card',
			autoRenew: data.autoRenew ?? true,
			reminderDays: data.reminderDays,
			startDate: data.startDate || new Date().toISOString().split('T')[0],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		mockSubscriptions.push(newSubscription);
		return newSubscription;
	},

	async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
		await delay();
		const index = mockSubscriptions.findIndex((s) => s.id === id);
		if (index === -1) {
			throw new Error('Subscription not found');
		}
		mockSubscriptions[index] = {
			...mockSubscriptions[index],
			...data,
			updatedAt: new Date().toISOString()
		};
		return mockSubscriptions[index];
	},

	async deleteSubscription(id: string): Promise<void> {
		await delay();
		const index = mockSubscriptions.findIndex((s) => s.id === id);
		if (index === -1) {
			throw new Error('Subscription not found');
		}
		mockSubscriptions.splice(index, 1);
	},

	async getPaymentHistory(subscriptionId?: string): Promise<PaymentHistory[]> {
		await delay();
		if (subscriptionId) {
			return mockPaymentHistory.filter((p) => p.subscriptionId === subscriptionId);
		}
		return mockPaymentHistory;
	},

	async getUpcomingReminders(
		days: number = 7
	): Promise<
		Array<{
			id: string;
			subscriptionId: string;
			subscriptionName: string;
			daysUntilDue: number;
			amount: number;
			currency: string;
			type: 'overdue' | 'due_today' | 'due_soon';
		}>
	> {
		await delay();

		const now = new Date();
		const reminders: Array<{
			id: string;
			subscriptionId: string;
			subscriptionName: string;
			daysUntilDue: number;
			amount: number;
			currency: string;
			type: 'overdue' | 'due_today' | 'due_soon';
		}> = [];

		for (const subscription of mockSubscriptions) {
			if (subscription.status !== 'active') continue;

			const nextBilling = new Date(subscription.nextBillingDate);
			const diffTime = nextBilling.getTime() - now.getTime();
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays <= days) {
				let type: 'overdue' | 'due_today' | 'due_soon';
				if (diffDays < 0) {
					type = 'overdue';
				} else if (diffDays === 0) {
					type = 'due_today';
				} else {
					type = 'due_soon';
				}

				reminders.push({
					id: `reminder-${subscription.id}`,
					subscriptionId: subscription.id,
					subscriptionName: subscription.name,
					daysUntilDue: diffDays,
					amount: subscription.cost,
					currency: subscription.currency,
					type
				});
			}
		}

		return reminders.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
	},

	async getStatistics(): Promise<{
		totalCount: number;
		activeCount: number;
		monthlySpending: number;
		yearlySpending: number;
		byCategory: Record<string, number>;
		byStatus: Record<string, number>;
	}> {
		await delay();

		const active = mockSubscriptions.filter((s) => s.status === 'active');

		let monthlySpending = 0;
		for (const sub of active) {
			if (sub.billingCycle === 'monthly') {
				monthlySpending += sub.cost;
			} else if (sub.billingCycle === 'annual') {
				monthlySpending += sub.cost / 12;
			} else if (sub.billingCycle === 'quarterly') {
				monthlySpending += sub.cost / 3;
			}
		}

		const byCategory: Record<string, number> = {};
		const byStatus: Record<string, number> = {};

		for (const sub of mockSubscriptions) {
			byCategory[sub.category] = (byCategory[sub.category] || 0) + 1;
			byStatus[sub.status] = (byStatus[sub.status] || 0) + 1;
		}

		return {
			totalCount: mockSubscriptions.length,
			activeCount: active.length,
			monthlySpending: Math.round(monthlySpending),
			yearlySpending: Math.round(monthlySpending * 12),
			byCategory,
			byStatus
		};
	}
};
