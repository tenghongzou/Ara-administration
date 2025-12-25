<script lang="ts">
	import type { Subscription, SubscriptionStats } from '$lib/types';
	import type { SubscriptionFilters } from '../types';
	import SubscriptionActions from './SubscriptionActions.svelte';
	import SubscriptionListView from './SubscriptionListView.svelte';

	interface Props {
		subscriptions: Subscription[];
		stats: SubscriptionStats | null;
		loading?: boolean;
		filters: SubscriptionFilters;
		selectedRows?: Subscription[];
		sortColumn?: string;
		sortDirection?: 'asc' | 'desc';
		page: number;
		pageSize: number;
		total: number;
		onSearch: () => void;
		onSelectionChange?: (rows: Subscription[]) => void;
		onSort?: (column: string, direction: 'asc' | 'desc') => void;
		onRefresh?: () => void;
		onDelete?: (subscription: Subscription) => void;
		onPageChange: (page: number) => void;
		onPageSizeChange: (pageSize: number) => void;
		onBatchDelete: () => void;
		onExport: () => void;
	}

	let {
		subscriptions,
		stats,
		loading = false,
		filters = $bindable(),
		selectedRows = [],
		sortColumn = '',
		sortDirection = 'asc',
		page,
		pageSize,
		total,
		onSearch,
		onSelectionChange,
		onSort,
		onRefresh,
		onDelete,
		onPageChange,
		onPageSizeChange,
		onBatchDelete,
		onExport
	}: Props = $props();

	const selectedCount = $derived(selectedRows.length);
</script>

<div class="space-y-4">
	<div class="flex justify-end">
		<SubscriptionActions
			{selectedCount}
			onBatchDelete={onBatchDelete}
			onExport={onExport}
		/>
	</div>

	<SubscriptionListView
		{subscriptions}
		{stats}
		{loading}
		bind:filters
		{selectedRows}
		{sortColumn}
		{sortDirection}
		{page}
		{pageSize}
		{total}
		{onSearch}
		{onSelectionChange}
		{onSort}
		{onRefresh}
		{onDelete}
		{onPageChange}
		{onPageSizeChange}
	/>
</div>
