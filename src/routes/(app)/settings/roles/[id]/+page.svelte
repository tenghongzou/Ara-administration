<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { config } from '$lib/constants';
	import { rolesApi } from '$lib/services';
	import type { Role } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { auth } from '$lib/stores/auth';
	import { PageContainer } from '$lib/components/layout';
	import { Button, Badge, Input, Select } from '$lib/components/ui';
	import { PermissionGuard } from '$lib/components/auth';
	import { permissionGroups, roleColorOptions, getRoleColorClass, type Permission } from '$lib/permissions';
	import { hasPermission } from '$lib/stores/auth';

	let role = $state<Role | null>(null);
	let loading = $state(true);
	let saving = $state(false);

	// 表單欄位
	let formLabel = $state('');
	let formDescription = $state('');
	let formColor = $state('gray');
	let selectedPermissions = $state<Set<string>>(new Set());
	let hasChanges = $state(false);

	const roleId = $derived($page.params.id);
	const canEdit = $derived(hasPermission('roles:update') && role && !(role.isSystem && role.key === 'admin'));
	const isAdminRole = $derived(role?.isSystem && role?.key === 'admin');

	const colorOptions = roleColorOptions.map((c) => ({
		value: c.value,
		label: c.label
	}));

	async function loadRole() {
		if (!roleId) {
			goto('/settings/roles');
			return;
		}

		loading = true;
		try {
			role = await rolesApi.getRole(roleId);
			formLabel = role.label;
			formDescription = role.description;
			formColor = role.color;
			selectedPermissions = new Set(role.permissions);
		} catch (error) {
			toast.error('載入角色失敗');
			goto('/settings/roles');
		} finally {
			loading = false;
		}
	}

	function handleFieldChange() {
		hasChanges = true;
	}

	function togglePermission(permission: string) {
		if (!canEdit) return;

		const newSet = new Set(selectedPermissions);
		if (newSet.has(permission)) {
			newSet.delete(permission);
		} else {
			newSet.add(permission);
		}
		selectedPermissions = newSet;
		hasChanges = true;
	}

	function toggleGroupPermissions(groupKey: string) {
		if (!canEdit) return;

		const group = permissionGroups.find((g) => g.key === groupKey);
		if (!group) return;

		const groupPermissions = group.permissions.map((p) => p.key);
		const allSelected = groupPermissions.every((p) => selectedPermissions.has(p));

		const newSet = new Set(selectedPermissions);
		if (allSelected) {
			groupPermissions.forEach((p) => newSet.delete(p));
		} else {
			groupPermissions.forEach((p) => newSet.add(p));
		}
		selectedPermissions = newSet;
		hasChanges = true;
	}

	function isGroupFullySelected(groupKey: string): boolean {
		const group = permissionGroups.find((g) => g.key === groupKey);
		if (!group) return false;
		return group.permissions.every((p) => selectedPermissions.has(p.key));
	}

	async function handleSave() {
		if (!role || !canEdit) return;

		saving = true;
		try {
			await rolesApi.updateRole(role.id, {
				label: formLabel,
				description: formDescription,
				color: formColor,
				permissions: Array.from(selectedPermissions)
			});
			toast.success('角色已更新');
			hasChanges = false;
			// 重新載入使用者權限
			auth.refreshPermissions();
			await loadRole();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '更新角色失敗');
		} finally {
			saving = false;
		}
	}

	function handleReset() {
		if (role) {
			formLabel = role.label;
			formDescription = role.description;
			formColor = role.color;
			selectedPermissions = new Set(role.permissions);
			hasChanges = false;
		}
	}

	$effect(() => {
		if (roleId) {
			loadRole();
		}
	});

	type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';

	function getRoleBadgeVariant(colorValue: string): BadgeVariant {
		const colorMap: Record<string, BadgeVariant> = {
			red: 'error',
			orange: 'warning',
			green: 'success',
			blue: 'info',
			gray: 'default'
		};
		return colorMap[colorValue] || 'default';
	}
</script>

<svelte:head>
	<title>{role?.label || '角色'} - 角色設定 - {config.appName}</title>
</svelte:head>

<PageContainer
	title={role?.label || '載入中...'}
	description={role?.description || ''}
	backLink="/settings/roles"
	backLabel="返回角色列表"
