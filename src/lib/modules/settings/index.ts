/**
 * Settings 模組
 * 系統設定管理功能模組
 */

// Types
export type {
	SettingsModule,
	SettingsGroup,
	SettingsGroupId,
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
	settingsGroups,
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

// Components - General Settings Page
export { default as ThemeSection } from './components/ThemeSection.svelte';
export { default as LanguageSection } from './components/LanguageSection.svelte';
export { default as DisplaySection } from './components/DisplaySection.svelte';
export { default as GeneralSettingsActions } from './components/GeneralSettingsActions.svelte';
export { default as GeneralSettingsContent } from './components/GeneralSettingsContent.svelte';

// Components - Notification Settings Page
export { default as EmailNotificationSection } from './components/EmailNotificationSection.svelte';
export { default as PushNotificationSection } from './components/PushNotificationSection.svelte';
export { default as InAppNotificationSection } from './components/InAppNotificationSection.svelte';
export { default as QuietHoursSection } from './components/QuietHoursSection.svelte';
export { default as NotificationQuickLinks } from './components/NotificationQuickLinks.svelte';
export { default as NotificationSettingsActions } from './components/NotificationSettingsActions.svelte';
export { default as NotificationSettingsContent } from './components/NotificationSettingsContent.svelte';

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
