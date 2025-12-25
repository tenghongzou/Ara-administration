<script lang="ts">
	import type { CategorySpending } from '../types';
	import { subscriptionsService } from '../services/subscriptions.service';
	import { Card } from '$lib/components/ui';
	import { PieChart } from '$lib/components/charts';
	import { PieChart as PieChartIcon } from 'lucide-svelte';
	import type { ChartData } from 'chart.js';

	interface Props {
		categoryBreakdown: CategorySpending[];
	}

	let { categoryBreakdown }: Props = $props();

	let chartData = $derived<ChartData<'doughnut'>>({
		labels: categoryBreakdown.map((c) => subscriptionsService.getCategoryLabel(c.category)),
		datasets: [
			{
				data: categoryBreakdown.map((c) => c.amount),
				backgroundColor: categoryBreakdown.map((c) =>
					subscriptionsService.getCategoryChartColor(c.category)
				),
				borderWidth: 0
			}
		]
	});
</script>

<Card variant="bordered">
	{#snippet header()}
		<div class="flex items-center gap-2">
			<PieChartIcon class="w-5 h-5 text-purple-500" />
			<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">分類支出佔比</h2>
		</div>
	{/snippet}
	{#snippet children()}
		<div class="h-72">
			<PieChart data={chartData} class="h-full" />
		</div>
	{/snippet}
</Card>