>
	{#snippet actions()}
		{#if canEdit && hasChanges}
			<Button variant="outline" onclick={handleReset}>
				{#snippet children()}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					重設
				{/snippet}
			</Button>
			<Button loading={saving} onclick={handleSave}>
				{#snippet children()}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					儲存變更
				{/snippet}
			</Button>
		{/if}
	{/snippet}

	<div class="space-y-6" data-testid="role-edit-page">
		{#if loading}
			<div class="space-y-4">
				{#each Array(3) as _}
					<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
						<div class="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
						<div class="grid gap-3 sm:grid-cols-2">
							{#each Array(4) as _}
								<div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else if role}
			<!-- Role Basic Info -->
			<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center">
						<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					</div>
					<div class="flex-1">
						<div class="flex items-center gap-3">
							<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
								基本資訊
							</h2>
							{#if role.isSystem}
								<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
									系統角色
								</span>
							{/if}
						</div>
						<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
							角色識別碼: <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{role.key}</code>
						</p>
					</div>
					<div class="text-right">
						<p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
							{role.userCount ?? 0}
						</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">位使用者</p>
					</div>
				</div>

				{#if isAdminRole}
					<div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
							<div>
								<h4 class="font-medium text-amber-800 dark:text-amber-200">系統管理員角色</h4>
								<p class="text-sm text-amber-700 dark:text-amber-300 mt-1">
									系統管理員擁有所有權限，無法修改。這是為了確保系統安全性。
								</p>
							</div>
						</div>
					</div>
				{:else}
					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label for="role-label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								角色名稱
							</label>
							<Input
								id="role-label"
								bind:value={formLabel}
								placeholder="輸入角色名稱"
								disabled={!canEdit}
								onchange={handleFieldChange}
							/>
						</div>
						<div>
							<label for="role-color" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								顏色標籤
							</label>
							<Select
								id="role-color"
								bind:value={formColor}
								options={colorOptions}
								disabled={!canEdit}
								onchange={handleFieldChange}
							/>
						</div>
						<div class="sm:col-span-2">
							<label for="role-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								角色描述
							</label>
							<Input
								id="role-description"
								bind:value={formDescription}
								placeholder="輸入角色描述"
								disabled={!canEdit}
								onchange={handleFieldChange}
							/>
						</div>
					</div>
				{/if}
			</div>

			{#if isAdminRole}
				<!-- Admin All Permissions Display -->
				<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
						擁有的權限（全部）
					</h3>
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each permissionGroups as group}
							<div class="space-y-2">
								<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
									{group.label}
								</h4>
								<ul class="space-y-1">
									{#each group.permissions as permission}
										<li class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
											<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
											{permission.label}
										</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Permission Groups -->
				{#each permissionGroups as group}
					<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
						<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
							<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
								{group.label}
							</h3>
							{#if canEdit}
								<button
									type="button"
									class="flex items-center gap-2 text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)] dark:hover:text-[var(--color-primary-300)]"
									onclick={() => toggleGroupPermissions(group.key)}
								>
									{#if isGroupFullySelected(group.key)}
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
										取消全選
									{:else}
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
										全選
									{/if}
								</button>
							{/if}
						</div>
						<div class="p-6">
							<div class="grid gap-3 sm:grid-cols-2">
								{#each group.permissions as permission}
									<label
										class="flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer
										{selectedPermissions.has(permission.key)
											? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20'
											: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
										{!canEdit ? 'cursor-not-allowed opacity-60' : ''}"
									>
										<input
											type="checkbox"
											checked={selectedPermissions.has(permission.key)}
											disabled={!canEdit}
											onchange={() => togglePermission(permission.key)}
											class="w-4 h-4 rounded border-gray-300 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] disabled:opacity-50"
										/>
										<div class="flex-1">
											<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
												{permission.label}
											</p>
											<p class="text-xs text-gray-500 dark:text-gray-400">
												{permission.key}
											</p>
										</div>
									</label>
								{/each}
							</div>
						</div>
					</div>
				{/each}

				<!-- Summary -->
				<div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
							<span class="text-sm text-gray-600 dark:text-gray-400">
								已選擇 <span class="font-semibold text-gray-900 dark:text-gray-100">{selectedPermissions.size}</span> 項權限
							</span>
						</div>
						{#if hasChanges}
							<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
								未儲存的變更
							</span>
						{/if}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</PageContainer>
