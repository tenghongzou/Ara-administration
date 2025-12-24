/**
 * Settings 模組類型定義
 */

import type { Permission } from '$lib/permissions';

// ==================== 設定模組選項 ====================

export interface SettingsModule {
	id: string;
	title: string;
	description: string;
	href: string;
	icon: string;
	iconBgColor: string;
	iconColor: string;
	permission?: Permission;
}

// ==================== 一般設定 ====================

export type Theme = 'light' | 'dark' | 'system';

export interface GeneralSettings {
	theme: Theme;
	language: string;
	compactMode: boolean;
	animationsEnabled: boolean;
}

export interface SelectOption<T = string> {
	value: T;
	label: string;
}

export const themeOptions: SelectOption<Theme>[] = [
	{ value: 'light', label: '淺色模式' },
	{ value: 'dark', label: '深色模式' },
	{ value: 'system', label: '跟隨系統' }
];

export const languageOptions: SelectOption[] = [
	{ value: 'zh-TW', label: '繁體中文' },
	{ value: 'zh-CN', label: '简体中文' },
	{ value: 'en', label: 'English' },
	{ value: 'ja', label: '日本語' }
];

// ==================== 通知設定 ====================

export interface EmailNotificationSettings {
	enabled: boolean;
	securityAlerts: boolean;
	loginNotifications: boolean;
	systemUpdates: boolean;
	subscriptionReminders: boolean;
	weeklyReport: boolean;
	marketing: boolean;
}

export interface PushNotificationSettings {
	enabled: boolean;
	permission: NotificationPermission;
	securityAlerts: boolean;
	loginNotifications: boolean;
	systemAlerts: boolean;
	mentions: boolean;
	subscriptionReminders: boolean;
}

export interface InAppNotificationSettings {
	enabled: boolean;
	showBadge: boolean;
	playSound: boolean;
	desktopPopup: boolean;
	autoMarkRead: boolean;
}

export interface QuietHoursSettings {
	enabled: boolean;
	startTime: string;
	endTime: string;
	allowUrgent: boolean;
}

export interface NotificationSettings {
	email: EmailNotificationSettings;
	push: PushNotificationSettings;
	inApp: InAppNotificationSettings;
	quietHours: QuietHoursSettings;
}

// ==================== 設定模組圖標 ====================

export const settingsModuleIcons = {
	general: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />',
	profile: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />',
	security: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />',
	notifications: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />',
	notificationCenter: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />',
	logs: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />',
	users: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />',
	roles: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />'
};

// ==================== 預設設定模組列表 ====================

export const defaultSettingsModules: SettingsModule[] = [
	{
		id: 'general',
		title: '一般設定',
		description: '主題模式、外觀偏好設定',
		href: '/settings/general',
		icon: settingsModuleIcons.general,
		iconBgColor: 'bg-blue-100 dark:bg-blue-900/30',
		iconColor: 'text-blue-600 dark:text-blue-400'
	},
	{
		id: 'profile',
		title: '個人資料',
		description: '姓名、頭像、聯絡資訊',
		href: '/settings/profile',
		icon: settingsModuleIcons.profile,
		iconBgColor: 'bg-green-100 dark:bg-green-900/30',
		iconColor: 'text-green-600 dark:text-green-400'
	},
	{
		id: 'security',
		title: '安全設定',
		description: '密碼、兩步驟驗證、登入活動',
		href: '/settings/security',
		icon: settingsModuleIcons.security,
		iconBgColor: 'bg-orange-100 dark:bg-orange-900/30',
		iconColor: 'text-orange-600 dark:text-orange-400'
	},
	{
		id: 'notifications',
		title: '通知設定',
		description: '電子郵件、推播、通知偏好',
		href: '/settings/notifications',
		icon: settingsModuleIcons.notifications,
		iconBgColor: 'bg-purple-100 dark:bg-purple-900/30',
		iconColor: 'text-purple-600 dark:text-purple-400'
	},
	{
		id: 'notification-center',
		title: '通知中心',
		description: '查看所有系統通知訊息',
		href: '/notifications',
		icon: settingsModuleIcons.notificationCenter,
		iconBgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
		iconColor: 'text-cyan-600 dark:text-cyan-400'
	},
	{
		id: 'logs',
		title: '稽核日誌',
		description: '系統操作紀錄、活動追蹤',
		href: '/settings/logs',
		icon: settingsModuleIcons.logs,
		iconBgColor: 'bg-gray-100 dark:bg-gray-800',
		iconColor: 'text-gray-600 dark:text-gray-400',
		permission: 'logs:read'
	},
	{
		id: 'users',
		title: '使用者管理',
		description: '帳號管理、權限設定',
		href: '/settings/users',
		icon: settingsModuleIcons.users,
		iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
		iconColor: 'text-indigo-600 dark:text-indigo-400',
		permission: 'users:read'
	},
	{
		id: 'roles',
		title: '角色管理',
		description: '管理角色與權限分配',
		href: '/settings/roles',
		icon: settingsModuleIcons.roles,
		iconBgColor: 'bg-rose-100 dark:bg-rose-900/30',
		iconColor: 'text-rose-600 dark:text-rose-400',
		permission: 'roles:read'
	}
];
