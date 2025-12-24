<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { config } from '$lib/constants';
	import { usersApi, roleLabels, statusLabels } from '$lib/services';
	import type { User, UserRole, UserStatus } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Button, Input, Select, Card, Badge, Spinner, PasswordInput } from '$lib/components/ui';

	let user = $state<User | null>(null);
	let loading = $state(true);
	let saving = $state(false);
	let errors = $state<Record<string, string>>({});

	let name = $state('');
	let email = $state('');
	let role = $state<UserRole>('viewer');
	let status = $state<UserStatus>('active');

	const roleOptions = [
		{ value: 'admin', label: '系統管理員' },
		{ value: 'manager', label: '經理' },
		{ value: 'editor', label: '編輯' },
		{ value: 'viewer', label: '觀察員' }
	];

	const statusOptions = [
		{ value: 'active', label: '啟用' },
		{ value: 'inactive', label: '停用' },
		{ value: 'pending', label: '待審核' },
		{ value: 'suspended', label: '已停權' }
	];

	async function loadUser() {
		const userId = $page.params.id;
		if (!userId) {
			goto('/settings/users');
			return;
		}
		loading = true;
		try {
			user = await usersApi.getUser(userId);
			name = user.name;
			email = user.email;
			role = user.role;
			status = user.status;
		} catch (error) {
			toast.error('載入使用者失敗');
			goto('/settings/users');
		} finally {
			loading = false;
		}
	}

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

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!validate() || !user) return;

		saving = true;
		try {
			await usersApi.updateUser(user.id, {
				name: name.trim(),
				email: email.trim(),
				role,
				status
			});
			toast.success('使用者已更新');
			goto('/settings/users');
		} catch (error) {
			toast.error('更新使用者失敗');
		} finally {
			saving = false;
		}
	}

	function formatDate(dateString?: string): string {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	$effect(() => {
		loadUser();
	});
</script>

<svelte:head>
	<title>{user ? `編輯 ${user.name}` : '載入中...'} - {config.appName}</title>
</svelte:head>

{#if loading}
	<div class="flex items-center justify-center min-h-[400px]">
		<div class="flex flex-col items-center gap-3">
			<Spinner size="lg" />
			<p class="text-gray-500">載入中...</p>
		</div>
	</div>
{:else if user}
	{@const currentUser = user}
	<PageContainer title="編輯使用者" description="修改使用者帳號資訊" backLink="/settings/users" backLabel="返回列表">
		<div class="space-y-6">
			<!-- User Info Card -->
			<div>
				<Card variant="bordered">
					{#snippet children()}
						<div class="flex flex-col items-center text-center">
							<div
								class="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center mb-4"
							>
								{#if currentUser.avatar}
									<img
										src={currentUser.avatar}
										alt={currentUser.name}
										class="w-24 h-24 rounded-full object-cover"
									/>
								{:else}
									<span class="text-3xl font-bold text-white">
										{currentUser.name.charAt(0).toUpperCase()}
									</span>
								{/if}
							</div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{currentUser.name}</h3>
							<p class="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
							<div class="mt-3">
								<Badge
									variant={currentUser.status === 'active'
										? 'success'
										: currentUser.status === 'suspended'
											? 'error'
											: currentUser.status === 'pending'
												? 'warning'
												: 'default'}
								>
									{#snippet children()}{statusLabels[currentUser.status]}{/snippet}
								</Badge>
							</div>
						</div>

						<div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
							<div class="flex justify-between text-sm">
								<span class="text-gray-500 dark:text-gray-400">ID</span>
								<span class="text-gray-900 dark:text-gray-100 font-mono">{currentUser.id}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-gray-500 dark:text-gray-400">角色</span>
								<span class="text-gray-900 dark:text-gray-100">{roleLabels[currentUser.role]}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-gray-500 dark:text-gray-400">建立時間</span>
								<span class="text-gray-900 dark:text-gray-100">{formatDate(currentUser.createdAt)}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-gray-500 dark:text-gray-400">最後登入</span>
								<span class="text-gray-900 dark:text-gray-100"
									>{formatDate(currentUser.lastLoginAt)}</span
								>
							</div>
						</div>
					{/snippet}
				</Card>
			</div>

			<!-- Edit Form -->
			<div>
				<Card variant="bordered">
					{#snippet header()}
						<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">基本資料</h3>
					{/snippet}
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
								<Select
									bind:value={role}
									options={roleOptions}
									label="角色"
									required
									disabled={saving}
								/>
								<Select
									bind:value={status}
									options={statusOptions}
									label="狀態"
									required
									disabled={saving}
								/>
							</div>

							<div
								class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
							>
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
										儲存變更
									{/snippet}
								</Button>
							</div>
						</form>
					{/snippet}
				</Card>

				<!-- Password Change Card -->
				<Card variant="bordered" class="mt-6">
					{#snippet header()}
						<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">變更密碼</h3>
					{/snippet}
					{#snippet children()}
						<form class="space-y-6">
							<div class="grid gap-6 sm:grid-cols-2">
								<PasswordInput
									label="新密碼"
									placeholder="輸入新密碼"
									showStrength
									autocomplete="new-password"
								/>
								<PasswordInput
									label="確認新密碼"
									placeholder="再次輸入新密碼"
									autocomplete="new-password"
								/>
							</div>

							<div class="flex justify-end">
								<Button variant="outline">
									{#snippet children()}變更密碼{/snippet}
								</Button>
							</div>
						</form>
					{/snippet}
				</Card>
			</div>
		</div>
	</PageContainer>
{/if}
