<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { config } from '$lib/constants';
	import { authApi } from '$lib/services';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import { toast } from '$lib/stores/toast';
	import { Button, Input, Checkbox, PasswordInput, ThemeToggle } from '$lib/components/ui';

	let account = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let loading = $state(false);
	let error = $state('');

	// Redirect to dashboard if already authenticated
	$effect(() => {
		let authenticated = false;
		const unsubscribe = isAuthenticated.subscribe((value) => (authenticated = value));
		if (browser && authenticated) {
			goto('/dashboard');
		}
		return unsubscribe;
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		error = '';
		loading = true;

		try {
			const response = await authApi.login({ account, password });
			// 先儲存 token，再獲取權限
			auth.setUser(response.user, response.token, []);
			// 現在 token 已儲存，可以獲取權限
			const permissions = await authApi.getPermissions();
			auth.setPermissions(permissions);
			toast.success('登入成功');
			goto('/dashboard');
		} catch (err) {
			error = err instanceof Error ? err.message : '登入失敗，請稍後再試';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>登入 - {config.appName}</title>
</svelte:head>

<div class="card p-8 relative">
	<!-- Theme Toggle -->
	<div class="absolute top-4 right-4">
		<ThemeToggle size="sm" />
	</div>

	<div class="text-center">
		<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">登入</h2>
		<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">請輸入您的帳號密碼</p>
	</div>

	{#if error}
		<div class="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm" data-testid="login-error">
			{error}
		</div>
	{/if}

	<form class="mt-8 space-y-6" onsubmit={handleSubmit} data-testid="login-form">
		<div class="space-y-4">
			<Input
				bind:value={account}
				type="text"
				label="帳號"
				placeholder="使用者名稱或電子郵件"
				hint="可使用使用者名稱或電子郵件登入"
				required
				disabled={loading}
				id="account"
				autocomplete="username"
			/>
			<PasswordInput
				bind:value={password}
				label="密碼"
				required
				disabled={loading}
				id="password"
				autocomplete="current-password"
			/>
		</div>

		<div class="flex items-center justify-between">
			<Checkbox bind:checked={rememberMe} label="記住我" disabled={loading} />

			<a
				href="/forgot-password"
				class="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]"
			>
				忘記密碼？
			</a>
		</div>

		<div data-testid="submit-button">
			<Button type="submit" class="w-full" {loading}>
				{#snippet children()}{loading ? '登入中...' : '登入'}{/snippet}
			</Button>
		</div>
	</form>
</div>
