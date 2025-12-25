<script lang="ts">
	import { Modal, Button, PasswordInput } from '$lib/components/ui';
	import { twoFactorService } from '../services/two-factor.service';
	import { toast } from '$lib/stores/toast';

	interface Props {
		open: boolean;
		userId: string;
		onClose: () => void;
		onComplete: () => void;
	}

	let { open = $bindable(false), userId, onClose, onComplete }: Props = $props();

	let password = $state('');
	let loading = $state(false);

	function handleClose() {
		password = '';
		onClose();
	}

	async function handleDisable() {
		if (!password) {
			toast.error('請輸入密碼');
			return;
		}

		loading = true;
		try {
			await twoFactorService.disable(userId, password);
			toast.success('兩步驟驗證已停用');
			onComplete();
			handleClose();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '停用失敗');
		} finally {
			loading = false;
		}
	}
</script>

<Modal {open} onClose={handleClose} title="停用兩步驟驗證">
	{#snippet children()}
		<div class="space-y-4">
			<div
				class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
			>
				<p class="text-sm text-yellow-700 dark:text-yellow-300">
					停用兩步驟驗證將降低您帳號的安全性。請確認您要執行此操作。
				</p>
			</div>

			<PasswordInput
				label="確認密碼"
				placeholder="請輸入密碼以確認"
				bind:value={password}
				autocomplete="current-password"
				required
			/>

			<div class="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onclick={handleClose}>
					{#snippet children()}取消{/snippet}
				</Button>
				<Button variant="danger" {loading} onclick={handleDisable}>
					{#snippet children()}停用{/snippet}
				</Button>
			</div>
		</div>
	{/snippet}
</Modal>
