<script lang="ts">
	import { config } from '$lib/constants';
	import { PageContainer } from '$lib/components/layout';
	import { logsApi, type AuditLog } from '$lib/services';
	import { toast } from '$lib/stores/toast';
	import {
		logsService,
		LogsContent,
		LogDetailModal,
		LogExportDialog,
		LogActionButtons,
		type LogFilters,
		type LogStats
	} from '$lib/modules/logs';

	let loading = $state(true);
	let logs = $state<AuditLog[]>([]);
	let allLogs = $state<AuditLog[]>([]);
	let pagination = $state({ page: 1, pageSize: 10, total: 0, totalPages: 0 });

	// 篩選器狀態
	let filters = $state<LogFilters>({
		action: '',
		resource: '',
		status: '',
		search: ''
	});

	// Modal 狀態
	let selectedLog = $state<AuditLog | null>(null);
	let showDetailModal = $state(false);
	let showExportDialog = $state(false);
	let showStats = $state(false);

	// 統計資料
	const stats: LogStats = $derived(logsService.calculateStats(allLogs));

	async function loadLogs(page = 1) {
		loading = true;
		try {
			const result = await logsApi.getLogs({
				page,
				pageSize: 10,
				action: filters.action || undefined,
				resource: filters.resource || undefined,
				status: (filters.status as 'success' | 'failure') || undefined,
				startDate: filters.dateRange?.start,
				endDate: filters.dateRange?.end
			});
			logs = result.data;
			pagination = result.pagination;

			// 載入所有資料用於統計（簡化版：使用大 pageSize）
			const allResult = await logsApi.getLogs({ pageSize: 1000 });
			allLogs = allResult.data;
		} catch (error) {
			console.error('Failed to load logs:', error);
			toast.error('載入日誌失敗');
		} finally {
			loading = false;
		}
	}

	function handleFilterChange(newFilters: LogFilters) {
		filters = newFilters;
		loadLogs(1);
	}

	function handleRowClick(log: AuditLog) {
		selectedLog = log;
		showDetailModal = true;
	}

	// Initial load
	$effect(() => {
		loadLogs();
	});
</script>

<svelte:head>
	<title>稽核日誌 - {config.appName}</title>
</svelte:head>

<PageContainer
	title="稽核日誌"
	description="檢視系統操作記錄與安全事件"
	backLink="/settings"
	backLabel="返回設定"
>
	{#snippet actions()}
		<LogActionButtons
			{showStats}
			exportDisabled={logs.length === 0}
			onToggleStats={() => (showStats = !showStats)}
			onExport={() => (showExportDialog = true)}
		/>
	{/snippet}

	<LogsContent
		{logs}
		{loading}
		{showStats}
		{stats}
		{filters}
		{pagination}
		onFilterChange={handleFilterChange}
		onRowClick={handleRowClick}
		onPageChange={loadLogs}
	/>
</PageContainer>

<!-- Detail Modal -->
<LogDetailModal log={selectedLog} bind:open={showDetailModal} />

<!-- Export Dialog -->
<LogExportDialog logs={allLogs} bind:open={showExportDialog} />
