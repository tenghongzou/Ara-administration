<script lang="ts">
	import type { Notification } from '$lib/stores/notifications';
	import type { NotificationFilters } from '../types';
	import NotificationItem from './NotificationItem.svelte';
	import NotificationEmptyState from './NotificationEmptyState.svelte';

	interface Props {
		items: Notification[];
		filters: NotificationFilters;
		selectedIds: Set<string>;
		selectable?: boolean;
		onMarkRead: (id: string) => void;
		onDelete: (id: string) => void;
		onSelect: (id: string, selected: boolean) => void;
	}

	let {
		items,
		filters,
		selectedIds,
		selectable = true,
		onMarkRead,
		onDelete,
		onSelect
	}: Props = $props();
</script>

{#if items.length === 0}
	<NotificationEmptyState {filters} />
{:else}
	<div class="space-y-3" role="list" aria-label="通知列表">
		{#each items as item (item.id)}
			<NotificationItem
				notification={item}
				selected={selectedIds.has(item.id)}
				{selectable}
				{onMarkRead}
				{onDelete}
				{onSelect}
			/>
		{/each}
	</div>
{/if}
