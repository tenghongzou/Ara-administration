<script lang="ts">
	import type { PasswordChangeFormData } from '../types';
	import PasswordChangeModal from './PasswordChangeModal.svelte';
	import TwoFactorSetupModal from './TwoFactorSetup.svelte';
	import TwoFactorDisableModal from './TwoFactorDisableModal.svelte';
	import BackupCodesModal from './BackupCodesModal.svelte';
	import DeleteAccountModal from './DeleteAccountModal.svelte';

	interface Props {
		userId: string;
		showPasswordModal?: boolean;
		showTwoFactorModal?: boolean;
		showDisable2FAModal?: boolean;
		showBackupCodesModal?: boolean;
		showDeleteModal?: boolean;
		onPasswordModalClose: () => void;
		onPasswordSubmit: (form: PasswordChangeFormData) => Promise<void>;
		onTwoFactorModalClose: () => void;
		onTwoFactorComplete: () => void;
		onDisable2FAModalClose: () => void;
		onDisable2FAComplete: () => void;
		onBackupCodesModalClose: () => void;
		onDeleteModalClose: () => void;
		onDeleteConfirm: () => Promise<void>;
	}

	let {
		userId,
		showPasswordModal = $bindable(false),
		showTwoFactorModal = $bindable(false),
		showDisable2FAModal = $bindable(false),
		showBackupCodesModal = $bindable(false),
		showDeleteModal = $bindable(false),
		onPasswordModalClose,
		onPasswordSubmit,
		onTwoFactorModalClose,
		onTwoFactorComplete,
		onDisable2FAModalClose,
		onDisable2FAComplete,
		onBackupCodesModalClose,
		onDeleteModalClose,
		onDeleteConfirm
	}: Props = $props();
</script>

<PasswordChangeModal
	bind:open={showPasswordModal}
	onClose={onPasswordModalClose}
	onSubmit={onPasswordSubmit}
/>

<TwoFactorSetupModal
	bind:open={showTwoFactorModal}
	{userId}
	onClose={onTwoFactorModalClose}
	onComplete={onTwoFactorComplete}
/>

<TwoFactorDisableModal
	bind:open={showDisable2FAModal}
	{userId}
	onClose={onDisable2FAModalClose}
	onComplete={onDisable2FAComplete}
/>

<BackupCodesModal
	bind:open={showBackupCodesModal}
	{userId}
	onClose={onBackupCodesModalClose}
/>

<DeleteAccountModal
	bind:open={showDeleteModal}
	onClose={onDeleteModalClose}
	onConfirm={onDeleteConfirm}
/>
