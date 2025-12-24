<script lang="ts">
	import { Card } from '$lib/components/ui';
	import type { Activity } from '../types';
	import { dashboardService } from '../services/dashboard.service';

	interface Props {
		activities: Activity[];
		loading?: boolean;
	}

	let { activities, loading = false }: Props = $props();
</script>

<Card variant="bordered">
	{#snippet header()}
		<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">最近活動</h2>
	{/snippet}
	{#snippet children()}
		{#if loading}
			<div class="flex items-center justify-center py-8">
				<div
					class="animate-spin h-8 w-8 border-4 border-[var(--color-primary-600)] border-t-transparent rounded-full"
				></div>
			</div>
		{:else if activities.length === 0}
			<p class="text-center text-gray-500 py-8">暫無活動記錄</p>
		{:else}
			<div class="space-y-4">
				{#each activities as activity}
					<div class="flex items-start gap-3">
						<div
							class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0"
						>
							<span class="text-xs font-medium text-gray-600 dark:text-gray-400">
								{activity.user.charAt(0)}
							</span>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm text-gray-900 dark:text-gray-100">
								<span class="font-medium">{activity.user}</span>
								{activity.action}
								<span class="text-[var(--color-primary-600)]">{activity.target}</span>
							</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">
								{dashboardService.formatRelativeDate(activity.timestamp)}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/snippet}
</Card>
