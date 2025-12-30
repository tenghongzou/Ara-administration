<script lang="ts">
	import type { MonthlySpending } from '../types';
	import { Card } from '$lib/components/ui';
	import { LineChart } from '$lib/components/charts';
	import { BarChart3 } from 'lucide-svelte';
	import type { ChartData } from 'chart.js';

	interface Props {
		monthlyTrend: MonthlySpending[];
	}

	let { monthlyTrend }: Props = $props();

	let chartData = $derived<ChartData<'line'>>({
		labels: monthlyTrend.map((m) => {
			const [, month] = m.month.split('-');
			return `${month}月`;
		}),
		datasets: [
			{
				label: '月度支出',
				data: monthlyTrend.map((m) => m.amount),
				borderColor: 'rgb(59, 130, 246)',
				backgroundColor: 'rgba(59, 130, 246, 0.1)',
				fill: true,
				tension: 0.4
			}
		]
	});
</script>

<Card variant="bordered">
	{#snippet header()}
		<div class="flex items-center gap-2">
			<BarChart3 class="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
			<h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">月度支出趨勢</h2>
		</div>
	{/snippet}
	{#snippet children()}
		<div class="h-56 sm:h-72">
			<LineChart data={chartData} class="h-full" />
		</div>
	{/snippet}
</Card>
