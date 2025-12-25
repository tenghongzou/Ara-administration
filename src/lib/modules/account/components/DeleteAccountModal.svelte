<script lang="ts">
	import { Modal, Button } from '$lib/components/ui';
	import { toast } from '$lib/stores/toast';

	interface Props {
		open: boolean;
		onClose: () => void;
		onConfirm: () => Promise<void>;
	}

	let { open = $bindable(false), onClose, onConfirm }: Props = $props();

	let confirmText = $state('');
	let loading = $state(false);

	const isValid = $derived(confirmText === 'DELETE');

	function handleClose() {
		confirmText = '';
		onClose();
	}

	async function handleDelete() {
		if (!isValid) {
			toast.error('請輸入 DELETE 確認刪除');
			return;
		}

		loading = true;
		try {
			await onConfirm();
			handleClose();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '操作失敗，請稍後再試');
		} finally {
			loading = false;
		}
	}
</script>

<Modal {open} onClose={handleClose} title="刪除帳號">
	{#snippet children()}
		<div class="space-y-4">
			<div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
				<p class="text-sm text-red-600 dark:text-red-400 font-medium">
					警告：此操作無法復原！
				</p>
				<p class="text-sm text-red-600 dark:text-red-400 mt-1">
					刪除帳號後，您的所有資料將在 30 天後永久刪除，包括：
				</p>
				<ul class="text-sm text-red-600 dark:text-red-400 mt-2 list-disc list-inside">
					<li>個人資料和設定</li>
					<li>所有操作記錄</li>
					<li>系統權限和角色</li>
				</ul>
			</div>

			<div>
				<label
					for="delete-confirm"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
				>
					確認刪除
				</label>
				<input
					id="delete-confirm"
					type="text"
					bind:value={confirmText}
					placeholder="請輸入 DELETE 確認"
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
				/>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					請輸入「DELETE」以確認您要刪除帳號
				</p>
			</div>

			<div class="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onclick={handleClose}>
					{#snippet children()}取消{/snippet}
				</Button>
				<Button variant="danger" {loading} disabled={!isValid} onclick={handleDelete}>
					{#snippet children()}永久刪除帳號{/snippet}
				</Button>
			</div>
		</div>
	{/snippet}
</Modal>
