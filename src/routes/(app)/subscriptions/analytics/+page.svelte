<script lang="ts">
	import { config, categoryLabels, categoryColors } from '$lib/constants';
	import { subscriptionsApi, type AnalyticsData, type CategorySpending } from '$lib/services';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Card, Spinner } from '$lib/components/ui';
	import { StatCard } from '$lib/components/data-display';
	import { LineChart, PieChart, BarChart } from '$lib/components/charts';
	import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, Calendar, BarChart3 } from 'lucide-svelte';
	import type { ChartData } from 'chart.js';

	let analytics = $state<AnalyticsData | null>(null);
	let loading = $state(true);

	async function loadData() {
		try {
			analytics = await subscriptionsApi.getAnalytics();
		} catch (error) {
			toast.error('載入分析資料失敗');
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadData();
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('zh-TW', {
			style: 'currency',
			currency: 'TWD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	// 月度趨勢圖表數據
	let lineChartData = $derived<ChartData<'line'>>({
		labels: analytics?.monthlyTrend.map((m) => {
			const [year, month] = m.month.split('-');
			return `${month}月`;
		}) || [],
		datasets: [
			{
				label: '月度支出',
				data: analytics?.monthlyTrend.map((m) => m.amount) || [],
				borderColor: 'rgb(59, 130, 246)',
				backgroundColor: 'rgba(59, 130, 246, 0.1)',
				fill: true,
				tension: 0.4
			}
		]
	});

	// 分類支出圖表數據
	const categoryColorMap: Record<string, string> = {
		streaming: 'rgb(239, 68, 68)',
		music: 'rgb(34, 197, 94)',
		cloud: 'rgb(59, 130, 246)',
		productivity: 'rgb(168, 85, 247)',
		gaming: 'rgb(249, 115, 22)',
		other: 'rgb(107, 114, 128)'
	};

	let pieChartData = $derived<ChartData<'doughnut'>>({
		labels: analytics?.categoryBreakdown.map((c) => categoryLabels[c.category]) || [],
		datasets: [
			{
				data: analytics?.categoryBreakdown.map((c) => c.amount) || [],
				backgroundColor: analytics?.categoryBreakdown.map((c) => categoryColorMap[c.category]) || [],
				borderWidth: 0
			}
		]
	});

	// 長條圖數據 (分類支出)
	let barChartData = $derived<ChartData<'bar'>>({
		labels: analytics?.categoryBreakdown.map((c) => categoryLabels[c.category]) || [],
		datasets: [
			{
				label: '月度支出',
				data: analytics?.categoryBreakdown.map((c) => c.amount) || [],
				backgroundColor: analytics?.categoryBreakdown.map((c) => categoryColorMap[c.category]) || [],
				borderRadius: 4
			}
		]
	});

	// 計算變化百分比 (模擬)
	let monthlyChange = $derived(() => {
		if (!analytics || analytics.monthlyTrend.length < 2) return 0;
		const current = analytics.monthlyTrend[analytics.monthlyTrend.length - 1].amount;
		const previous = analytics.monthlyTrend[analytics.monthlyTrend.length - 2].amount;
		return Math.round(((current - previous) / previous) * 100);
	});
</script>

<svelte:head>
	<title>訂閱分析 - {config.appName}</title>
</svelte:head>

<PageContainer
	title="訂閱分析"
	description="查看訂閱支出趨勢和分類統計"
	backLink="/subscriptions"
	backLabel="返回訂閱列表"
>
	{#if loading}
		<div class="flex items-center justify-center py-20">
			<Spinner size="lg" />
		</div>
	{:else if analytics}
		<div class="space-y-6">
			<!-- 統計卡片 -->
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard title="月度支出" value={formatCurrency(analytics.averageMonthly)} variant="primary">
					{#snippet icon()}
						<DollarSign class="w-6 h-6" />
					{/snippet}
				</StatCard>

				<StatCard title="年度預估" value={formatCurrency(analytics.yearlyProjection)} variant="success">
					{#snippet icon()}
						<Calendar class="w-6 h-6" />
					{/snippet}
				</StatCard>

				<StatCard
					title="月度變化"
					value="{monthlyChange() > 0 ? '+' : ''}{monthlyChange()}%"
					variant={monthlyChange() >= 0 ? 'warning' : 'success'}
				>
					{#snippet icon()}
						{#if monthlyChange() >= 0}
							<TrendingUp class="w-6 h-6" />
						{:else}
							<TrendingDown class="w-6 h-6" />
						{/if}
					{/snippet}
				</StatCard>

				<StatCard
					title="訂閱分類"
					value="{analytics.categoryBreakdown.length} 類"
					variant="default"
				>
					{#snippet icon()}
						<PieChartIcon class="w-6 h-6" />
					{/snippet}
				</StatCard>
			</div>

			<!-- 圖表區 -->
			<div class="grid gap-6 lg:grid-cols-2">
				<!-- 月度趨勢 -->
				<Card variant="bordered">
					{#snippet header()}
						<div class="flex items-center gap-2">
							<BarChart3 class="w-5 h-5 text-blue-500" />
							<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">月度支出趨勢</h2>
						</div>
					{/snippet}
					{#snippet children()}
						<div class="h-72">
							<LineChart data={lineChartData} class="h-full" />
						</div>
					{/snippet}
				</Card>

				<!-- 分類佔比 -->
				<Card variant="bordered">
					{#snippet header()}
						<div class="flex items-center gap-2">
							<PieChartIcon class="w-5 h-5 text-purple-500" />
							<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">分類支出佔比</h2>
						</div>
					{/snippet}
					{#snippet children()}
						<div class="h-72">
							<PieChart data={pieChartData} class="h-full" />
						</div>
					{/snippet}
				</Card>
			</div>

			<!-- 分類詳情 -->
			<Card variant="bordered">
				{#snippet header()}
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">分類支出詳情</h2>
				{/snippet}
				{#snippet children()}
					<div class="grid gap-6 lg:grid-cols-2">
						<!-- 長條圖 -->
						<div class="h-64">
							<BarChart data={barChartData} class="h-full" />
						</div>

						<!-- 分類列表 -->
						<div class="space-y-3">
							{#each analytics.categoryBreakdown as category}
								{@const colorClass = categoryColors[category.category]}
								<div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
									<div class="flex items-center gap-3">
										<span class={`px-2 py-1 text-xs font-medium rounded ${colorClass}`}>
											{categoryLabels[category.category]}
										</span>
									</div>
									<div class="text-right">
										<p class="font-medium text-gray-900 dark:text-gray-100">
											{formatCurrency(category.amount)}
										</p>
										<p class="text-sm text-gray-500 dark:text-gray-400">
											{category.percentage}%
										</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/snippet}
			</Card>
		</div>
	{:else}
		<div class="text-center py-20 text-gray-500">
			無法載入分析資料
		</div>
	{/if}
</PageContainer>
