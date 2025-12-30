<script lang="ts">
	import type { AnalyticsData } from '../types';
	import { subscriptionsService } from '../services/subscriptions.service';
	import { StatCard } from '$lib/components/data-display';
	import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar } from 'lucide-svelte';

	interface Props {
		analytics: AnalyticsData;
	}

	let { analytics }: Props = $props();

	let monthlyChange = $derived(subscriptionsService.calculateMonthlyChange(analytics.monthlyTrend));
</script>

<div class="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
	<StatCard
		title="月度支出"
		value={subscriptionsService.formatCurrency(analytics.averageMonthly)}
		variant="primary"
	>
		{#snippet icon()}
			<DollarSign class="w-5 h-5 sm:w-6 sm:h-6" />
		{/snippet}
	</StatCard>

	<StatCard
		title="年度預估"
		value={subscriptionsService.formatCurrency(analytics.yearlyProjection)}
		variant="success"
	>
		{#snippet icon()}
			<Calendar class="w-5 h-5 sm:w-6 sm:h-6" />
		{/snippet}
	</StatCard>

	<StatCard
		title="月度變化"
		value="{monthlyChange > 0 ? '+' : ''}{monthlyChange}%"
		variant={monthlyChange >= 0 ? 'warning' : 'success'}
	>
		{#snippet icon()}
			{#if monthlyChange >= 0}
				<TrendingUp class="w-5 h-5 sm:w-6 sm:h-6" />
			{:else}
				<TrendingDown class="w-5 h-5 sm:w-6 sm:h-6" />
			{/if}
		{/snippet}
	</StatCard>

	<StatCard title="訂閱分類" value="{analytics.categoryBreakdown.length} 類" variant="default">
		{#snippet icon()}
			<PieChart class="w-5 h-5 sm:w-6 sm:h-6" />
		{/snippet}
	</StatCard>
</div>
