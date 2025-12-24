<script lang="ts">
	import { Input, Select, Button, Card, PasswordInput } from '$lib/components/ui';
	import { roleFormOptions, statusFormOptions, type UserFormData, type UserFormErrors } from '../types';
	import { usersService } from '../services/users.service';

	interface Props {
		form: UserFormData;
		errors: UserFormErrors;
		saving: boolean;
		isEdit?: boolean;
		onSubmit: (event: Event) => void;
		onCancel: () => void;
	}

	let { form = $bindable(), errors, saving, isEdit = false, onSubmit, onCancel }: Props = $props();
</script>

<Card variant="bordered">
	{#snippet header()}
		<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
			{isEdit ? '基本資料' : '使用者資料'}
		</h3>
	{/snippet}
	{#snippet children()}
		<form class="space-y-6" onsubmit={onSubmit}>
			<div class="grid gap-6 sm:grid-cols-2">
				<Input
					bind:value={form.name}
					label="姓名"
					placeholder="請輸入使用者姓名"
					required
					error={errors.name}
					disabled={saving}
				/>
				<Input
					bind:value={form.email}
					type="email"
					label="電子郵件"
					placeholder="user@example.com"
					required
					error={errors.email}
					disabled={saving}
				/>
			</div>

			{#if !isEdit}
				<div class="grid gap-6 sm:grid-cols-2">
					<Input
						bind:value={form.username}
						label="使用者名稱"
						placeholder="請輸入使用者名稱"
						required
						error={errors.username}
						disabled={saving}
					/>
					<Select
						bind:value={form.role}
						options={roleFormOptions}
						label="角色"
						required
						disabled={saving}
					/>
				</div>
			{:else}
				<div class="grid gap-6 sm:grid-cols-2">
					<Select
						bind:value={form.role}
						options={roleFormOptions}
						label="角色"
						required
						disabled={saving}
					/>
					<Select
						bind:value={form.status}
						options={statusFormOptions}
						label="狀態"
						required
						disabled={saving}
					/>
				</div>
			{/if}

			<div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
						{isEdit ? '儲存變更' : '建立使用者'}
					{/snippet}
				</Button>
			</div>
		</form>
	{/snippet}
</Card>
