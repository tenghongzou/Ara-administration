// Types
export type {
	User,
	LoginSession,
	TwoFactorSetup,
	UpdateProfileData,
	ProfileFormData,
	PasswordChangeFormData,
	PasswordValidation,
	TwoFactorStep,
	DeviceInfo,
	DeleteAccountConfirmation
} from './types';

// Services
export { profileService } from './services/profile.service';
export { sessionService } from './services/session.service';
export { twoFactorService } from './services/two-factor.service';
export { passwordService } from './services/password.service';

// Components
export { default as AvatarUpload } from './components/AvatarUpload.svelte';
export { default as PasswordChangeModal } from './components/PasswordChangeModal.svelte';
export { default as SessionList } from './components/SessionList.svelte';
export { default as TwoFactorSetupModal } from './components/TwoFactorSetup.svelte';

// Module config for registration
import type { ModuleConfig } from '../types';
import { navIcons } from '../navigation';

export const accountModuleConfig: ModuleConfig = {
	id: 'account',
	name: '帳號設定',
	description: '個人資料與安全設定',
	basePath: '/settings',
	navigation: [
		{
			id: 'profile',
			label: '個人資料',
			href: '/settings/profile',
			icon: navIcons.settings,
			order: 40
		},
		{
			id: 'security',
			label: '安全設定',
			href: '/settings/security',
			icon: navIcons.settings,
			order: 41
		}
	],
	enabled: true
};
