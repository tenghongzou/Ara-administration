<script lang="ts">
	import type { User, UserRole, UserStatus } from '$lib/types';
	import { Spinner, Button, Input, Select, Card, Badge, PasswordInput } from '$lib/components/ui';
	import { statusLabels, statusColors } from '../types';
	import { usersService } from '../services/users.service';

	interface Props {
		user: User | null;
		loading?: boolean;
		saving?: boolean;
		name: string;
		email: string;
		role: UserRole;
		status: UserStatus;
		errors?: Record<string, string>;
		onNameChange: (value: string) => void;
		onEmailChange: (value: string) => void;
		onRoleChange: (value: UserRole) => void;
		onStatusChange: (value: UserStatus) => void;
		onSubmit: (event: Event) => void;
		onCancel: () => void;
	}

	let {
		user,
		loading = false,
		saving = false,
		name,
		email,
		role,
		status,
		errors = {},
		onNameChange,
		onEmailChange,
		onRoleChange,
		onStatusChange,
		onSubmit,
		onCancel
	}: Props = $props();

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

	function getStatusBadgeVariant(s: UserStatus): 'success' | 'error' | 'warning' | 'default' {
		if (s === 'active') return 'success';
		if (s === 'suspended') return 'error';
		if (s === 'pending') return 'warning';
		return 'default';
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
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-[400px]">
		<div class="flex flex-col items-center gap-3">
			<Spinner size="lg" />
			<p class="text-gray-500">載入中...</p>
		</div>
	</div>
{:else if user}
	{@const currentUser = user}
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
							<Badge variant={getStatusBadgeVariant(currentUser.status)}>
								{#snippet children()}{statusLabels[currentUser.status] || currentUser.status}{/snippet}
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
							<span class="text-gray-900 dark:text-gray-100">
								{roleOptions.find(r => r.value === currentUser.role)?.label || currentUser.role}
							</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-gray-500 dark:text-gray-400">建立時間</span>
							<span class="text-gray-900 dark:text-gray-100">{formatDate(currentUser.createdAt)}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-gray-500 dark:text-gray-400">最後登入</span>
							<span class="text-gray-900 dark:text-gray-100">{formatDate(currentUser.lastLoginAt)}</span>
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
					<form class="space-y-6" onsubmit={onSubmit}>
						<div class="grid gap-6 sm:grid-cols-2">
							<Input
								value={name}
								oninput={(e) => onNameChange(e.currentTarget.value)}
								label="姓名"
								placeholder="請輸入使用者姓名"
								required
								error={errors.name}
								disabled={saving}
							/>
							<Input
								value={email}
								type="email"
								oninput={(e) => onEmailChange(e.currentTarget.value)}
								label="電子郵件"
								placeholder="user@example.com"
								required
								error={errors.email}
								disabled={saving}
							/>
						</div>

						<div class="grid gap-6 sm:grid-cols-2">
							<Select
								value={role}
								onchange={(e) => onRoleChange(e.currentTarget.value as UserRole)}
								options={roleOptions}
								label="角色"
								required
								disabled={saving}
							/>
							<Select
								value={status}
								onchange={(e) => onStatusChange(e.currentTarget.value as UserStatus)}
								options={statusOptions}
								label="狀態"
								required
								disabled={saving}
							/>
						</div>

						<div
							class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
						>
							<Button variant="outline" onclick={onCancel} disabled={saving}>
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
{/if}
