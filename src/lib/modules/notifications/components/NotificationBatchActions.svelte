<script lang="ts">
	import { Button } from '$lib/components/ui';
	import type { BatchActionType } from '../types';

	interface Props {
		selectedCount: number;
		onAction: (type: BatchActionType) => void;
		onSelectAll: () => void;
		onDeselectAll: () => void;
	}

	let { selectedCount, onAction, onSelectAll, onDeselectAll }: Props = $props();
</script>

{#if selectedCount > 0}
	<div class="flex items-center justify-between p-4 bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 rounded-lg border border-[var(--color-primary-200)] dark:border-[var(--color-primary-800)]">
		<div class="flex items-center gap-4">
			<span class="text-sm font-medium text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)]">
				已選擇 {selectedCount} 項
			</span>
			<button
				type="button"
				class="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]"
				onclick={onDeselectAll}
			>
				取消選擇
			</button>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => onAction('markRead')}>
				{#snippet children()}標為已讀{/snippet}
			</Button>
			<Button variant="ghost" size="sm" class="text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onclick={() => onAction('delete')}>
				{#snippet children()}刪除{/snippet}
			</Button>
		</div>
	</div>
{:else}
	<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
		<span class="text-sm text-gray-500 dark:text-gray-400">
			勾選通知以進行批量操作
		</span>
		<button
			type="button"
			class="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]"
			onclick={onSelectAll}
		>
			全選
		</button>
	</div>
{/if}
