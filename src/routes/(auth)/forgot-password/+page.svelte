<script lang="ts">
	import { config } from '$lib/constants';
	import { authApi } from '$lib/services';
	import { toast } from '$lib/stores/toast';
	import { Button, Input, ThemeToggle } from '$lib/components/ui';

	let email = $state('');
	let loading = $state(false);
	let sent = $state(false);
	let error = $state('');

	// 重新發送倒數計時
	let countdown = $state(0);
	let countdownInterval: ReturnType<typeof setInterval> | null = null;

	function startCountdown() {
		countdown = 60;
		if (countdownInterval) clearInterval(countdownInterval);
		countdownInterval = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				if (countdownInterval) {
					clearInterval(countdownInterval);
					countdownInterval = null;
				}
			}
		}, 1000);
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		error = '';

		if (!email.trim()) {
			error = '請輸入電子郵件';
			return;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			error = '請輸入有效的電子郵件格式';
			return;
		}

		loading = true;
		try {
			await authApi.forgotPassword(email);
			sent = true;
			startCountdown();
			toast.success('重設連結已發送');
		} catch (err) {
			error = err instanceof Error ? err.message : '發送失敗，請稍後再試';
		} finally {
			loading = false;
		}
	}

	async function handleResend() {
		if (countdown > 0) return;

		loading = true;
		error = '';
		try {
			await authApi.forgotPassword(email);
			startCountdown();
			toast.success('重設連結已重新發送');
		} catch (err) {
			error = err instanceof Error ? err.message : '發送失敗，請稍後再試';
		} finally {
			loading = false;
		}
	}

	function handleChangeEmail() {
		sent = false;
		countdown = 0;
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
	}
</script>

<svelte:head>
	<title>忘記密碼 - {config.appName}</title>
</svelte:head>

<div class="card p-8 relative">
	<!-- Theme Toggle -->
	<div class="absolute top-4 right-4">
		<ThemeToggle size="sm" />
	</div>

	{#if sent}
		<div class="text-center">
			<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
				<svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
			</div>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">檢查您的信箱</h2>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				我們已將密碼重設連結發送至<br />
				<span class="font-medium text-gray-900 dark:text-gray-100">{email}</span>
			</p>

			{#if error}
				<div class="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
					{error}
				</div>
			{/if}

			<div class="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
				<p class="text-sm text-gray-600 dark:text-gray-400">
					沒有收到郵件？請檢查垃圾郵件資料夾
				</p>
				<div class="mt-3">
					{#if countdown > 0}
						<p class="text-sm text-gray-500 dark:text-gray-400">
							<span class="font-medium text-[var(--color-primary-600)]">{countdown}</span> 秒後可重新發送
						</p>
					{:else}
						<button
							type="button"
							class="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] disabled:opacity-50"
							onclick={handleResend}
							disabled={loading}
						>
							{loading ? '發送中...' : '重新發送'}
						</button>
					{/if}
				</div>
			</div>

			<button
				type="button"
				class="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
				onclick={handleChangeEmail}
			>
				使用其他信箱
			</button>
		</div>

		<div class="mt-8">
			<Button variant="outline" class="w-full" href="/login">
				{#snippet children()}返回登入{/snippet}
			</Button>
		</div>
	{:else}
		<div class="text-center">
			<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)]/30 flex items-center justify-center">
				<svg class="w-8 h-8 text-[var(--color-primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
				</svg>
			</div>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">忘記密碼</h2>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				請輸入您的電子郵件，我們將發送密碼重設連結
			</p>
		</div>

		{#if error}
			<div class="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
				{error}
			</div>
		{/if}

		<form class="mt-8 space-y-6" onsubmit={handleSubmit}>
			<Input
				bind:value={email}
				type="email"
				label="電子郵件"
				placeholder="your@email.com"
				required
				disabled={loading}
			/>

			<Button type="submit" class="w-full" {loading}>
				{#snippet children()}{loading ? '發送中...' : '發送重設連結'}{/snippet}
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
