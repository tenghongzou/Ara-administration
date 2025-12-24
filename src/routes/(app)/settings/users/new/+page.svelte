<script lang="ts">
	import { goto } from '$app/navigation';
	import { config } from '$lib/constants';
	import { usersApi, roleLabels } from '$lib/services';
	import type { UserRole } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Button, Input, Select, Card, PasswordInput } from '$lib/components/ui';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let role = $state<UserRole>('viewer');
	let saving = $state(false);
	let errors = $state<Record<string, string>>({});

	const roleOptions = [
		{ value: 'admin', label: '系統管理員' },
		{ value: 'manager', label: '經理' },
		{ value: 'editor', label: '編輯' },
		{ value: 'viewer', label: '觀察員' }
	];

	function validate(): boolean {
		const newErrors: Record<string, string> = {};

		if (!name.trim()) {
			newErrors.name = '請輸入姓名';
		}

		if (!email.trim()) {
			newErrors.email = '請輸入電子郵件';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = '請輸入有效的電子郵件格式';
		}

		if (!password) {
			newErrors.password = '請輸入密碼';
		} else if (password.length < 6) {
			newErrors.password = '密碼至少需要 6 個字元';
		}

		if (password !== confirmPassword) {
			newErrors.confirmPassword = '密碼確認不一致';
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!validate()) return;

		saving = true;
		try {
			await usersApi.createUser({
				name: name.trim(),
				email: email.trim(),
				role
			});
			toast.success('使用者已建立');
			goto('/settings/users');
		} catch (error) {
			toast.error('建立使用者失敗');
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>新增使用者 - {config.appName}</title>
</svelte:head>

<PageContainer title="新增使用者" description="建立新的系統使用者帳號" backLink="/settings/users" backLabel="返回列表">
	<div>
		<Card variant="bordered">
			{#snippet children()}
				<form class="space-y-6" onsubmit={handleSubmit}>
					<div class="grid gap-6 sm:grid-cols-2">
						<Input
							bind:value={name}
							label="姓名"
							placeholder="請輸入使用者姓名"
							required
							error={errors.name}
							disabled={saving}
						/>
						<Input
							bind:value={email}
							type="email"
							label="電子郵件"
							placeholder="user@example.com"
							required
							error={errors.email}
							disabled={saving}
						/>
					</div>

					<div class="grid gap-6 sm:grid-cols-2">
						<PasswordInput
							bind:value={password}
							label="密碼"
							placeholder="至少 6 個字元"
							required
							showStrength
							error={errors.password}
							disabled={saving}
							autocomplete="new-password"
						/>
						<PasswordInput
							bind:value={confirmPassword}
							label="確認密碼"
							placeholder="再次輸入密碼"
							required
							error={errors.confirmPassword}
							disabled={saving}
							autocomplete="new-password"
						/>
					</div>

					<Select
						bind:value={role}
						options={roleOptions}
						label="角色"
						required
						disabled={saving}
					/>

					<div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
						<Button variant="outline" href="/settings/users" disabled={saving}>
							{#snippet children()}取消{/snippet}
						</Button>
						<Button type="submit" loading={saving}>
							{#snippet children()}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								建立使用者
							{/snippet}
						</Button>
					</div>
				</form>
			{/snippet}
		</Card>
	</div>
</PageContainer>
