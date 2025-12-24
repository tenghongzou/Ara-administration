<script lang="ts">
	import { config } from '$lib/constants';
	import { Card, Badge, Button, Spinner } from '$lib/components/ui';
	import { PageContainer } from '$lib/components/layout';
	import { logsApi, type AuditLog } from '$lib/services';
	import { toast } from '$lib/stores/toast';
	import {
		logsService,
		LogFiltersPanel,
		LogStatsPanel,
		LogDetailModal,
		LogExportDialog,
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
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => (showStats = !showStats)}>
				{#snippet children()}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
					{showStats ? '隱藏統計' : '顯示統計'}
				{/snippet}
			</Button>
			<Button variant="outline" onclick={() => (showExportDialog = true)} disabled={logs.length === 0}>
				{#snippet children()}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
						/>
					</svg>
					匯出日誌
				{/snippet}
			</Button>
		</div>
	{/snippet}

	<div class="space-y-6">
		<!-- 統計區 -->
		{#if showStats}
			<LogStatsPanel {stats} />
		{/if}

		<!-- 篩選器 -->
		<LogFiltersPanel {filters} onFilterChange={handleFilterChange} />

		<!-- 日誌列表 -->
		<Card variant="bordered" role="region" aria-label="稽核日誌列表">
			{#snippet children()}
				{#if loading}
					<div class="flex items-center justify-center py-12">
						<Spinner size="lg" />
					</div>
				{:else if logs.length === 0}
					<div class="py-12 text-center text-gray-500 dark:text-gray-400">
						<svg
							class="w-12 h-12 mx-auto mb-3 opacity-50"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<p>沒有找到符合條件的日誌</p>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-gray-50 dark:bg-gray-800">
								<tr>
									<th
										class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
									>
										時間
									</th>
									<th
										class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
									>
										使用者
									</th>
									<th
										class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
									>
										操作
									</th>
									<th
										class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
									>
										資源
									</th>
									<th
										class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
									>
										詳情
									</th>
									<th
										class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
									>
										IP 位址
									</th>
									<th
										class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
									>
										狀態
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
								{#each logs as log}
									{@const statusBadge = logsService.getStatusBadge(log.status)}
									<tr
										class="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
										onclick={() => handleRowClick(log)}
										onkeydown={(e) => e.key === 'Enter' && handleRowClick(log)}
										tabindex="0"
										role="button"
									>
										<td
											class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap"
										>
											{logsService.formatTimestamp(log.timestamp)}
										</td>
										<td
											class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
										>
											{log.userName}
										</td>
										<td class="px-4 py-3 text-sm whitespace-nowrap">
											<span
												class="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
											>
												{logsService.getActionLabel(log.action)}
											</span>
										</td>
										<td
											class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap"
										>
											{logsService.getResourceLabel(log.resource)}
										</td>
										<td
											class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate"
										>
											{log.details || '-'}
										</td>
										<td
											class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono"
										>
											{log.ip}
										</td>
										<td class="px-4 py-3 whitespace-nowrap">
											<Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Pagination -->
					{#if pagination.totalPages > 1}
						<div
							class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700"
						>
							<div class="text-sm text-gray-500 dark:text-gray-400">
								顯示 {(pagination.page - 1) * pagination.pageSize + 1} - {Math.min(
									pagination.page * pagination.pageSize,
									pagination.total
								)} 筆，共 {pagination.total} 筆
							</div>
							<div class="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={pagination.page <= 1}
									onclick={() => loadLogs(pagination.page - 1)}
								>
									{#snippet children()}上一頁{/snippet}
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={pagination.page >= pagination.totalPages}
									onclick={() => loadLogs(pagination.page + 1)}
								>
									{#snippet children()}下一頁{/snippet}
								</Button>
							</div>
						</div>
					{/if}
				{/if}
			{/snippet}
		</Card>
	</div>
</PageContainer>

<!-- Detail Modal -->
<LogDetailModal log={selectedLog} bind:open={showDetailModal} />

<!-- Export Dialog -->
<LogExportDialog logs={allLogs} bind:open={showExportDialog} />
