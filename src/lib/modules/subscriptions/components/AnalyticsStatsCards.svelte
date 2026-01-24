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

	// 計算平均月度支出
	let averageMonthly = $derived(() => {
		if (analytics.monthlyTrend.length === 0) return 0;
		const total = analytics.monthlyTrend.reduce((sum, m) => sum + m.spending, 0);
		return total / analytics.monthlyTrend.length;
	});

	// 計算年度預估
	let yearlyProjection = $derived(() => averageMonthly() * 12);
</script>

<div class="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
	<StatCard
		title="月度支出"
		value={subscriptionsService.formatCurrency(averageMonthly())}
		variant="primary"
	>
		{#snippet icon()}
			<DollarSign class="w-5 h-5 sm:w-6 sm:h-6" />
		{/snippet}
	</StatCard>

	<StatCard
		title="年度預估"
		value={subscriptionsService.formatCurrency(yearlyProjection())}
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
