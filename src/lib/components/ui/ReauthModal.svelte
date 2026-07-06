<script lang="ts">
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';
	import PasswordInput from './PasswordInput.svelte';
	import { reauthService, type ReauthState } from '$lib/services/auth/reauth-service';
	import { auth, currentUser } from '$lib/stores/auth';
	import { apiClient } from '$lib/services/core/api-client';
	import { goto } from '$app/navigation';

	let reauthState = $state<ReauthState>({
		isOpen: false,
		isLoading: false,
		error: null,
		needsTwoFactor: false
	});
	let password = $state('');
	let twoFactorCode = $state('');

	// 訂閱 reauthService 的狀態
	$effect(() => {
		const unsubscribe = reauthService.subscribe((s) => {
			reauthState = s;
		});
		return unsubscribe;
	});

	let user = $derived($currentUser);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!password.trim() || !user?.email) {
			return;
		}

		// 一旦後端要求 2FA，尚未輸入驗證碼前不送出
		if (reauthState.needsTwoFactor && !twoFactorCode.trim()) {
			return;
		}

		await reauthService.submit(
			password,
			user.email,
			(token: string) => {
				// 更新 auth store 和 apiClient
				auth.setUser(user!, token, auth.getState().userPermissions);
				apiClient.setToken(token);
				password = '';
				twoFactorCode = '';
			},
			reauthState.needsTwoFactor ? twoFactorCode.trim() : undefined
		);
	}

	function handleLogout() {
		reauthService.cancel();
		password = '';
		twoFactorCode = '';
		auth.logout();
		goto('/login');
	}
</script>

<Modal bind:open={reauthState.isOpen} title="登入已過期" size="sm" closable={false}>
	{#snippet children()}
		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="text-center mb-4">
				<div
					class="w-16 h-16 mx-auto mb-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"
				>
					<svg
						class="w-8 h-8 text-yellow-600 dark:text-yellow-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>
				<p class="text-gray-600 dark:text-gray-400">您的登入已過期，請重新輸入密碼以繼續。</p>
				{#if user}
					<p class="text-sm text-gray-500 dark:text-gray-500 mt-1">
						帳號：{user.email}
					</p>
				{/if}
			</div>

			<PasswordInput
				label="密碼"
				bind:value={password}
				placeholder="請輸入您的密碼"
				autocomplete="current-password"
				required
				error={reauthState.needsTwoFactor ? undefined : reauthState.error || undefined}
				disabled={reauthState.isLoading}
			/>

			{#if reauthState.needsTwoFactor}
				<div>
					<label
						for="reauth-2fa-code"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>
						兩步驟驗證碼
					</label>
					<input
						id="reauth-2fa-code"
						bind:value={twoFactorCode}
						type="text"
						inputmode="numeric"
						autocomplete="one-time-code"
						placeholder="6 位數驗證碼或備份碼"
						disabled={reauthState.isLoading}
						class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
					/>
					<p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
						請輸入驗證器應用程式的驗證碼，或一組未使用的備份碼。
					</p>
					{#if reauthState.error}
						<p class="text-sm text-red-600 dark:text-red-400 mt-1">{reauthState.error}</p>
					{/if}
				</div>
			{/if}
		</form>
	{/snippet}

	{#snippet footer()}
		<div class="flex justify-end gap-3">
			<Button variant="ghost" onclick={handleLogout} disabled={reauthState.isLoading}>
				{#snippet children()}登出{/snippet}
			</Button>
			<Button variant="primary" loading={reauthState.isLoading} onclick={handleSubmit}>
				{#snippet children()}重新登入{/snippet}
			</Button>
		</div>
	{/snippet}
</Modal>
