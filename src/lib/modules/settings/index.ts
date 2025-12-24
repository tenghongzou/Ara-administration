/**
 * Settings 模組
 * 系統設定管理功能模組
 */

// Types
export type {
	SettingsModule,
	GeneralSettings,
	NotificationSettings,
	EmailNotificationSettings,
	PushNotificationSettings,
	InAppNotificationSettings,
	QuietHoursSettings,
	Theme,
	SelectOption
} from './types';

export {
	themeOptions,
	languageOptions,
	settingsModuleIcons,
	defaultSettingsModules
} from './types';

// Services
export { settingsService } from './services/settings.service';

// Components
export { default as SettingsModuleCard } from './components/SettingsModuleCard.svelte';
export { default as ThemeSelector } from './components/ThemeSelector.svelte';
export { default as NotificationToggleGroup } from './components/NotificationToggleGroup.svelte';
export { default as QuietHoursModal } from './components/QuietHoursModal.svelte';

// Module config for registration
import type { ModuleConfig } from '../types';

export const settingsModuleConfig: ModuleConfig = {
	id: 'settings',
	name: '系統設定',
	description: '管理帳號設定和偏好',
	basePath: '/settings',
	// 導航由 core 模組處理，見 navigation/config.ts
	navigation: [],
	enabled: true
};
