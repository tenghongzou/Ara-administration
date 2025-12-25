<script lang="ts">
	import type { Role } from '$lib/types';
	import { Spinner } from '$lib/components/ui';
	import { permissionGroups } from '$lib/permissions';
	import RoleForm from './RoleForm.svelte';
	import PermissionSelector from './PermissionSelector.svelte';
	import type { RoleFormData, RoleFormErrors } from '../types';

	interface Props {
		role: Role | null;
		loading?: boolean;
		canEdit?: boolean;
		isAdminRole?: boolean;
		formData: RoleFormData;
		formErrors: RoleFormErrors;
		selectedPermissions: Set<string>;
		hasChanges?: boolean;
		disabled?: boolean;
		onFormChange: () => void;
		onPermissionsChange: (permissions: Set<string>) => void;
	}

	let {
		role,
		loading = false,
		canEdit = false,
		isAdminRole = false,
		formData = $bindable(),
		formErrors,
		selectedPermissions,
		hasChanges = false,
		disabled = false,
		onFormChange,
		onPermissionsChange
	}: Props = $props();
</script>

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
			<div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
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
			<RoleForm
				bind:form={formData}
				errors={formErrors}
				disabled={disabled || !canEdit}
				isEdit={true}
				onChange={onFormChange}
			/>
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
		<PermissionSelector
			{selectedPermissions}
			disabled={disabled || !canEdit}
			onChange={onPermissionsChange}
		/>

		{#if hasChanges}
			<div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700 p-3">
				<span class="text-sm text-amber-700 dark:text-amber-400">
					有未儲存的變更
				</span>
			</div>
		{/if}
	{/if}
{/if}
