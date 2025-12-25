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

// Components - Profile
export { default as AvatarUpload } from './components/AvatarUpload.svelte';
export { default as ProfileForm } from './components/ProfileForm.svelte';
export { default as AccountInfoCard } from './components/AccountInfoCard.svelte';
export { default as BioSection } from './components/BioSection.svelte';
export { default as ProfileAvatarCard } from './components/ProfileAvatarCard.svelte';
export { default as ProfileFormCard } from './components/ProfileFormCard.svelte';
export { default as ProfileActions } from './components/ProfileActions.svelte';
export { default as ProfileContent } from './components/ProfileContent.svelte';

// Components - Security Modals
export { default as PasswordChangeModal } from './components/PasswordChangeModal.svelte';
export { default as TwoFactorSetupModal } from './components/TwoFactorSetup.svelte';
export { default as TwoFactorDisableModal } from './components/TwoFactorDisableModal.svelte';
export { default as BackupCodesModal } from './components/BackupCodesModal.svelte';
export { default as DeleteAccountModal } from './components/DeleteAccountModal.svelte';

// Components - Sections
export { default as PasswordSection } from './components/PasswordSection.svelte';
export { default as TwoFactorSection } from './components/TwoFactorSection.svelte';
export { default as DangerZoneSection } from './components/DangerZoneSection.svelte';
export { default as SessionList } from './components/SessionList.svelte';
export { default as SessionSection } from './components/SessionSection.svelte';

// Components - Security Page
export { default as SecurityContent } from './components/SecurityContent.svelte';
export { default as SecurityModals } from './components/SecurityModals.svelte';

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
