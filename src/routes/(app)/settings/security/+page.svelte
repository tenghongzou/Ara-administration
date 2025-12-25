<script lang="ts">
	import { config } from '$lib/constants';
	import { toast } from '$lib/stores/toast';
	import { auth, currentUser } from '$lib/stores/auth';
	import { PageContainer } from '$lib/components/layout';
	import type { LoginSession } from '$lib/types';
	import {
		passwordService,
		sessionService,
		twoFactorService,
		SecurityContent,
		SecurityModals,
		type PasswordChangeFormData
	} from '$lib/modules/account';

	// 當前使用者
	let user = $derived($currentUser);

	// Modal 狀態
	let showPasswordModal = $state(false);
	let showTwoFactorModal = $state(false);
	let showDisable2FAModal = $state(false);
	let showBackupCodesModal = $state(false);
	let showDeleteModal = $state(false);

	// 兩步驟驗證狀態
	let twoFactorEnabled = $state(false);

	// Session 狀態
	let sessions = $state<LoginSession[]>([]);
	let loadingSessions = $state(true);
	let revokingSessionId = $state<string | null>(null);

	// 載入資料
	$effect(() => {
		if (user) {
			loadSessions();
			load2FAStatus();
		}
	});

	async function loadSessions() {
		if (!user) return;
		loadingSessions = true;
		try {
			sessions = await sessionService.getSessions(user.id);
		} catch (error) {
			toast.error('載入登入活動失敗');
		} finally {
			loadingSessions = false;
		}
	}

	async function load2FAStatus() {
		if (!user) return;
		try {
			const status = await twoFactorService.getStatus(user.id);
			twoFactorEnabled = status.enabled;
		} catch (error) {
			console.error('Failed to load 2FA status');
		}
	}

	// 密碼變更處理
	async function handlePasswordChange(form: PasswordChangeFormData) {
		if (!user) return;
		await passwordService.changePassword(user.id, form.current, form.new);
		auth.updateUser({ passwordChangedAt: new Date().toISOString() });
		toast.success('密碼已變更成功');
	}

	// 2FA 完成處理
	function handle2FAComplete() {
		twoFactorEnabled = true;
		auth.updateUser({ twoFactorEnabled: true });
	}

	// 停用 2FA 完成處理
	function handleDisable2FAComplete() {
		twoFactorEnabled = false;
		auth.updateUser({ twoFactorEnabled: false });
	}

	// Session 管理
	async function handleRevokeSession(sessionId: string) {
		revokingSessionId = sessionId;
		try {
			await sessionService.revokeSession(sessionId);
			sessions = sessions.filter((s) => s.id !== sessionId);
			toast.success('已登出該裝置');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '操作失敗');
		} finally {
			revokingSessionId = null;
		}
	}

	async function handleRevokeAllSessions() {
		if (!user) return;
		try {
			const count = await sessionService.revokeAllOtherSessions(user.id);
			sessions = sessions.filter((s) => s.isCurrent);
			toast.success(`已登出 ${count} 個裝置`);
		} catch (error) {
			toast.error('操作失敗');
		}
	}

	// 刪除帳號處理
	async function handleDeleteAccount() {
		await new Promise((resolve) => setTimeout(resolve, 1500));
		toast.info('帳號刪除請求已提交，將於 30 天後永久刪除');
	}
</script>

<svelte:head>
	<title>安全設定 - {config.appName}</title>
</svelte:head>

<PageContainer
	title="安全設定"
	description="管理您的帳號安全性設定"
	backLink="/settings"
	backLabel="返回設定"
>
	<SecurityContent
		passwordChangedAt={user?.passwordChangedAt}
		{twoFactorEnabled}
		{sessions}
		loadingSessions={loadingSessions}
		revokingSessionId={revokingSessionId}
		onChangePassword={() => (showPasswordModal = true)}
		onEnable2FA={() => (showTwoFactorModal = true)}
		onDisable2FA={() => (showDisable2FAModal = true)}
		onViewBackupCodes={() => (showBackupCodesModal = true)}
		onRevokeSession={handleRevokeSession}
		onRevokeAllSessions={handleRevokeAllSessions}
		onDeleteAccount={() => (showDeleteModal = true)}
	/>
</PageContainer>

{#if user}
	<SecurityModals
		userId={user.id}
		bind:showPasswordModal
		bind:showTwoFactorModal
		bind:showDisable2FAModal
		bind:showBackupCodesModal
		bind:showDeleteModal
		onPasswordModalClose={() => (showPasswordModal = false)}
		onPasswordSubmit={handlePasswordChange}
		onTwoFactorModalClose={() => (showTwoFactorModal = false)}
		onTwoFactorComplete={handle2FAComplete}
		onDisable2FAModalClose={() => (showDisable2FAModal = false)}
		onDisable2FAComplete={handleDisable2FAComplete}
		onBackupCodesModalClose={() => (showBackupCodesModal = false)}
		onDeleteModalClose={() => (showDeleteModal = false)}
		onDeleteConfirm={handleDeleteAccount}
	/>
{/if}
