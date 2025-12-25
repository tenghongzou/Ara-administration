/**
 * 即時推送通知服務
 * 整合 Toast、瀏覽器原生推播、音效提示
 */

import { browser } from '$app/environment';
import { toast } from '$lib/stores/toast';
import { notificationSettings } from '$lib/stores/notification-settings';
import type { NotificationType } from '$lib/types';

// 通知 payload 類型
export interface PushNotificationPayload {
	type: 'info' | 'success' | 'warning' | 'error';
	title: string;
	message: string;
	link?: string;
	/** 通知類別（用於判斷是否符合使用者偏好設定） */
	category?: NotificationType;
	/** 是否為緊急通知（靜音時段內仍會顯示） */
	urgent?: boolean;
}

// 音效路徑配置
const NOTIFICATION_SOUNDS = {
	default: '/sounds/notification.mp3',
	success: '/sounds/success.mp3',
	warning: '/sounds/warning.mp3',
	error: '/sounds/error.mp3'
} as const;

// 音效 Audio 實例快取
let audioCache: Map<string, HTMLAudioElement> | null = null;

/**
 * 預載音效檔案
 */
function getAudioCache(): Map<string, HTMLAudioElement> {
	if (!audioCache && browser) {
		audioCache = new Map();
		Object.entries(NOTIFICATION_SOUNDS).forEach(([key, src]) => {
			const audio = new Audio(src);
			audio.preload = 'auto';
			audio.volume = 0.5;
			audioCache!.set(key, audio);
		});
	}
	return audioCache || new Map();
}

/**
 * 播放通知音效
 */
function playNotificationSound(type: PushNotificationPayload['type'] = 'info'): void {
	if (!browser) return;

	const settings = notificationSettings.getSettings();
	if (!settings.inApp.playSound) return;

	// 靜音時段檢查
	if (notificationSettings.isQuietHours()) return;

	try {
		const cache = getAudioCache();
		const soundKey = type === 'info' ? 'default' : type;
		const audio = cache.get(soundKey) || cache.get('default');

		if (audio) {
			// 重設播放位置並播放
			audio.currentTime = 0;
			audio.play().catch(() => {
				// 瀏覽器可能阻止自動播放，靜默處理
			});
		}
	} catch {
		// 音效播放失敗，靜默處理
	}
}

/**
 * 發送瀏覽器原生推播通知
 */
function sendBrowserNotification(payload: PushNotificationPayload): void {
	if (!browser) return;

	const settings = notificationSettings.getSettings();

	// 檢查推播設定
	if (!settings.push.enabled) return;
	if (Notification.permission !== 'granted') return;

	// 靜音時段檢查（除非是緊急通知）
	if (notificationSettings.isQuietHours() && !payload.urgent) {
		if (!settings.quietHours.allowUrgent) return;
	}

	try {
		const notification = new Notification(payload.title, {
			body: payload.message,
			icon: '/favicon.png',
			badge: '/favicon.png',
			tag: `notification-${Date.now()}`,
			requireInteraction: payload.type === 'error' || payload.urgent,
			silent: !settings.inApp.playSound
		});

		// 點擊通知時的處理
		if (payload.link) {
			notification.onclick = () => {
				window.focus();
				window.location.href = payload.link!;
				notification.close();
			};
		} else {
			notification.onclick = () => {
				window.focus();
				notification.close();
			};
		}

		// 自動關閉（非緊急通知）
		if (!payload.urgent && payload.type !== 'error') {
			setTimeout(() => notification.close(), 8000);
		}
	} catch {
		// 瀏覽器通知失敗，靜默處理
	}
}

/**
 * 顯示 Toast 通知
 */
function showToast(payload: PushNotificationPayload): void {
	if (!browser) return;

	const settings = notificationSettings.getSettings();

	// 檢查 In-App 通知設定
	if (!settings.inApp.enabled) return;
	if (!settings.inApp.desktopPopup) return;

	// 靜音時段檢查（除非是緊急通知）
	if (notificationSettings.isQuietHours() && !payload.urgent) {
		if (!settings.quietHours.allowUrgent) return;
	}

	// 根據類型顯示對應的 Toast
	const message = `${payload.title}${payload.message ? `：${payload.message}` : ''}`;
	const duration = payload.urgent ? 0 : undefined; // 緊急通知不自動關閉

	switch (payload.type) {
		case 'success':
			toast.success(message, duration);
			break;
		case 'warning':
			toast.warning(message, duration);
			break;
		case 'error':
			toast.error(message, duration);
			break;
		default:
			toast.info(message, duration);
	}
}

/**
 * 檢查通知類別是否符合使用者偏好
 */
function shouldNotifyForCategory(category?: NotificationType): boolean {
	if (!category) return true; // 無類別時預設顯示

	const settings = notificationSettings.getSettings();

	// 根據通知類別檢查對應設定
	switch (category) {
		case 'security':
			return settings.push.securityAlerts;
		case 'system':
			return settings.push.systemAlerts;
		case 'subscription':
			return settings.push.subscriptionReminders;
		case 'user':
			return settings.push.mentions;
		default:
			return true;
	}
}

/**
 * 即時推送通知服務
 */
export const pushNotificationService = {
	/**
	 * 發送即時推送通知
	 * 根據使用者設定決定顯示方式（Toast、瀏覽器推播、音效）
	 */
	push(payload: PushNotificationPayload): void {
		if (!browser) return;

		// 檢查類別偏好
		if (!shouldNotifyForCategory(payload.category)) return;

		// 1. 顯示 Toast (In-App 通知)
		showToast(payload);

		// 2. 播放音效
		playNotificationSound(payload.type);

		// 3. 發送瀏覽器原生推播
		sendBrowserNotification(payload);
	},

	/**
	 * 僅顯示 Toast（不發送瀏覽器推播）
	 */
	toast(payload: PushNotificationPayload): void {
		if (!browser) return;
		showToast(payload);
	},

	/**
	 * 僅發送瀏覽器推播（不顯示 Toast）
	 */
	browserPush(payload: PushNotificationPayload): void {
		if (!browser) return;
		sendBrowserNotification(payload);
		playNotificationSound(payload.type);
	},

	/**
	 * 請求瀏覽器推播權限
	 */
	async requestPermission(): Promise<NotificationPermission> {
		if (!browser || !('Notification' in window)) {
			return 'denied';
		}

		try {
			const permission = await Notification.requestPermission();
			if (permission === 'granted') {
				const currentSettings = notificationSettings.getSettings();
				notificationSettings.set({
					...currentSettings,
					push: { ...currentSettings.push, enabled: true, permission: 'granted' }
				});
			}
			return permission;
		} catch {
			return 'denied';
		}
	},

	/**
	 * 取得目前推播權限狀態
	 */
	getPermission(): NotificationPermission {
		if (!browser || !('Notification' in window)) {
			return 'denied';
		}
		return Notification.permission;
	},

	/**
	 * 發送測試通知
	 */
	test(): void {
		this.push({
			type: 'info',
			title: '測試通知',
			message: '這是一則測試推播通知，用於確認通知功能正常運作。',
			urgent: false
		});
	},

	/**
	 * 預載音效資源
	 */
	preloadSounds(): void {
		if (browser) {
			getAudioCache();
		}
	}
};

export default pushNotificationService;
