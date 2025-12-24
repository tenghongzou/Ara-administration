/**
 * 通知 API 模組
 */

import type { NotificationSettings, Notification } from '$lib/types';
import { delay } from '../core';

// Mock notification settings storage
const mockNotificationSettings: Record<string, NotificationSettings> = {};

// Default notification settings
function getDefaultNotificationSettings(): NotificationSettings {
	return {
		email: {
			enabled: true,
			securityAlerts: true,
			loginNotifications: true,
			systemUpdates: true,
			weeklyReport: false,
			subscriptionReminders: true,
			marketing: false
		},
		push: {
			enabled: false,
			permission: 'default',
			securityAlerts: true,
			loginNotifications: true,
			systemAlerts: true,
			mentions: true,
			subscriptionReminders: true
		},
		inApp: {
			enabled: true,
			showBadge: true,
			playSound: false,
			desktopPopup: true,
			autoMarkRead: false
		},
		quietHours: {
			enabled: false,
			startTime: '22:00',
			endTime: '08:00',
			timezone: 'Asia/Taipei',
			allowUrgent: true
		}
	};
}

// Mock notifications
let mockNotifications: Notification[] = [
	{
		id: '1',
		userId: '1',
		type: 'security',
		title: '新裝置登入',
		message: '您的帳號在新裝置上登入：Windows PC - Chrome',
		link: '/settings/security',
		read: false,
		createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
	},
	{
		id: '2',
		userId: '1',
		type: 'subscription',
		title: '訂閱即將到期',
		message: 'Netflix 訂閱將於 3 天後到期',
		link: '/subscriptions/1',
		read: false,
		createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
	},
	{
		id: '3',
		userId: '1',
		type: 'system',
		title: '系統更新完成',
		message: '系統已更新至最新版本 v2.1.0',
		read: true,
		createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
	},
	{
		id: '4',
		userId: '1',
		type: 'info',
		title: '歡迎使用 Ara Admin',
		message: '感謝您使用我們的服務，如有任何問題請隨時聯繫我們。',
		read: true,
		createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
	}
];

export const notificationApi = {
	// 取得通知設定
	async getSettings(userId: string): Promise<NotificationSettings> {
		await delay(400);
		if (!mockNotificationSettings[userId]) {
			mockNotificationSettings[userId] = getDefaultNotificationSettings();
		}
		return { ...mockNotificationSettings[userId] };
	},

	// 更新通知設定
	async updateSettings(userId: string, settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
		await delay(500);
		if (!mockNotificationSettings[userId]) {
			mockNotificationSettings[userId] = getDefaultNotificationSettings();
		}

		// Deep merge settings
		const current = mockNotificationSettings[userId];
		if (settings.email) {
			current.email = { ...current.email, ...settings.email };
		}
		if (settings.push) {
			current.push = { ...current.push, ...settings.push };
		}
		if (settings.inApp) {
			current.inApp = { ...current.inApp, ...settings.inApp };
		}
		if (settings.quietHours) {
			current.quietHours = { ...current.quietHours, ...settings.quietHours };
		}

		return { ...current };
	},

	// 取得通知列表
	async getNotifications(userId: string): Promise<Notification[]> {
		await delay(400);
		return mockNotifications
			.filter((n) => n.userId === userId)
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	},

	// 取得未讀通知數量
	async getUnreadCount(userId: string): Promise<number> {
		await delay(200);
		return mockNotifications.filter((n) => n.userId === userId && !n.read).length;
	},

	// 標記通知為已讀
	async markAsRead(notificationId: string): Promise<void> {
		await delay(300);
		const notification = mockNotifications.find((n) => n.id === notificationId);
		if (notification) {
			notification.read = true;
		}
	},

	// 標記所有通知為已讀
	async markAllAsRead(userId: string): Promise<void> {
		await delay(400);
		mockNotifications
			.filter((n) => n.userId === userId)
			.forEach((n) => {
				n.read = true;
			});
	},

	// 刪除通知
	async deleteNotification(notificationId: string): Promise<void> {
		await delay(300);
		const index = mockNotifications.findIndex((n) => n.id === notificationId);
		if (index !== -1) {
			mockNotifications.splice(index, 1);
		}
	},

	// 清除所有通知
	async clearAllNotifications(userId: string): Promise<void> {
		await delay(400);
		mockNotifications = mockNotifications.filter((n) => n.userId !== userId);
	},

	// 測試推播通知
	async testPushNotification(): Promise<void> {
		await delay(500);
		if ('Notification' in window && Notification.permission === 'granted') {
			new Notification('測試通知', {
				body: '這是一則測試推播通知',
				icon: '/favicon.png'
			});
		}
	}
};
