<script lang="ts">
	import type { AuditLog } from '$lib/services';
	import { Card, Badge, Button, Spinner } from '$lib/components/ui';
	import { logsService } from '../services/logs.service';
	import { FileText } from 'lucide-svelte';

	interface Pagination {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	}

	interface Props {
		logs: AuditLog[];
		loading?: boolean;
		pagination: Pagination;
		onRowClick: (log: AuditLog) => void;
		onPageChange: (page: number) => void;
	}

	let { logs, loading = false, pagination, onRowClick, onPageChange }: Props = $props();
</script>

<Card variant="bordered" role="region" aria-label="稽核日誌列表">
	{#snippet children()}
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<Spinner size="lg" />
			</div>
		{:else if logs.length === 0}
			<div class="py-12 text-center text-gray-500 dark:text-gray-400">
				<FileText class="w-12 h-12 mx-auto mb-3 opacity-50" />
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
								onclick={() => onRowClick(log)}
								onkeydown={(e) => e.key === 'Enter' && onRowClick(log)}
								tabindex="0"
								role="button"
							>
								<td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
									{logsService.formatTimestamp(log.createdAt)}
								</td>
								<td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
									{log.userName || '-'}
								</td>
								<td class="px-4 py-3 text-sm whitespace-nowrap">
									<span
										class="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
									>
										{logsService.getActionLabel(log.action)}
									</span>
								</td>
								<td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
									{logsService.getResourceLabel(log.resource)}
								</td>
								<td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
									{log.description || '-'}
								</td>
								<td
									class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono"
								>
									{log.ipAddress || '-'}
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
							onclick={() => onPageChange(pagination.page - 1)}
						>
							{#snippet children()}上一頁{/snippet}
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={pagination.page >= pagination.totalPages}
							onclick={() => onPageChange(pagination.page + 1)}
						>
							{#snippet children()}下一頁{/snippet}
						</Button>
					</div>
				</div>
			{/if}
		{/if}
	{/snippet}
</Card>
