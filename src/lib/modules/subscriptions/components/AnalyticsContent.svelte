<script lang="ts">
	import { Spinner } from '$lib/components/ui';
	import { AlertCircle } from 'lucide-svelte';
	import type { AnalyticsData } from '../types';
	import AnalyticsStatsCards from './AnalyticsStatsCards.svelte';
	import MonthlyTrendCard from './MonthlyTrendCard.svelte';
	import CategoryPieCard from './CategoryPieCard.svelte';
	import CategoryBreakdownCard from './CategoryBreakdownCard.svelte';

	interface Props {
		analytics: AnalyticsData | null;
		loading?: boolean;
	}

	let { analytics, loading = false }: Props = $props();
</script>

{#if loading}
	<div class="flex items-center justify-center py-20">
		<Spinner size="lg" />
	</div>
{:else if analytics}
	<div class="space-y-6">
		<AnalyticsStatsCards {analytics} />

		<div class="grid gap-6 lg:grid-cols-2">
			<MonthlyTrendCard monthlyTrend={analytics.monthlyTrend} />
			<CategoryPieCard categoryBreakdown={analytics.categoryBreakdown} />
		</div>

		<CategoryBreakdownCard categoryBreakdown={analytics.categoryBreakdown} />
	</div>
{:else}
	<div class="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
		<AlertCircle class="w-12 h-12 mb-3 opacity-50" />
		<p>無法載入分析資料</p>
	</div>
{/if}
