<script lang="ts">
	import { Input, Select } from '$lib/components/ui';
	import { roleColorOptions } from '$lib/permissions';
	import type { RoleFormData, RoleFormErrors } from '../types';

	interface Props {
		form: RoleFormData;
		errors: RoleFormErrors;
		disabled?: boolean;
		isEdit?: boolean;
		onChange?: () => void;
	}

	let { form = $bindable(), errors, disabled = false, isEdit = false, onChange }: Props = $props();

	const colorOptions = roleColorOptions.map((c) => ({
		value: c.value,
		label: c.label
	}));

	function handleChange() {
		onChange?.();
	}
</script>

<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
	<div class="flex items-center gap-3 mb-6">
		<div class="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center">
			<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				{#if isEdit}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				{/if}
			</svg>
		</div>
		<div>
			<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
				基本資訊
			</h2>
			<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
				{isEdit ? '修改角色的基本資訊' : '設定角色的基本資訊'}
			</p>
		</div>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		{#if !isEdit}
			<div>
				<label for="role-key" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					角色識別碼 <span class="text-red-500">*</span>
				</label>
				<Input
					id="role-key"
					bind:value={form.key}
					placeholder="例如: team_leader"
					oninput={handleChange}
					error={errors.key}
					{disabled}
				/>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					唯一識別碼，建立後無法修改
				</p>
			</div>
		{:else}
			<div>
				<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					角色識別碼
				</span>
				<p class="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
					<code class="text-sm text-gray-700 dark:text-gray-300">{form.key}</code>
				</p>
			</div>
		{/if}
		<div>
			<label for="role-label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				角色名稱 <span class="text-red-500">*</span>
			</label>
			<Input
				id="role-label"
				bind:value={form.label}
				placeholder="例如: 團隊主管"
				onchange={handleChange}
				error={errors.label}
				{disabled}
			/>
		</div>
		<div>
			<label for="role-color" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				顏色標籤
			</label>
			<Select
				id="role-color"
				bind:value={form.color}
				options={colorOptions}
				onchange={handleChange}
				{disabled}
			/>
		</div>
		<div>
			<label for="role-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				角色描述
			</label>
			<Input
				id="role-description"
				bind:value={form.description}
				placeholder="輸入角色描述"
				onchange={handleChange}
				{disabled}
			/>
		</div>
	</div>
</div>
