<script lang="ts">
	import type { Notification } from '$lib/stores';
	import type { NotificationFilters, BatchActionType } from '../types';
	import NotificationHeader from './NotificationHeader.svelte';
	import NotificationFiltersPanel from './NotificationFilters.svelte';
	import NotificationBatchActions from './NotificationBatchActions.svelte';
	import NotificationList from './NotificationList.svelte';

	interface Props {
		items: Notification[];
		filteredItems: Notification[];
		filters: NotificationFilters;
		unreadCount: number;
		selectedIds: Set<string>;
		categoryCounts: Record<string, number>;
		onFilterChange: (filters: NotificationFilters) => void;
		onMarkRead: (id: string) => void;
		onDelete: (id: string) => void;
		onSelect: (id: string, selected: boolean) => void;
		onSelectAll: () => void;
		onDeselectAll: () => void;
		onBatchAction: (type: BatchActionType) => void;
		onMarkAllRead: () => void;
		onClearAll: () => void;
	}

	let {
		items,
		filteredItems,
		filters,
		unreadCount,
		selectedIds,
		categoryCounts,
		onFilterChange,
		onMarkRead,
		onDelete,
		onSelect,
		onSelectAll,
		onDeselectAll,
		onBatchAction,
		onMarkAllRead,
		onClearAll
	}: Props = $props();

	const selectedCount = $derived(selectedIds.size);
</script>

<NotificationHeader
	{unreadCount}
	totalCount={items.length}
	onMarkAllRead={onMarkAllRead}
	onClearAll={onClearAll}
/>

<div class="mt-6 space-y-4">
	<NotificationFiltersPanel
		{filters}
		totalCount={items.length}
		{unreadCount}
		{categoryCounts}
		onFilterChange={onFilterChange}
	/>

	<NotificationBatchActions
		{selectedCount}
		onAction={onBatchAction}
		onSelectAll={onSelectAll}
		onDeselectAll={onDeselectAll}
	/>

	<NotificationList
		items={filteredItems}
		{filters}
		{selectedIds}
		onMarkRead={onMarkRead}
		onDelete={onDelete}
		onSelect={onSelect}
	/>
</div>
