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

interface UnreadCountResponse {
	count: number;
}

// ============================================================================
// Notification API
// ============================================================================

export const notificationApi = {
	/**
	 * 取得通知列表（分頁）
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
	 */
	async getUnreadCount(): Promise<number> {
		const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
		return response?.count ?? 0;
	},

	/**
	 * 取得通知統計
	 */
	async getStatistics(): Promise<NotificationStatistics> {
		return apiClient.get<NotificationStatistics>('/notifications/statistics');
	},

	/**
	 * 標記通知為已讀
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
	 */
	async markAllAsRead(): Promise<void> {
		await apiClient.post('/notifications/mark-all-read');
	},

	/**
	 * 刪除通知
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
	 */
	async clearAllNotifications(): Promise<void> {
		await apiClient.delete('/notifications/clear');
	},

	/**
	 * 取得通知設定
	 */
	async getSettings(): Promise<NotificationSettings> {
		return apiClient.get<NotificationSettings>('/notifications/settings');
	},

	/**
	 * 更新通知設定
	 */
	async updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
		return apiClient.patch<NotificationSettings>('/notifications/settings', settings);
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
