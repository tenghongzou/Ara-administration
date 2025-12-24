<script lang="ts">
	import { config } from '$lib/constants';
	import { mockUserGrowthData, mockPageViewsData } from '$lib/services';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Card } from '$lib/components/ui';
	import { SimpleChart } from '$lib/components/data-display';
	import {
		dashboardService,
		StatsGrid,
		ActivityFeed,
		QuickActions,
		SubscriptionReminders,
		type DashboardStats,
		type Activity
	} from '$lib/modules/dashboard';
	import type { UpcomingReminder } from '$lib/services';

	let stats = $state<DashboardStats | null>(null);
	let activities = $state<Activity[]>([]);
	let subscriptionReminders = $state<UpcomingReminder[]>([]);
	let loading = $state(true);

	async function loadData() {
		try {
			const data = await dashboardService.loadDashboardData();
			stats = data.stats;
			activities = data.activities;
			subscriptionReminders = data.reminders;

			if (data.error) {
				toast.error(data.error);
			}
		} catch (error) {
			toast.error('載入資料失敗');
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadData();
	});
</script>

<svelte:head>
	<title>儀表板 - {config.appName}</title>
</svelte:head>

<PageContainer title="儀表板" description="歡迎使用後台管理系統">
	<div class="space-y-6">
		<!-- 統計卡片 -->
		<StatsGrid {stats} />

		<!-- 圖表區塊 -->
		<div class="grid gap-6 lg:grid-cols-2">
			<Card variant="bordered">
				{#snippet header()}
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">使用者成長趨勢</h2>
				{/snippet}
				{#snippet children()}
					<SimpleChart data={mockUserGrowthData} type="line" height={220} color="var(--color-primary-500)" />
				{/snippet}
			</Card>

			<Card variant="bordered">
				{#snippet header()}
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">每週頁面瀏覽</h2>
				{/snippet}
				{#snippet children()}
					<SimpleChart data={mockPageViewsData} type="bar" height={220} color="#10b981" />
				{/snippet}
			</Card>
		</div>

		<!-- 活動和快速操作 -->
		<div class="grid gap-6 lg:grid-cols-2">
			<ActivityFeed {activities} {loading} />
			<QuickActions />
		</div>

		<!-- 訂閱到期提醒 -->
		<SubscriptionReminders reminders={subscriptionReminders} />
	</div>
</PageContainer>
