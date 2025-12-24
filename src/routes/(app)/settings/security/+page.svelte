<script lang="ts">
	import { config } from '$lib/constants';
	import { authApi, securityApi } from '$lib/services';
	import { toast } from '$lib/stores/toast';
	import { auth, currentUser } from '$lib/stores/auth';
	import { PageContainer } from '$lib/components/layout';
	import { Button, Card, Modal, Badge, PasswordInput } from '$lib/components/ui';
	import type { LoginSession, TwoFactorSetup } from '$lib/types';

	// 當前使用者
	let user = $derived($currentUser);

	// 密碼變更
	let showPasswordModal = $state(false);
	let passwordForm = $state({
		current: '',
		new: '',
		confirm: ''
	});
	let passwordError = $state('');
	let changingPassword = $state(false);

	// 兩步驟驗證
	let twoFactorEnabled = $state(false);
	let showTwoFactorModal = $state(false);
	let twoFactorStep = $state<'setup' | 'verify' | 'backup'>('setup');
	let twoFactorSetup = $state<TwoFactorSetup | null>(null);
	let verificationCode = $state('');
	let settingUp2FA = $state(false);
	let showDisable2FAModal = $state(false);
	let disable2FAPassword = $state('');
	let disabling2FA = $state(false);

	// 備份碼
	let showBackupCodesModal = $state(false);
	let backupCodes = $state<string[]>([]);
	let backupCodesPassword = $state('');
	let regeneratingCodes = $state(false);

	// 登入活動
	let sessions = $state<LoginSession[]>([]);
	let loadingSessions = $state(true);
	let revokingSession = $state<string | null>(null);

	// 刪除帳號
	let showDeleteModal = $state(false);
	let deleteConfirmText = $state('');
	let deleting = $state(false);

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
			sessions = await securityApi.getSessions(user.id);
		} catch (error) {
			toast.error('載入登入活動失敗');
		} finally {
			loadingSessions = false;
		}
	}

	async function load2FAStatus() {
		if (!user) return;
		try {
			const status = await securityApi.get2FAStatus(user.id);
			twoFactorEnabled = status.enabled;
		} catch (error) {
			console.error('Failed to load 2FA status');
		}
	}

	// 計算密碼變更天數
	let passwordChangeDays = $derived(() => {
		if (!user?.passwordChangedAt) return null;
		const days = Math.floor(
			(Date.now() - new Date(user.passwordChangedAt).getTime()) / (1000 * 60 * 60 * 24)
		);
		return days;
	});

	// 密碼驗證條件
	let pwHasLength = $derived(passwordForm.new.length >= 8);
	let pwHasLower = $derived(/[a-z]/.test(passwordForm.new));
	let pwHasUpper = $derived(/[A-Z]/.test(passwordForm.new));
	let pwHasDigit = $derived(/\d/.test(passwordForm.new));

	// ========== 密碼變更 ==========
	function openPasswordModal() {
		passwordForm = { current: '', new: '', confirm: '' };
		passwordError = '';
		showPasswordModal = true;
	}

	function closePasswordModal() {
		showPasswordModal = false;
		passwordForm = { current: '', new: '', confirm: '' };
		passwordError = '';
	}

	async function handleChangePassword() {
		if (!user) return;
		passwordError = '';

		if (!passwordForm.current) {
			passwordError = '請輸入目前密碼';
			return;
		}
		if (!passwordForm.new) {
			passwordError = '請輸入新密碼';
			return;
		}
		if (passwordForm.new.length < 8) {
			passwordError = '新密碼至少需要 8 個字元';
			return;
		}
		if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.new)) {
			passwordError = '密碼需包含大小寫字母和數字';
			return;
		}
		if (passwordForm.new !== passwordForm.confirm) {
			passwordError = '新密碼與確認密碼不一致';
			return;
		}

		changingPassword = true;
		try {
			await authApi.changePassword(user.id, passwordForm.current, passwordForm.new);
			auth.updateUser({ passwordChangedAt: new Date().toISOString() });
			toast.success('密碼已變更成功');
			closePasswordModal();
		} catch (error) {
			passwordError = error instanceof Error ? error.message : '密碼變更失敗';
		} finally {
			changingPassword = false;
		}
	}

	// ========== 兩步驟驗證 ==========
	async function openTwoFactorModal() {
		if (!user) return;
		twoFactorStep = 'setup';
		verificationCode = '';
		twoFactorSetup = null;
		showTwoFactorModal = true;

		try {
			twoFactorSetup = await securityApi.setup2FA(user.id);
		} catch (error) {
			toast.error('設定失敗，請稍後再試');
			showTwoFactorModal = false;
		}
	}

	function closeTwoFactorModal() {
		showTwoFactorModal = false;
		twoFactorStep = 'setup';
		verificationCode = '';
		twoFactorSetup = null;
	}

	async function handleSetup2FA() {
		if (!user || !twoFactorSetup) return;

		if (twoFactorStep === 'setup') {
			twoFactorStep = 'verify';
			return;
		}

		if (twoFactorStep === 'verify') {
			if (!verificationCode || verificationCode.length !== 6) {
				toast.error('請輸入 6 位驗證碼');
				return;
			}

			settingUp2FA = true;
			try {
				await securityApi.verify2FA(user.id, verificationCode, twoFactorSetup.secret);
				twoFactorEnabled = true;
				auth.updateUser({ twoFactorEnabled: true });
				twoFactorStep = 'backup';
				backupCodes = twoFactorSetup.backupCodes;
			} catch (error) {
				toast.error(error instanceof Error ? error.message : '驗證失敗');
			} finally {
				settingUp2FA = false;
			}
			return;
		}

		if (twoFactorStep === 'backup') {
			toast.success('兩步驟驗證已啟用');
			closeTwoFactorModal();
		}
	}

	function openDisable2FAModal() {
		disable2FAPassword = '';
		showDisable2FAModal = true;
	}

	function closeDisable2FAModal() {
		showDisable2FAModal = false;
		disable2FAPassword = '';
	}

	async function handleDisable2FA() {
		if (!user) return;

		if (!disable2FAPassword) {
			toast.error('請輸入密碼');
			return;
		}

		disabling2FA = true;
		try {
			await securityApi.disable2FA(user.id, disable2FAPassword);
			twoFactorEnabled = false;
			auth.updateUser({ twoFactorEnabled: false });
			toast.success('兩步驟驗證已停用');
			closeDisable2FAModal();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '停用失敗');
		} finally {
			disabling2FA = false;
		}
	}

	// ========== 備份碼 ==========
	function openBackupCodesModal() {
		backupCodesPassword = '';
		backupCodes = [];
		showBackupCodesModal = true;
	}

	function closeBackupCodesModal() {
		showBackupCodesModal = false;
		backupCodesPassword = '';
		backupCodes = [];
	}

	async function handleRegenerateBackupCodes() {
		if (!user) return;

		if (!backupCodesPassword) {
			toast.error('請輸入密碼');
			return;
		}

		regeneratingCodes = true;
		try {
			backupCodes = await securityApi.regenerateBackupCodes(user.id, backupCodesPassword);
			toast.success('已產生新的備份碼');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '產生失敗');
		} finally {
			regeneratingCodes = false;
		}
	}

	function copyBackupCodes() {
		const text = backupCodes.join('\n');
		navigator.clipboard.writeText(text);
		toast.success('已複製到剪貼簿');
	}

	function downloadBackupCodes() {
		const text = `Ara Admin 兩步驟驗證備份碼\n${'='.repeat(30)}\n\n${backupCodes.join('\n')}\n\n請妥善保管這些備份碼，每個備份碼只能使用一次。`;
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'ara-admin-backup-codes.txt';
		a.click();
		URL.revokeObjectURL(url);
	}

	// ========== Session 管理 ==========
	async function revokeSession(sessionId: string) {
		revokingSession = sessionId;
		try {
			await securityApi.revokeSession(sessionId);
			sessions = sessions.filter((s) => s.id !== sessionId);
			toast.success('已登出該裝置');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '操作失敗');
		} finally {
			revokingSession = null;
		}
	}

	async function revokeAllSessions() {
		if (!user) return;
		try {
			const count = await securityApi.revokeAllOtherSessions(user.id);
			sessions = sessions.filter((s) => s.isCurrent);
			toast.success(`已登出 ${count} 個裝置`);
		} catch (error) {
			toast.error('操作失敗');
		}
	}

	// 格式化時間
	function formatLastActive(dateStr: string, isCurrent: boolean): string {
		if (isCurrent) return '目前使用中';

		const date = new Date(dateStr);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return '剛剛';
		if (minutes < 60) return `${minutes} 分鐘前`;
		if (hours < 24) return `${hours} 小時前`;
		if (days < 30) return `${days} 天前`;
		return date.toLocaleDateString('zh-TW');
	}

	// 裝置圖示
	function getDeviceIcon(device: string): string {
		if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('phone')) {
			return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />';
		}
		if (device.toLowerCase().includes('tablet')) {
			return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />';
		}
		return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />';
	}

	// ========== 刪除帳號 ==========
	function openDeleteModal() {
		deleteConfirmText = '';
		showDeleteModal = true;
	}

	function closeDeleteModal() {
		showDeleteModal = false;
		deleteConfirmText = '';
	}

	async function handleDeleteAccount() {
		if (deleteConfirmText !== 'DELETE') {
			toast.error('請輸入 DELETE 確認刪除');
			return;
		}

		deleting = true;
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			toast.info('帳號刪除請求已提交，將於 30 天後永久刪除');
			closeDeleteModal();
		} catch (error) {
			toast.error('操作失敗，請稍後再試');
		} finally {
			deleting = false;
		}
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
	<div class="max-w-3xl mx-auto space-y-6">
		<!-- 密碼 -->
		<Card variant="bordered">
			{#snippet header()}
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
					</svg>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">密碼</h2>
				</div>
			{/snippet}
			{#snippet children()}
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-900 dark:text-gray-100">登入密碼</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">
							{#if passwordChangeDays() !== null}
								上次變更於 {passwordChangeDays()} 天前
							{:else}
								尚未變更過密碼
							{/if}
						</p>
					</div>
					<Button variant="outline" onclick={openPasswordModal}>
						{#snippet children()}變更密碼{/snippet}
					</Button>
				</div>
			{/snippet}
		</Card>

		<!-- 兩步驟驗證 -->
		<Card variant="bordered">
			{#snippet header()}
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">兩步驟驗證</h2>
					</div>
					{#if twoFactorEnabled}
						<Badge variant="success">已啟用</Badge>
					{:else}
						<Badge variant="warning">未啟用</Badge>
					{/if}
				</div>
			{/snippet}
			{#snippet children()}
				<div class="space-y-4">
					<p class="text-sm text-gray-600 dark:text-gray-400">
						兩步驟驗證可為您的帳號增加額外的安全保護。啟用後，登入時除了密碼外，還需要輸入驗證器 App 產生的驗證碼。
					</p>
					{#if twoFactorEnabled}
						<div class="flex flex-wrap gap-3">
							<Button variant="outline" onclick={openBackupCodesModal}>
								{#snippet children()}
									<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									查看備份碼
								{/snippet}
							</Button>
							<Button variant="ghost" onclick={openDisable2FAModal}>
								{#snippet children()}停用兩步驟驗證{/snippet}
							</Button>
						</div>
					{:else}
						<Button onclick={openTwoFactorModal}>
							{#snippet children()}
								<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								</svg>
								啟用兩步驟驗證
							{/snippet}
						</Button>
					{/if}
				</div>
			{/snippet}
		</Card>

		<!-- 登入活動 -->
		<Card variant="bordered">
			{#snippet header()}
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">登入活動</h2>
					</div>
					{#if sessions.length > 1}
						<Button variant="ghost" size="sm" onclick={revokeAllSessions}>
							{#snippet children()}登出所有其他裝置{/snippet}
						</Button>
					{/if}
				</div>
			{/snippet}
			{#snippet children()}
				{#if loadingSessions}
					<div class="flex justify-center py-8">
						<svg class="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					</div>
				{:else if sessions.length === 0}
					<p class="text-center text-gray-500 dark:text-gray-400 py-4">沒有登入活動記錄</p>
				{:else}
					<div class="divide-y divide-gray-200 dark:divide-gray-700">
						{#each sessions as session}
							<div class="flex items-center justify-between py-4 first:pt-0 last:pb-0">
								<div class="flex items-center gap-4">
									<div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
										<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											{@html getDeviceIcon(session.device)}
										</svg>
									</div>
									<div>
										<p class="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
											{session.device} - {session.browser}
											{#if session.isCurrent}
												<Badge variant="info" size="sm">目前</Badge>
											{/if}
										</p>
										<p class="text-sm text-gray-500 dark:text-gray-400">
											{session.os} · {session.location} · {formatLastActive(session.lastActiveAt, session.isCurrent)}
										</p>
									</div>
								</div>
								{#if !session.isCurrent}
									<Button
										variant="ghost"
										size="sm"
										loading={revokingSession === session.id}
										onclick={() => revokeSession(session.id)}
									>
										{#snippet children()}登出{/snippet}
									</Button>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			{/snippet}
		</Card>

		<!-- 危險區域 -->
		<Card variant="bordered" class="border-red-200 dark:border-red-900">
			{#snippet header()}
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					<h2 class="text-lg font-semibold text-red-600 dark:text-red-400">危險區域</h2>
				</div>
			{/snippet}
			{#snippet children()}
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-900 dark:text-gray-100">刪除帳號</p>
							<p class="text-sm text-gray-500 dark:text-gray-400">
								永久刪除您的帳號和所有相關資料。此操作無法復原。
							</p>
						</div>
						<Button variant="danger" onclick={openDeleteModal}>
							{#snippet children()}刪除帳號{/snippet}
						</Button>
					</div>
				</div>
			{/snippet}
		</Card>
	</div>
</PageContainer>

<!-- 密碼變更 Modal -->
<Modal open={showPasswordModal} onClose={closePasswordModal} title="變更密碼">
	{#snippet children()}
		<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
			{#if passwordError}
				<div class="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg" role="alert">
					{passwordError}
				</div>
			{/if}

			<PasswordInput
				label="目前密碼"
				placeholder="請輸入目前密碼"
				bind:value={passwordForm.current}
				autocomplete="current-password"
				required
			/>

			<PasswordInput
				label="新密碼"
				placeholder="請輸入新密碼"
				showStrength
				bind:value={passwordForm.new}
				autocomplete="new-password"
				required
			/>

			<PasswordInput
				label="確認新密碼"
				placeholder="請再次輸入新密碼"
				bind:value={passwordForm.confirm}
				autocomplete="new-password"
				required
			/>

			<div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
				<p class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">密碼要求：</p>
				<ul class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
					<li class="flex items-center gap-1.5">
						<span class={pwHasLength ? 'text-green-500' : ''}>
							{pwHasLength ? '✓' : '○'}
						</span>
						至少 8 個字元
					</li>
					<li class="flex items-center gap-1.5">
						<span class={pwHasLower ? 'text-green-500' : ''}>
							{pwHasLower ? '✓' : '○'}
						</span>
						包含小寫字母
					</li>
					<li class="flex items-center gap-1.5">
						<span class={pwHasUpper ? 'text-green-500' : ''}>
							{pwHasUpper ? '✓' : '○'}
						</span>
						包含大寫字母
					</li>
					<li class="flex items-center gap-1.5">
						<span class={pwHasDigit ? 'text-green-500' : ''}>
							{pwHasDigit ? '✓' : '○'}
						</span>
						包含數字
					</li>
				</ul>
			</div>

			<div class="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onclick={closePasswordModal}>
					{#snippet children()}取消{/snippet}
				</Button>
				<Button type="submit" loading={changingPassword}>
					{#snippet children()}確認變更{/snippet}
				</Button>
			</div>
		</form>
	{/snippet}
</Modal>

<!-- 兩步驟驗證 Modal -->
<Modal open={showTwoFactorModal} onClose={closeTwoFactorModal} title="設定兩步驟驗證" size="lg">
	{#snippet children()}
		<div class="space-y-6">
			<!-- 步驟指示器 -->
			<div class="flex items-center justify-center gap-2">
				{#each ['setup', 'verify', 'backup'] as step, i}
					<div class="flex items-center">
						<div class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
							step === twoFactorStep
								? 'bg-[var(--color-primary-500)] text-white'
								: ['setup', 'verify', 'backup'].indexOf(twoFactorStep) > i
									? 'bg-green-500 text-white'
									: 'bg-gray-200 dark:bg-gray-700 text-gray-500'
						}`}>
							{#if ['setup', 'verify', 'backup'].indexOf(twoFactorStep) > i}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							{:else}
								{i + 1}
							{/if}
						</div>
						{#if i < 2}
							<div class={`w-12 h-0.5 mx-1 ${
								['setup', 'verify', 'backup'].indexOf(twoFactorStep) > i
									? 'bg-green-500'
									: 'bg-gray-200 dark:bg-gray-700'
							}`}></div>
						{/if}
					</div>
				{/each}
			</div>

			{#if twoFactorStep === 'setup'}
				<div class="text-center space-y-4">
					<p class="text-sm text-gray-600 dark:text-gray-400">
						使用驗證器 App（如 Google Authenticator、Authy）掃描以下 QR Code
					</p>
					<!-- 模擬 QR Code -->
					<div class="w-48 h-48 mx-auto bg-white dark:bg-gray-100 rounded-lg flex items-center justify-center p-4">
						{#if twoFactorSetup}
							<div class="w-full h-full bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center">
								<svg class="w-32 h-32 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
									<path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v3h-3v-3zm-5 0h3v3h-3v-3zm5 5h3v3h-3v-3zm-5 0h3v3h-3v-3z"/>
								</svg>
							</div>
						{:else}
							<svg class="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
						{/if}
					</div>
					{#if twoFactorSetup}
						<p class="text-xs text-gray-500 dark:text-gray-400">
							無法掃描？手動輸入金鑰：
							<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded select-all">{twoFactorSetup.secret}</code>
						</p>
					{/if}
				</div>
			{:else if twoFactorStep === 'verify'}
				<div class="space-y-4">
					<p class="text-sm text-gray-600 dark:text-gray-400 text-center">
						請輸入驗證器 App 顯示的 6 位數驗證碼
					</p>
					<div class="max-w-xs mx-auto">
						<label for="verification-code" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 text-center">
							驗證碼
						</label>
						<input
							id="verification-code"
							type="text"
							inputmode="numeric"
							bind:value={verificationCode}
							placeholder="000000"
							maxlength={6}
							class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-xl text-center tracking-[0.5em] text-gray-900 dark:text-gray-100 dark:bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
						/>
					</div>
				</div>
			{:else if twoFactorStep === 'backup'}
				<div class="space-y-4">
					<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
						<div class="flex gap-3">
							<svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
							<div>
								<p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">請保存您的備份碼</p>
								<p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
									這些備份碼可在您無法使用驗證器 App 時使用。每個備份碼只能使用一次。
								</p>
							</div>
						</div>
					</div>

					<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
						<div class="grid grid-cols-2 gap-2">
							{#each backupCodes as code}
								<code class="text-sm font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-center">
									{code}
								</code>
							{/each}
						</div>
					</div>

					<div class="flex justify-center gap-3">
						<Button variant="outline" onclick={copyBackupCodes}>
							{#snippet children()}
								<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
								</svg>
								複製
							{/snippet}
						</Button>
						<Button variant="outline" onclick={downloadBackupCodes}>
							{#snippet children()}
								<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
								</svg>
								下載
							{/snippet}
						</Button>
					</div>
				</div>
			{/if}

			<div class="flex justify-end gap-3 pt-2">
				{#if twoFactorStep !== 'backup'}
					<Button type="button" variant="ghost" onclick={closeTwoFactorModal}>
						{#snippet children()}取消{/snippet}
					</Button>
				{/if}
				<Button onclick={handleSetup2FA} loading={settingUp2FA}>
					{#snippet children()}
						{#if twoFactorStep === 'setup'}
							下一步
						{:else if twoFactorStep === 'verify'}
							驗證並啟用
						{:else}
							完成設定
						{/if}
					{/snippet}
				</Button>
			</div>
		</div>
	{/snippet}
</Modal>

<!-- 停用兩步驟驗證 Modal -->
<Modal open={showDisable2FAModal} onClose={closeDisable2FAModal} title="停用兩步驟驗證">
	{#snippet children()}
		<div class="space-y-4">
			<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
				<p class="text-sm text-yellow-700 dark:text-yellow-300">
					停用兩步驟驗證將降低您帳號的安全性。請確認您要執行此操作。
				</p>
			</div>

			<PasswordInput
				label="確認密碼"
				placeholder="請輸入密碼以確認"
				bind:value={disable2FAPassword}
				autocomplete="current-password"
				required
			/>

			<div class="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onclick={closeDisable2FAModal}>
					{#snippet children()}取消{/snippet}
				</Button>
				<Button variant="danger" loading={disabling2FA} onclick={handleDisable2FA}>
					{#snippet children()}停用{/snippet}
				</Button>
			</div>
		</div>
	{/snippet}
</Modal>

<!-- 備份碼 Modal -->
<Modal open={showBackupCodesModal} onClose={closeBackupCodesModal} title="備份碼">
	{#snippet children()}
		<div class="space-y-4">
			{#if backupCodes.length === 0}
				<p class="text-sm text-gray-600 dark:text-gray-400">
					輸入密碼以查看或重新產生備份碼。
				</p>

				<PasswordInput
					label="確認密碼"
					placeholder="請輸入密碼"
					bind:value={backupCodesPassword}
					autocomplete="current-password"
					required
				/>

				<div class="flex justify-end gap-3 pt-2">
					<Button type="button" variant="ghost" onclick={closeBackupCodesModal}>
						{#snippet children()}取消{/snippet}
					</Button>
					<Button loading={regeneratingCodes} onclick={handleRegenerateBackupCodes}>
						{#snippet children()}產生新備份碼{/snippet}
					</Button>
				</div>
			{:else}
				<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
					<p class="text-sm text-yellow-700 dark:text-yellow-300">
						這些是新產生的備份碼，之前的備份碼已失效。請妥善保管。
					</p>
				</div>

				<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
					<div class="grid grid-cols-2 gap-2">
						{#each backupCodes as code}
							<code class="text-sm font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-center">
								{code}
							</code>
						{/each}
					</div>
				</div>

				<div class="flex justify-center gap-3">
					<Button variant="outline" onclick={copyBackupCodes}>
						{#snippet children()}
							<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
							複製
						{/snippet}
					</Button>
					<Button variant="outline" onclick={downloadBackupCodes}>
						{#snippet children()}
							<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
							</svg>
							下載
						{/snippet}
					</Button>
				</div>

				<div class="flex justify-end pt-2">
					<Button onclick={closeBackupCodesModal}>
						{#snippet children()}完成{/snippet}
					</Button>
				</div>
			{/if}
		</div>
	{/snippet}
</Modal>

<!-- 刪除帳號 Modal -->
<Modal open={showDeleteModal} onClose={closeDeleteModal} title="刪除帳號">
	{#snippet children()}
		<div class="space-y-4">
			<div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
				<p class="text-sm text-red-600 dark:text-red-400 font-medium">
					警告：此操作無法復原！
				</p>
				<p class="text-sm text-red-600 dark:text-red-400 mt-1">
					刪除帳號後，您的所有資料將在 30 天後永久刪除，包括：
				</p>
				<ul class="text-sm text-red-600 dark:text-red-400 mt-2 list-disc list-inside">
					<li>個人資料和設定</li>
					<li>所有操作記錄</li>
					<li>系統權限和角色</li>
				</ul>
			</div>

			<div>
				<label for="delete-confirm" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
					確認刪除
				</label>
				<input
					id="delete-confirm"
					type="text"
					bind:value={deleteConfirmText}
					placeholder="請輸入 DELETE 確認"
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
				/>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					請輸入「DELETE」以確認您要刪除帳號
				</p>
			</div>

			<div class="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onclick={closeDeleteModal}>
					{#snippet children()}取消{/snippet}
				</Button>
				<Button
					variant="danger"
					loading={deleting}
					disabled={deleteConfirmText !== 'DELETE'}
					onclick={handleDeleteAccount}
				>
					{#snippet children()}永久刪除帳號{/snippet}
				</Button>
			</div>
		</div>
	{/snippet}
</Modal>
