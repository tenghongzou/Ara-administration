/**
 * 通知 API 模組
 * 對接後端 /api/v1/notifications 端點
 */

import type { NotificationSettings, Notification, NotificationStatistics, PaginatedData } from '$lib/types';
import { apiClient, ApiError } from '../core/api-client';

// ============================================================================
// Types
// ============================================================================

export interface GetNotificationsParams {
	page?: number;
	pageSize?: number;
	read?: boolean;
	type?: string;
}

interface NotificationsResponse {
	data: Notification[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
}

/**
 * 後端未讀數量回應格式
 * GET /api/v1/notifications/unread-count
 */
interface UnreadCountResponse {
	count: number;
}

/**
 * 後端通知設定結構
 * GET /api/v1/notifications/settings
 */
export interface BackendNotificationSettings {
	email: {
		enabled: boolean;
		subscriptionReminders: boolean;
		paymentAlerts: boolean;
		systemUpdates: boolean;
		marketing: boolean;
	};
	push: {
		enabled: boolean;
		subscriptionReminders: boolean;
		paymentAlerts: boolean;
		systemUpdates: boolean;
		marketing: boolean;
	};
	inApp: {
		enabled: boolean;
		subscriptionReminders: boolean;
		paymentAlerts: boolean;
		systemUpdates: boolean;
		marketing: boolean;
	};
	quietHours: {
		enabled: boolean;
		start: string;  // HH:MM 格式
		end: string;    // HH:MM 格式
		timezone: string;
	};
}

// ============================================================================
// Notification API
// ============================================================================

export const notificationApi = {
	/**
	 * 取得通知列表（分頁）
	 * GET /api/v1/notifications
	 *
	 * 查詢參數：
	 * - page: 頁碼 (預設 1)
	 * - pageSize: 每頁數量 (預設 20，最大 100)
	 * - read: 已讀狀態篩選 (true/false)
	 * - type: 通知類型篩選
	 *
	 * 回應格式：
	 * {
	 *   "data": [
	 *     {
	 *       "id": "uuid",
	 *       "type": "subscription_reminder",
	 *       "title": "訂閱即將到期",
	 *       "message": "Netflix 將於 3 天後扣款 NT$390",
	 *       "read": false,
	 *       "data": { ... },
	 *       "createdAt": "2024-01-17T10:30:00+00:00"
	 *     }
	 *   ],
	 *   "pagination": { ... }
	 * }
	 */
	async getNotifications(params: GetNotificationsParams = {}): Promise<PaginatedData<Notification>> {
		const searchParams = new URLSearchParams();

		if (params.page) searchParams.set('page', String(params.page));
		if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
		if (params.read !== undefined) searchParams.set('read', String(params.read));
		if (params.type) searchParams.set('type', params.type);

		const query = searchParams.toString();
		const response = await apiClient.get<NotificationsResponse>(
			`/notifications${query ? `?${query}` : ''}`
		);

		return {
			data: response.data || [],
			pagination: response.pagination || {
				page: params.page || 1,
				pageSize: params.pageSize || 20,
				total: 0,
				totalPages: 0
			}
		};
	},

	/**
	 * 取得單一通知
	 * GET /api/v1/notifications/{id}
	 */
	async getNotification(id: string): Promise<Notification> {
		try {
			return await apiClient.get<Notification>(`/notifications/${id}`);
		} catch (error) {
			if (error instanceof ApiError && error.isNotFound()) {
				throw new Error('通知不存在');
			}
			throw error;
		}
	},

	/**
	 * 取得未讀通知數量
	 * GET /api/v1/notifications/unread-count
	 *
	 * 回應格式：
	 * {
	 *   "data": {
	 *     "count": 5
	 *   }
	 * }
	 */
	async getUnreadCount(): Promise<number> {
		const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
		return response?.count ?? 0;
	},

	/**
	 * 取得通知統計
	 * GET /api/v1/notifications/statistics
	 *
	 * 回應格式：
	 * {
	 *   "data": {
	 *     "total": 50,
	 *     "unread": 5,
	 *     "byType": {
	 *       "subscription_reminder": 20,
	 *       "system": 15,
	 *       "payment": 10,
	 *       "other": 5
	 *     },
	 *     "thisWeek": 8,
	 *     "thisMonth": 25
	 *   }
	 * }
	 */
	async getStatistics(): Promise<NotificationStatistics> {
		return apiClient.get<NotificationStatistics>('/notifications/statistics');
	},

	/**
	 * 標記通知為已讀
	 * POST /api/v1/notifications/{id}/read
	 *
	 * 回應格式：
	 * {
	 *   "data": { ... Notification object with read: true ... }
	 * }
	 */
	async markAsRead(notificationId: string): Promise<Notification> {
		try {
			return await apiClient.post<Notification>(`/notifications/${notificationId}/read`);
		} catch (error) {
			if (error instanceof ApiError && error.isNotFound()) {
				throw new Error('通知不存在');
			}
			throw error;
		}
	},

	/**
	 * 標記所有通知為已讀
	 * POST /api/v1/notifications/mark-all-read
	 *
	 * 回應：204 No Content
	 */
	async markAllAsRead(): Promise<void> {
		await apiClient.post('/notifications/mark-all-read');
	},

	/**
	 * 刪除通知
	 * DELETE /api/v1/notifications/{id}
	 *
	 * 回應：204 No Content
	 */
	async deleteNotification(notificationId: string): Promise<void> {
		try {
			await apiClient.delete(`/notifications/${notificationId}`);
		} catch (error) {
			if (error instanceof ApiError && error.isNotFound()) {
				throw new Error('通知不存在');
			}
			throw error;
		}
	},

	/**
	 * 清除所有通知
	 * DELETE /api/v1/notifications/clear
	 *
	 * 回應：204 No Content
	 */
	async clearAllNotifications(): Promise<void> {
		await apiClient.delete('/notifications/clear');
	},

	/**
	 * 取得通知設定
	 * GET /api/v1/notifications/settings
	 *
	 * 回應格式：
	 * {
	 *   "data": {
	 *     "email": {
	 *       "enabled": true,
	 *       "subscriptionReminders": true,
	 *       "paymentAlerts": true,
	 *       "systemUpdates": false,
	 *       "marketing": false
	 *     },
	 *     "push": { ... },
	 *     "inApp": { ... },
	 *     "quietHours": {
	 *       "enabled": false,
	 *       "start": "22:00",
	 *       "end": "08:00",
	 *       "timezone": "Asia/Taipei"
	 *     }
	 *   }
	 * }
	 */
	async getSettings(): Promise<NotificationSettings> {
		const backendSettings = await apiClient.get<BackendNotificationSettings>('/notifications/settings');

		// 將後端設定轉換為前端格式
		return {
			email: {
				enabled: backendSettings.email.enabled,
				securityAlerts: true, // 後端沒有此欄位，使用預設值
				loginNotifications: true,
				systemUpdates: backendSettings.email.systemUpdates,
				weeklyReport: false,
				subscriptionReminders: backendSettings.email.subscriptionReminders,
				marketing: backendSettings.email.marketing
			},
			push: {
				enabled: backendSettings.push.enabled,
				permission: 'default',
				securityAlerts: true,
				loginNotifications: true,
				systemAlerts: backendSettings.push.systemUpdates,
				mentions: true,
				subscriptionReminders: backendSettings.push.subscriptionReminders
			},
			inApp: {
				enabled: backendSettings.inApp.enabled,
				showBadge: true,
				playSound: true,
				desktopPopup: true,
				autoMarkRead: false
			},
			quietHours: {
				enabled: backendSettings.quietHours.enabled,
				startTime: backendSettings.quietHours.start,
				endTime: backendSettings.quietHours.end,
				timezone: backendSettings.quietHours.timezone,
				allowUrgent: true
			}
		};
	},

	/**
	 * 更新通知設定
	 * PUT/PATCH /api/v1/notifications/settings
	 *
	 * 請求格式（部分更新）：
	 * {
	 *   "email": {
	 *     "enabled": true,
	 *     "subscriptionReminders": true,
	 *     "paymentAlerts": true,
	 *     "systemUpdates": false,
	 *     "marketing": false
	 *   },
	 *   "quietHours": {
	 *     "enabled": true,
	 *     "start": "23:00",
	 *     "end": "07:00",
	 *     "timezone": "Asia/Taipei"
	 *   }
	 * }
	 */
	async updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
		// 將前端設定轉換為後端格式
		const backendPayload: Partial<BackendNotificationSettings> = {};

		if (settings.email) {
			backendPayload.email = {
				enabled: settings.email.enabled,
				subscriptionReminders: settings.email.subscriptionReminders,
				paymentAlerts: true,
				systemUpdates: settings.email.systemUpdates,
				marketing: settings.email.marketing
			};
		}

		if (settings.push) {
			backendPayload.push = {
				enabled: settings.push.enabled,
				subscriptionReminders: settings.push.subscriptionReminders,
				paymentAlerts: true,
				systemUpdates: settings.push.systemAlerts ?? true,
				marketing: false
			};
		}

		if (settings.inApp) {
			backendPayload.inApp = {
				enabled: settings.inApp.enabled,
				subscriptionReminders: true,
				paymentAlerts: true,
				systemUpdates: true,
				marketing: true
			};
		}

		if (settings.quietHours) {
			backendPayload.quietHours = {
				enabled: settings.quietHours.enabled,
				start: settings.quietHours.startTime,
				end: settings.quietHours.endTime,
				timezone: settings.quietHours.timezone
			};
		}

		await apiClient.patch<BackendNotificationSettings>('/notifications/settings', backendPayload);

		// 重新取得完整設定
		return this.getSettings();
	},

	/**
	 * 測試推播通知（本地瀏覽器）
	 */
	async testPushNotification(): Promise<void> {
		if ('Notification' in window && Notification.permission === 'granted') {
			new Notification('測試通知', {
				body: '這是一則測試推播通知',
				icon: '/favicon.png'
			});
		}
	}
};
