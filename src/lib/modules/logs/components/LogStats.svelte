<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import type { LogStats } from '../types';
	import { actionLabels, resourceLabels } from '../services/logs.service';

	interface Props {
		stats: LogStats;
		class?: string;
	}

	let { stats, class: className }: Props = $props();

	const successRate = $derived(
		stats.total > 0 ? Math.round((stats.successCount / stats.total) * 100) : 0
	);

	// 取得前 5 個操作類型
	const topActions = $derived(
		Object.entries(stats.byAction)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
	);

	// 取得前 5 個資源類型
	const topResources = $derived(
		Object.entries(stats.byResource)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
	);

	// 計算最大值以便顯示進度條
	const maxActionCount = $derived(Math.max(...Object.values(stats.byAction), 1));
	const maxResourceCount = $derived(Math.max(...Object.values(stats.byResource), 1));
</script>

<div class={cn('grid grid-cols-1 lg:grid-cols-3 gap-4', className)}>
	<!-- 總覽卡片 -->
	<Card variant="bordered">
		{#snippet children()}
			<div class="text-center">
				<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">總覽</h3>
				<p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">總日誌數</p>

				<div class="flex justify-center gap-6 mt-4">
					<div>
						<p class="text-lg font-semibold text-green-600 dark:text-green-400">
							{stats.successCount}
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">成功</p>
					</div>
					<div>
						<p class="text-lg font-semibold text-red-600 dark:text-red-400">{stats.failureCount}</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">失敗</p>
					</div>
				</div>

				<!-- 成功率進度條 -->
				<div class="mt-4">
					<div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
						<span>成功率</span>
						<span>{successRate}%</span>
					</div>
					<div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
						<div
							class="h-full bg-green-500 dark:bg-green-400 transition-all duration-300"
							style="width: {successRate}%"
						></div>
					</div>
				</div>
			</div>
		{/snippet}
	</Card>

	<!-- 操作類型分佈 -->
	<Card variant="bordered">
		{#snippet children()}
			<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">操作類型分佈</h3>
			<div class="space-y-3">
				{#each topActions as [action, count]}
					<div>
						<div class="flex justify-between text-sm mb-1">
							<span class="text-gray-700 dark:text-gray-300">
								{actionLabels[action] || action}
							</span>
							<span class="text-gray-500 dark:text-gray-400">{count}</span>
						</div>
						<div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
							<div
								class="h-full bg-[var(--color-primary-500)] transition-all duration-300"
								style="width: {(count / maxActionCount) * 100}%"
							></div>
						</div>
					</div>
				{/each}
				{#if topActions.length === 0}
					<p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">無資料</p>
				{/if}
			</div>
		{/snippet}
	</Card>

	<!-- 資源類型分佈 -->
	<Card variant="bordered">
		{#snippet children()}
			<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">資源類型分佈</h3>
			<div class="space-y-3">
				{#each topResources as [resource, count]}
					<div>
						<div class="flex justify-between text-sm mb-1">
							<span class="text-gray-700 dark:text-gray-300">
								{resourceLabels[resource] || resource}
							</span>
							<span class="text-gray-500 dark:text-gray-400">{count}</span>
						</div>
						<div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
							<div
								class="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
								style="width: {(count / maxResourceCount) * 100}%"
							></div>
						</div>
					</div>
				{/each}
				{#if topResources.length === 0}
					<p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">無資料</p>
				{/if}
			</div>
		{/snippet}
	</Card>
</div>
