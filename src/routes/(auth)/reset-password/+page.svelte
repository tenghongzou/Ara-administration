<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { config } from '$lib/constants';
	import { authApi } from '$lib/services';
	import { toast } from '$lib/stores/toast';
	import { Button, PasswordInput, ThemeToggle } from '$lib/components/ui';

	// 從 URL 取得 token
	let token = $derived($page.url.searchParams.get('token') || '');

	let newPassword = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let success = $state(false);
	let error = $state('');
	let passwordError = $state('');
	let confirmError = $state('');

	// 密碼強度檢查
	let passwordStrength = $derived.by(() => {
		if (!newPassword) return { score: 0, label: '', color: '' };

		let score = 0;
		if (newPassword.length >= 6) score++;
		if (newPassword.length >= 8) score++;
		if (/[A-Z]/.test(newPassword)) score++;
		if (/[a-z]/.test(newPassword)) score++;
		if (/[0-9]/.test(newPassword)) score++;
		if (/[^A-Za-z0-9]/.test(newPassword)) score++;

		if (score <= 2) return { score, label: '弱', color: 'bg-red-500' };
		if (score <= 4) return { score, label: '中', color: 'bg-yellow-500' };
		return { score, label: '強', color: 'bg-green-500' };
	});

	function validatePassword(): boolean {
		passwordError = '';
		confirmError = '';

		if (!newPassword) {
			passwordError = '請輸入新密碼';
			return false;
		}

		if (newPassword.length < 6) {
			passwordError = '密碼至少需要 6 個字元';
			return false;
		}

		if (newPassword.length < 8) {
			passwordError = '建議密碼至少 8 個字元以提高安全性';
		}

		if (!confirmPassword) {
			confirmError = '請確認新密碼';
			return false;
		}

		if (newPassword !== confirmPassword) {
			confirmError = '兩次輸入的密碼不一致';
			return false;
		}

		return true;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		error = '';

		if (!token) {
			error = '無效的重設連結，請重新申請';
			return;
		}

		if (!validatePassword()) {
			return;
		}

		loading = true;
		try {
			await authApi.resetPassword(token, newPassword);
			success = true;
			toast.success('密碼已成功重設');
		} catch (err) {
			error = err instanceof Error ? err.message : '密碼重設失敗，請稍後再試';
		} finally {
			loading = false;
		}
	}

	function goToLogin() {
		goto('/login');
	}
</script>

<svelte:head>
	<title>重設密碼 - {config.appName}</title>
</svelte:head>

<div class="card p-8 relative">
	<!-- Theme Toggle -->
	<div class="absolute top-4 right-4">
		<ThemeToggle size="sm" />
	</div>

	{#if !token}
		<!-- 無效連結 -->
		<div class="text-center">
			<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
				<svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
			</div>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">連結無效</h2>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				此密碼重設連結無效或已過期，<br />
				請重新申請密碼重設。
			</p>
		</div>

		<div class="mt-8 space-y-3">
			<Button class="w-full" href="/forgot-password">
				{#snippet children()}重新申請{/snippet}
			</Button>
			<Button variant="outline" class="w-full" href="/login">
				{#snippet children()}返回登入{/snippet}
			</Button>
		</div>
	{:else if success}
		<!-- 重設成功 -->
		<div class="text-center">
			<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
				<svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			</div>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">密碼已重設</h2>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				您的密碼已成功更新，<br />
				請使用新密碼登入。
			</p>
		</div>

		<div class="mt-8">
			<Button class="w-full" onclick={goToLogin}>
				{#snippet children()}前往登入{/snippet}
			</Button>
		</div>
	{:else}
		<!-- 重設表單 -->
		<div class="text-center">
			<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)]/30 flex items-center justify-center">
				<svg class="w-8 h-8 text-[var(--color-primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
				</svg>
			</div>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">重設密碼</h2>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				請輸入您的新密碼
			</p>
		</div>

		{#if error}
			<div class="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
				{error}
			</div>
		{/if}

		<form class="mt-8 space-y-6" onsubmit={handleSubmit}>
			<div class="space-y-4">
				<div>
					<PasswordInput
						bind:value={newPassword}
						label="新密碼"
						placeholder="請輸入新密碼"
						required
						disabled={loading}
						id="new-password"
						autocomplete="new-password"
						error={passwordError}
					/>
					<!-- 密碼強度指示器 -->
					{#if newPassword}
						<div class="mt-2">
							<div class="flex items-center gap-2">
								<div class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
									<div
										class="h-full transition-all duration-300 {passwordStrength.color}"
										style="width: {(passwordStrength.score / 6) * 100}%"
									></div>
								</div>
								<span class="text-xs font-medium text-gray-500 dark:text-gray-400 w-6">
									{passwordStrength.label}
								</span>
							</div>
							<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
								建議包含大小寫字母、數字及特殊符號
							</p>
						</div>
					{/if}
				</div>

				<PasswordInput
					bind:value={confirmPassword}
					label="確認新密碼"
					placeholder="請再次輸入新密碼"
					required
					disabled={loading}
					id="confirm-password"
					autocomplete="new-password"
					error={confirmError}
				/>
			</div>

			<Button type="submit" class="w-full" {loading}>
				{#snippet children()}{loading ? '處理中...' : '確認重設'}{/snippet}
			</Button>

			<div class="text-center">
				<a
					href="/login"
					class="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]"
				>
					返回登入
				</a>
			</div>
		</form>
	{/if}
</div>
