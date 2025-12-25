import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { NotificationSettings } from '$lib/types';

/**
 * 通知設定 Store
 * 用於客戶端緩存使用者的通知偏好設定，供即時推送服務使用
 */

const STORAGE_KEY = 'notification-settings';

// 預設設定
const DEFAULT_SETTINGS: NotificationSettings = {
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

function loadFromStorage(): NotificationSettings | null {
	if (!browser) return null;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : null;
	} catch {
		return null;
	}
}

function saveToStorage(settings: NotificationSettings): void {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch {
		// Storage 可能已滿或被禁用
	}
}

function createNotificationSettingsStore() {
	const stored = loadFromStorage();
	const { subscribe, set, update } = writable<NotificationSettings>(stored || DEFAULT_SETTINGS);

	return {
		subscribe,

		/**
		 * 設定完整的通知設定（通常在載入時從 API 取得後調用）
		 */
		set: (settings: NotificationSettings) => {
			set(settings);
			saveToStorage(settings);
		},

		/**
		 * 更新部分設定
		 */
		update: (partial: Partial<NotificationSettings>) => {
			update((current) => {
				const updated = {
					...current,
					...partial,
					email: partial.email ? { ...current.email, ...partial.email } : current.email,
					push: partial.push ? { ...current.push, ...partial.push } : current.push,
					inApp: partial.inApp ? { ...current.inApp, ...partial.inApp } : current.inApp,
					quietHours: partial.quietHours
						? { ...current.quietHours, ...partial.quietHours }
						: current.quietHours
				};
				saveToStorage(updated);
				return updated;
			});
		},

		/**
		 * 取得目前設定的快照
		 */
		getSettings: () => get({ subscribe }),

		/**
		 * 檢查是否在靜音時段內
		 */
		isQuietHours: (): boolean => {
			const settings = get({ subscribe });
			if (!settings.quietHours.enabled) return false;

			const now = new Date();
			const currentTime = now.getHours() * 60 + now.getMinutes();

			const [startHour, startMin] = settings.quietHours.startTime.split(':').map(Number);
			const [endHour, endMin] = settings.quietHours.endTime.split(':').map(Number);

			const startMinutes = startHour * 60 + startMin;
			const endMinutes = endHour * 60 + endMin;

			// 處理跨日的情況 (例如 22:00 到 08:00)
			if (startMinutes > endMinutes) {
				return currentTime >= startMinutes || currentTime < endMinutes;
			}

			return currentTime >= startMinutes && currentTime < endMinutes;
		},

		/**
		 * 檢查是否應該顯示 In-App 通知
		 */
		shouldShowInApp: (): boolean => {
			const settings = get({ subscribe });
			return settings.inApp.enabled && settings.inApp.desktopPopup;
		},

		/**
		 * 檢查是否應該播放聲音
		 */
		shouldPlaySound: (): boolean => {
			const settings = get({ subscribe });
			return settings.inApp.enabled && settings.inApp.playSound;
		},

		/**
		 * 檢查是否應該發送瀏覽器推播
		 */
		shouldSendPush: (): boolean => {
			const settings = get({ subscribe });
			return settings.push.enabled && settings.push.permission === 'granted';
		},

		/**
		 * 重設為預設值
		 */
		reset: () => {
			set(DEFAULT_SETTINGS);
			if (browser) {
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	};
}

export const notificationSettings = createNotificationSettingsStore();
