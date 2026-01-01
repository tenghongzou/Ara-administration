<script lang="ts">
	import { Modal, Badge, Button } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import type { AuditLog } from '$lib/types';
	import { logsService } from '../services/logs.service';

	interface Props {
		log: AuditLog | null;
		open: boolean;
		onClose?: () => void;
	}

	let { log, open = $bindable(false), onClose }: Props = $props();

	const statusBadge = $derived(log ? logsService.getStatusBadge(log.status) : null);
	const formattedTime = $derived(log ? logsService.formatFullTimestamp(log.createdAt) : '');
	const relativeTime = $derived(log ? logsService.formatRelativeTime(log.createdAt) : '');
	const userAgent = $derived(log ? logsService.parseUserAgent(log.userAgent ?? '') : null);
</script>

<Modal bind:open title="日誌詳情" size="lg" {onClose}>
	{#snippet children()}
		{#if log && statusBadge}
			<div class="space-y-6">
				<!-- 狀態區 -->
				<div class="flex items-center justify-between">
					<Badge variant={statusBadge.variant} class="text-base px-3 py-1">
						{statusBadge.label}
					</Badge>
					<span class="text-sm text-gray-500 dark:text-gray-400">{relativeTime}</span>
				</div>

				<!-- 操作摘要 -->
				<div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
					<div class="flex items-center gap-3 mb-2">
						<span class="text-2xl">{logsService.getActionIcon(log.action)}</span>
						<div>
							<h3 class="font-semibold text-gray-900 dark:text-gray-100">
								{logsService.getActionLabel(log.action)}
							</h3>
							<p class="text-sm text-gray-500 dark:text-gray-400">
								{logsService.getResourceLabel(log.resource)}
								{#if log.resourceId}
									<span class="font-mono">#{log.resourceId}</span>
								{/if}
							</p>
						</div>
					</div>
					{#if log.description}
						<p class="text-gray-700 dark:text-gray-300 mt-2">{log.description}</p>
					{/if}
				</div>

				<!-- 詳細資訊 -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-4">
						<div>
							<span class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
								使用者
							</span>
							<p class="text-gray-900 dark:text-gray-100 font-medium">{log.userName}</p>
							<p class="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {log.userId}</p>
						</div>

						<div>
							<span class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
								時間
							</span>
							<p class="text-gray-900 dark:text-gray-100">{formattedTime}</p>
						</div>
					</div>

					<div class="space-y-4">
						<div>
							<span class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
								IP 位址
							</span>
							<p class="text-gray-900 dark:text-gray-100 font-mono">{log.ipAddress ?? '-'}</p>
						</div>

						{#if userAgent}
							<div>
								<span class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
									瀏覽器資訊
								</span>
								<p class="text-gray-900 dark:text-gray-100">
									{userAgent.browser} / {userAgent.os}
								</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- User Agent 完整資訊 -->
				<div>
					<span class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
						完整 User Agent
					</span>
					<p
						class="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1 break-all"
					>
						{log.userAgent}
					</p>
				</div>
			</div>
		{:else}
			<p class="text-center text-gray-500 dark:text-gray-400 py-8">找不到日誌資料</p>
		{/if}
	{/snippet}

	{#snippet footer()}
		<Button variant="outline" onclick={() => (open = false)}>
			{#snippet children()}關閉{/snippet}
		</Button>
	{/snippet}
</Modal>
