<script lang="ts">
	import type { Subscription, SubscriptionStats } from '$lib/types';
	import { Pagination } from '$lib/components/data-display';
	import StatsCards from './StatsCards.svelte';
	import SubscriptionFiltersPanel from './SubscriptionFiltersPanel.svelte';
	import SubscriptionDataGrid from './SubscriptionDataGrid.svelte';
	import type { SubscriptionFilters } from '../types';

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
		onPageSizeChange
	}: Props = $props();
</script>

<div class="space-y-4" data-testid="subscriptions-page">
	{#if stats}
		<StatsCards {stats} />
	{/if}

	<SubscriptionFiltersPanel bind:filters {onSearch} />

	<SubscriptionDataGrid
		{subscriptions}
		{loading}
		{selectedRows}
		{sortColumn}
		{sortDirection}
		{onSelectionChange}
		{onSort}
		{onRefresh}
		{onDelete}
	/>

	{#if total > 0}
		<div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
			<Pagination
				{page}
				{pageSize}
				{total}
				{onPageChange}
				{onPageSizeChange}
			/>
		</div>
	{/if}
</div>
