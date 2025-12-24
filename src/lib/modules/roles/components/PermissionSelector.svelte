<script lang="ts">
	import { permissionGroups } from '$lib/permissions';
	import { rolesService } from '../services/roles.service';

	interface Props {
		selectedPermissions: Set<string>;
		disabled?: boolean;
		onChange: (permissions: Set<string>) => void;
	}

	let { selectedPermissions, disabled = false, onChange }: Props = $props();

	function togglePermission(permission: string) {
		if (disabled) return;
		const newPermissions = rolesService.togglePermission(selectedPermissions, permission);
		onChange(newPermissions);
	}

	function toggleGroupPermissions(groupKey: string) {
		if (disabled) return;
		const group = permissionGroups.find((g) => g.key === groupKey);
		if (!group) return;

		const groupPermissionKeys = group.permissions.map((p) => p.key);
		const isFullySelected = rolesService.isGroupFullySelected(selectedPermissions, groupPermissionKeys);
		const newPermissions = rolesService.toggleGroupPermissions(
			selectedPermissions,
			groupPermissionKeys,
			isFullySelected
		);
		onChange(newPermissions);
	}

	function isGroupFullySelected(groupKey: string): boolean {
		const group = permissionGroups.find((g) => g.key === groupKey);
		if (!group) return false;
		return rolesService.isGroupFullySelected(
			selectedPermissions,
			group.permissions.map((p) => p.key)
		);
	}
</script>

<div class="space-y-6">
	{#each permissionGroups as group}
		<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
			<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
					{group.label}
				</h3>
				{#if !disabled}
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
							class="flex items-center gap-3 p-3 rounded-lg border transition-colors
							{selectedPermissions.has(permission.key)
								? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20'
								: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
							{disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}"
						>
							<input
								type="checkbox"
								checked={selectedPermissions.has(permission.key)}
								{disabled}
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
