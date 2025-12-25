<script lang="ts">
	import { ConfirmModal } from '$lib/components/ui';
	import type { Subscription } from '$lib/types';

	interface Props {
		// Single delete
		showDeleteModal: boolean;
		subscriptionToDelete: Subscription | null;
		deleting: boolean;
		onDeleteConfirm: () => void;
		onDeleteCancel: () => void;
		// Batch delete
		showBatchDeleteModal: boolean;
		selectedCount: number;
		batchDeleting: boolean;
		onBatchDeleteConfirm: () => void;
		onBatchDeleteCancel: () => void;
	}

	let {
		showDeleteModal = $bindable(false),
		subscriptionToDelete,
		deleting,
		onDeleteConfirm,
		onDeleteCancel,
		showBatchDeleteModal = $bindable(false),
		selectedCount,
		batchDeleting,
		onBatchDeleteConfirm,
		onBatchDeleteCancel
	}: Props = $props();
</script>

<!-- Delete Single Subscription Modal -->
<ConfirmModal
	bind:open={showDeleteModal}
	title="確認刪除"
	confirmText="刪除"
	variant="danger"
	loading={deleting}
	onConfirm={onDeleteConfirm}
	onCancel={onDeleteCancel}
>
	{#snippet children()}
		<p class="text-gray-600 dark:text-gray-400">
			確定要刪除訂閱「<span class="font-medium text-gray-900 dark:text-gray-100"
				>{subscriptionToDelete?.name}</span
			>」嗎？此操作無法復原。
		</p>
	{/snippet}
</ConfirmModal>

<!-- Batch Delete Modal -->
<ConfirmModal
	bind:open={showBatchDeleteModal}
	title="確認批次刪除"
	confirmText="刪除全部"
	variant="danger"
	loading={batchDeleting}
	onConfirm={onBatchDeleteConfirm}
	onCancel={onBatchDeleteCancel}
>
	{#snippet children()}
		<p class="text-gray-600 dark:text-gray-400">
			確定要刪除選中的
			<span class="font-medium text-gray-900 dark:text-gray-100">{selectedCount}</span>
			筆訂閱嗎？此操作無法復原。
		</p>
	{/snippet}
</ConfirmModal>
