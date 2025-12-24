<script lang="ts">
	import { goto } from '$app/navigation';
	import { config } from '$lib/constants';
	import { rolesApi } from '$lib/services';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Button, Input, Select } from '$lib/components/ui';
	import { permissionGroups, roleColorOptions, type Permission } from '$lib/permissions';

	let saving = $state(false);

	// 表單欄位
	let formKey = $state('');
	let formLabel = $state('');
	let formDescription = $state('');
	let formColor = $state('gray');
	let selectedPermissions = $state<Set<string>>(new Set());

	// 驗證
	let keyError = $state('');

	const colorOptions = roleColorOptions.map((c) => ({
		value: c.value,
		label: c.label
	}));

	function validateKey(value: string): string {
		if (!value) return '請輸入角色識別碼';
		if (!/^[a-z][a-z0-9_-]*$/.test(value)) {
			return '識別碼只能包含小寫英文、數字、底線和連字號，且必須以英文開頭';
		}
		if (value.length < 2) return '識別碼至少需要 2 個字元';
		if (value.length > 32) return '識別碼最多 32 個字元';
		return '';
	}

	function handleKeyChange() {
		keyError = validateKey(formKey);
	}

	function togglePermission(permission: string) {
		const newSet = new Set(selectedPermissions);
		if (newSet.has(permission)) {
			newSet.delete(permission);
		} else {
			newSet.add(permission);
		}
		selectedPermissions = newSet;
	}

	function toggleGroupPermissions(groupKey: string) {
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
	}

	function isGroupFullySelected(groupKey: string): boolean {
		const group = permissionGroups.find((g) => g.key === groupKey);
		if (!group) return false;
		return group.permissions.every((p) => selectedPermissions.has(p.key));
	}

	async function handleSave() {
		// 驗證
		keyError = validateKey(formKey);
		if (keyError) return;

		if (!formLabel.trim()) {
			toast.error('請輸入角色名稱');
			return;
		}

		saving = true;
		try {
			const newRole = await rolesApi.createRole({
				key: formKey,
				label: formLabel,
				description: formDescription,
				color: formColor,
				permissions: Array.from(selectedPermissions)
			});
			toast.success('角色已建立');
			goto(`/settings/roles/${newRole.id}`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '建立角色失敗');
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>新增角色 - {config.appName}</title>
</svelte:head>

<PageContainer
	title="新增角色"
	description="建立新的系統角色並設定權限"
	backLink="/settings/roles"
	backLabel="返回角色列表"
>
	{#snippet actions()}
		<Button loading={saving} onclick={handleSave}>
			{#snippet children()}
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
				建立角色
			{/snippet}
		</Button>
	{/snippet}

	<div class="space-y-6" data-testid="role-new-page">
		<!-- Role Basic Info -->
		<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
				</div>
				<div>
					<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
						基本資訊
					</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
						設定角色的基本資訊
					</p>
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="role-key" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						角色識別碼 <span class="text-red-500">*</span>
					</label>
					<Input
						id="role-key"
						bind:value={formKey}
						placeholder="例如: team_leader"
						oninput={handleKeyChange}
						error={keyError}
					/>
					<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
						唯一識別碼，建立後無法修改
					</p>
				</div>
				<div>
					<label for="role-label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						角色名稱 <span class="text-red-500">*</span>
					</label>
					<Input
						id="role-label"
						bind:value={formLabel}
						placeholder="例如: 團隊主管"
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
					/>
				</div>
				<div>
					<label for="role-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						角色描述
					</label>
					<Input
						id="role-description"
						bind:value={formDescription}
						placeholder="輸入角色描述"
					/>
				</div>
			</div>
		</div>

		<!-- Permission Groups -->
		{#each permissionGroups as group}
			<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
						{group.label}
					</h3>
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
				</div>
				<div class="p-6">
					<div class="grid gap-3 sm:grid-cols-2">
						{#each group.permissions as permission}
							<label
								class="flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer
								{selectedPermissions.has(permission.key)
									? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20'
									: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
							>
								<input
									type="checkbox"
									checked={selectedPermissions.has(permission.key)}
									onchange={() => togglePermission(permission.key)}
									class="w-4 h-4 rounded border-gray-300 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
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
			</div>
		</div>
	</div>
</PageContainer>
