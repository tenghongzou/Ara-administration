<script lang="ts">
	import type { User } from '$lib/types';
	import { Pagination } from '$lib/components/data-display';
	import UserFiltersPanel from './UserFiltersPanel.svelte';
	import UsersDataGrid from './UsersDataGrid.svelte';

	interface Props {
		users: User[];
		loading?: boolean;
		search: string;
		roleFilter: string;
		statusFilter: string;
		selectedRows?: User[];
		sortColumn?: string;
		sortDirection?: 'asc' | 'desc';
		page: number;
		pageSize: number;
		total: number;
		onSearch: () => void;
		onSelectionChange?: (rows: User[]) => void;
		onSort?: (column: string, direction: 'asc' | 'desc') => void;
		onRefresh?: () => void;
		onDelete?: (user: User) => void;
		onPageChange: (page: number) => void;
		onPageSizeChange: (pageSize: number) => void;
	}

	let {
		users,
		loading = false,
		search = $bindable(),
		roleFilter = $bindable(),
		statusFilter = $bindable(),
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

<div class="space-y-4" data-testid="users-page">
	<UserFiltersPanel bind:search bind:roleFilter bind:statusFilter {onSearch} />

	<UsersDataGrid
		{users}
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
		<div
			class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
		>
			<Pagination {page} {pageSize} {total} {onPageChange} {onPageSizeChange} />
		</div>
	{/if}
</div>
