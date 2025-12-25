<script lang="ts">
	import type { LoginSession } from '$lib/types';
	import PasswordSection from './PasswordSection.svelte';
	import TwoFactorSection from './TwoFactorSection.svelte';
	import SessionSection from './SessionSection.svelte';
	import DangerZoneSection from './DangerZoneSection.svelte';

	interface Props {
		passwordChangedAt?: string;
		twoFactorEnabled?: boolean;
		sessions: LoginSession[];
		loadingSessions?: boolean;
		revokingSessionId?: string | null;
		onChangePassword: () => void;
		onEnable2FA: () => void;
		onDisable2FA: () => void;
		onViewBackupCodes: () => void;
		onRevokeSession: (sessionId: string) => void;
		onRevokeAllSessions: () => void;
		onDeleteAccount: () => void;
	}

	let {
		passwordChangedAt,
		twoFactorEnabled = false,
		sessions,
		loadingSessions = false,
		revokingSessionId = null,
		onChangePassword,
		onEnable2FA,
		onDisable2FA,
		onViewBackupCodes,
		onRevokeSession,
		onRevokeAllSessions,
		onDeleteAccount
	}: Props = $props();
</script>

<div class="max-w-3xl mx-auto space-y-6">
	<PasswordSection {passwordChangedAt} onChangePassword={onChangePassword} />

	<TwoFactorSection
		enabled={twoFactorEnabled}
		onEnable={onEnable2FA}
		onDisable={onDisable2FA}
		onViewBackupCodes={onViewBackupCodes}
	/>

	<SessionSection
		{sessions}
		loading={loadingSessions}
		revokingId={revokingSessionId}
		onRevoke={onRevokeSession}
		onRevokeAll={onRevokeAllSessions}
	/>

	<DangerZoneSection onDeleteAccount={onDeleteAccount} />
</div>
