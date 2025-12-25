<script lang="ts">
	import type { User } from '$lib/types';
	import { ConfirmModal } from '$lib/components/ui';

	interface Props {
		showDeleteModal?: boolean;
		userToDelete: User | null;
		deleting?: boolean;
		onDeleteConfirm: () => void;
		onDeleteCancel: () => void;
		showBatchDeleteModal?: boolean;
		selectedCount: number;
		batchDeleting?: boolean;
		onBatchDeleteConfirm: () => void;
		onBatchDeleteCancel: () => void;
	}

	let {
		showDeleteModal = $bindable(false),
		userToDelete,
		deleting = false,
		onDeleteConfirm,
		onDeleteCancel,
		showBatchDeleteModal = $bindable(false),
		selectedCount,
		batchDeleting = false,
		onBatchDeleteConfirm,
		onBatchDeleteCancel
	}: Props = $props();
</script>

<ConfirmModal
	bind:open={showDeleteModal}
	title="確認刪除"
	confirmText="刪除"
	variant="danger"
	loading={deleting}
	onConfirm={onDeleteConfirm}
>
	{#snippet children()}
		<p class="text-gray-600 dark:text-gray-400">
			確定要刪除使用者「<span class="font-medium text-gray-900 dark:text-gray-100"
				>{userToDelete?.name}</span
			>」嗎？此操作無法復原。
		</p>
	{/snippet}
</ConfirmModal>

<ConfirmModal
	bind:open={showBatchDeleteModal}
	title="確認批次刪除"
	confirmText="刪除全部"
	variant="danger"
	loading={batchDeleting}
	onConfirm={onBatchDeleteConfirm}
>
	{#snippet children()}
		<p class="text-gray-600 dark:text-gray-400">
			確定要刪除選中的
			<span class="font-medium text-gray-900 dark:text-gray-100">{selectedCount}</span>
			位使用者嗎？此操作無法復原。
		</p>
	{/snippet}
</ConfirmModal>
