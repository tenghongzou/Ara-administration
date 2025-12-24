/**
 * Settings 模組服務層
 * 提供設定管理的業務邏輯
 */

import type { Permission } from '$lib/permissions';
import type {
	SettingsModule,
	GeneralSettings,
	NotificationSettings,
	Theme
} from '../types';
import { defaultSettingsModules } from '../types';

class SettingsService {
	// ==================== 設定模組方法 ====================

	/**
	 * 根據使用者權限過濾設定模組
	 */
	filterModulesByPermission(
		modules: SettingsModule[],
		hasPermission: (permission: Permission) => boolean
	): SettingsModule[] {
		return modules.filter((m) => !m.permission || hasPermission(m.permission));
	}

	/**
	 * 取得所有設定模組
	 */
	getAllModules(): SettingsModule[] {
		return defaultSettingsModules;
	}

	/**
	 * 根據 ID 取得設定模組
	 */
	getModuleById(id: string): SettingsModule | undefined {
		return defaultSettingsModules.find((m) => m.id === id);
	}

	// ==================== 一般設定方法 ====================

	/**
	 * 建立預設一般設定
	 */
	createDefaultGeneralSettings(): GeneralSettings {
		return {
			theme: 'system',
			language: 'zh-TW',
			compactMode: false,
			animationsEnabled: true
		};
	}

	/**
	 * 驗證主題值
	 */
	isValidTheme(theme: string): theme is Theme {
		return ['light', 'dark', 'system'].includes(theme);
	}

	// ==================== 通知設定方法 ====================

	/**
	 * 建立預設通知設定
	 */
	createDefaultNotificationSettings(): NotificationSettings {
		return {
			email: {
				enabled: true,
				securityAlerts: true,
				loginNotifications: true,
				systemUpdates: true,
				subscriptionReminders: true,
				weeklyReport: false,
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
				allowUrgent: true
			}
		};
	}

	/**
	 * 格式化靜音時段顯示
	 */
	formatQuietHoursDisplay(settings: NotificationSettings): string {
		if (!settings.quietHours.enabled) return '未啟用';
		return `${settings.quietHours.startTime} - ${settings.quietHours.endTime}`;
	}

	/**
	 * 檢查推播權限
	 */
	checkPushPermission(): NotificationPermission {
		if ('Notification' in window) {
			return Notification.permission;
		}
		return 'denied';
	}

	/**
	 * 請求推播權限
	 */
	async requestPushPermission(): Promise<NotificationPermission> {
		if (!('Notification' in window)) {
			throw new Error('此瀏覽器不支援推播通知');
		}
		return await Notification.requestPermission();
	}

	// ==================== 工具方法 ====================

	/**
	 * 計算已啟用的通知類型數量
	 */
	countEnabledNotifications(settings: NotificationSettings): number {
		let count = 0;

		// Email
		if (settings.email.enabled) {
			if (settings.email.securityAlerts) count++;
			if (settings.email.loginNotifications) count++;
			if (settings.email.systemUpdates) count++;
			if (settings.email.subscriptionReminders) count++;
			if (settings.email.weeklyReport) count++;
			if (settings.email.marketing) count++;
		}

		// Push
		if (settings.push.enabled) {
			if (settings.push.securityAlerts) count++;
			if (settings.push.loginNotifications) count++;
			if (settings.push.systemAlerts) count++;
			if (settings.push.mentions) count++;
			if (settings.push.subscriptionReminders) count++;
		}

		return count;
	}

	/**
	 * 檢查是否有未儲存的變更
	 */
	hasChanges<T extends object>(original: T, current: T): boolean {
		return JSON.stringify(original) !== JSON.stringify(current);
	}
}

export const settingsService = new SettingsService();
