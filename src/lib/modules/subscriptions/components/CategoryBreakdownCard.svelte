<script lang="ts">
	import type { CategorySpending } from '../types';
	import { subscriptionsService } from '../services/subscriptions.service';
	import { Card } from '$lib/components/ui';
	import { BarChart } from '$lib/components/charts';
	import CategoryBreakdown from './CategoryBreakdown.svelte';
	import type { ChartData } from 'chart.js';

	interface Props {
		categoryBreakdown: CategorySpending[];
	}

	let { categoryBreakdown }: Props = $props();

	let barChartData = $derived<ChartData<'bar'>>({
		labels: categoryBreakdown.map((c) => subscriptionsService.getCategoryLabel(c.category)),
		datasets: [
			{
				label: '月度支出',
				data: categoryBreakdown.map((c) => c.amount),
				backgroundColor: categoryBreakdown.map((c) =>
					subscriptionsService.getCategoryChartColor(c.category)
				),
				borderRadius: 4
			}
		]
	});
</script>

<Card variant="bordered">
	{#snippet header()}
		<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">分類支出詳情</h2>
	{/snippet}
	{#snippet children()}
		<div class="grid gap-6 lg:grid-cols-2">
			<!-- Bar Chart -->
			<div class="h-64">
				<BarChart data={barChartData} class="h-full" />
			</div>

			<!-- Category List -->
			<CategoryBreakdown breakdown={categoryBreakdown} />
		</div>
	{/snippet}
</Card>
