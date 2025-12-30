<script lang="ts">
	import { Card } from '$lib/components/ui';
	import type { SubscriptionStats } from '$lib/types';
	import { subscriptionsService } from '../services/subscriptions.service';

	interface Props {
		stats: SubscriptionStats;
	}

	let { stats }: Props = $props();

	const formatted = $derived(subscriptionsService.formatStats(stats));
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="subscriptions-stats">
	<Card>
		{#snippet children()}
			<div class="flex items-center gap-4">
				<div
					class="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
				>
					<svg
						class="w-6 h-6 text-blue-600 dark:text-blue-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<div>
					<p class="text-sm text-gray-500 dark:text-gray-400">月費總計</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
						{formatted.totalMonthly}
					</p>
				</div>
			</div>
		{/snippet}
	</Card>

	<Card>
		{#snippet children()}
			<div class="flex items-center gap-4">
				<div
					class="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
				>
					<svg
						class="w-6 h-6 text-green-600 dark:text-green-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
				</div>
				<div>
					<p class="text-sm text-gray-500 dark:text-gray-400">年費總計</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
						{formatted.totalYearly}
					</p>
				</div>
			</div>
		{/snippet}
	</Card>

	<Card>
		{#snippet children()}
			<div class="flex items-center gap-4">
				<div
					class="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"
				>
					<svg
						class="w-6 h-6 text-orange-600 dark:text-orange-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<div>
					<p class="text-sm text-gray-500 dark:text-gray-400">即將到期 (7天內)</p>
					<p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
						{formatted.upcomingCount} 筆
					</p>
				</div>
			</div>
		{/snippet}
	</Card>
</div>
