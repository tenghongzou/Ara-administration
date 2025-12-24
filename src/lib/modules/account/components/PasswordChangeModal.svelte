<script lang="ts">
	import { Modal, Button, PasswordInput } from '$lib/components/ui';
	import { passwordService } from '../services/password.service';
	import type { PasswordChangeFormData } from '../types';

	interface Props {
		open: boolean;
		onClose: () => void;
		onSubmit: (form: PasswordChangeFormData) => Promise<void>;
	}

	let { open = $bindable(false), onClose, onSubmit }: Props = $props();

	let form = $state<PasswordChangeFormData>({
		current: '',
		new: '',
		confirm: ''
	});
	let error = $state('');
	let loading = $state(false);

	const validation = $derived(passwordService.validatePassword(form.new));

	function resetForm() {
		form = { current: '', new: '', confirm: '' };
		error = '';
	}

	function handleClose() {
		resetForm();
		onClose();
	}

	async function handleSubmit() {
		error = '';

		const validationError = passwordService.validateChangeForm(form);
		if (validationError) {
			error = validationError;
			return;
		}

		loading = true;
		try {
			await onSubmit(form);
			handleClose();
		} catch (e) {
			error = e instanceof Error ? e.message : '密碼變更失敗';
		} finally {
			loading = false;
		}
	}
</script>

<Modal {open} onClose={handleClose} title="變更密碼">
	{#snippet children()}
		<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			{#if error}
				<div
					class="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg"
					role="alert"
				>
					{error}
				</div>
			{/if}

			<PasswordInput
				label="目前密碼"
				placeholder="請輸入目前密碼"
				bind:value={form.current}
				autocomplete="current-password"
				required
			/>

			<PasswordInput
				label="新密碼"
				placeholder="請輸入新密碼"
				showStrength
				bind:value={form.new}
				autocomplete="new-password"
				required
			/>

			<PasswordInput
				label="確認新密碼"
				placeholder="請再次輸入新密碼"
				bind:value={form.confirm}
				autocomplete="new-password"
				required
			/>

			<div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
				<p class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">密碼要求：</p>
				<ul class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
					<li class="flex items-center gap-1.5">
						<span class={validation.hasLength ? 'text-green-500' : ''}>
							{validation.hasLength ? '✓' : '○'}
						</span>
						至少 8 個字元
					</li>
					<li class="flex items-center gap-1.5">
						<span class={validation.hasLower ? 'text-green-500' : ''}>
							{validation.hasLower ? '✓' : '○'}
						</span>
						包含小寫字母
					</li>
					<li class="flex items-center gap-1.5">
						<span class={validation.hasUpper ? 'text-green-500' : ''}>
							{validation.hasUpper ? '✓' : '○'}
						</span>
						包含大寫字母
					</li>
					<li class="flex items-center gap-1.5">
						<span class={validation.hasDigit ? 'text-green-500' : ''}>
							{validation.hasDigit ? '✓' : '○'}
						</span>
						包含數字
					</li>
				</ul>
			</div>

			<div class="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onclick={handleClose}>
					{#snippet children()}取消{/snippet}
				</Button>
				<Button type="submit" {loading}>
					{#snippet children()}確認變更{/snippet}
				</Button>
			</div>
		</form>
	{/snippet}
</Modal>
