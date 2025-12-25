<script lang="ts">
	import type { AuditLog } from '$lib/services';
	import type { LogFilters, LogStats } from '../types';
	import LogStatsPanel from './LogStats.svelte';
	import LogFiltersPanel from './LogFilters.svelte';
	import LogTable from './LogTable.svelte';

	interface Pagination {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	}

	interface Props {
		logs: AuditLog[];
		loading?: boolean;
		showStats?: boolean;
		stats: LogStats;
		filters: LogFilters;
		pagination: Pagination;
		onFilterChange: (filters: LogFilters) => void;
		onRowClick: (log: AuditLog) => void;
		onPageChange: (page: number) => void;
	}

	let {
		logs,
		loading = false,
		showStats = false,
		stats,
		filters,
		pagination,
		onFilterChange,
		onRowClick,
		onPageChange
	}: Props = $props();
</script>

<div class="space-y-6">
	<!-- 統計區 -->
	{#if showStats}
		<LogStatsPanel {stats} />
	{/if}

	<!-- 篩選器 -->
	<LogFiltersPanel {filters} onFilterChange={onFilterChange} />

	<!-- 日誌列表 -->
	<LogTable {logs} {loading} {pagination} onRowClick={onRowClick} onPageChange={onPageChange} />
</div>
