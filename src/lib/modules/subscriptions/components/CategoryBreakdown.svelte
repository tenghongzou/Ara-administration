<script lang="ts">
	import type { CategorySpending } from '../types';
	import { subscriptionsService } from '../services/subscriptions.service';

	interface Props {
		breakdown: CategorySpending[];
		class?: string;
	}

	let { breakdown, class: className = '' }: Props = $props();
</script>

<div class="space-y-3 {className}">
	{#each breakdown as category}
		{@const colorClass = subscriptionsService.getCategoryColorClass(category.category)}
		<div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
			<div class="flex items-center gap-3">
				<span class={`px-2 py-1 text-xs font-medium rounded ${colorClass}`}>
					{subscriptionsService.getCategoryLabel(category.category)}
				</span>
			</div>
			<div class="text-right">
				<p class="font-medium text-gray-900 dark:text-gray-100">
					{subscriptionsService.formatCurrency(category.amount)}
				</p>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{category.percentage}%
				</p>
			</div>
		</div>
	{/each}
</div>
