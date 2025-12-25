<script lang="ts">
	import type { UpcomingReminder } from '$lib/services';
	import type { DashboardStats, Activity } from '../types';
	import StatsGrid from './StatsGrid.svelte';
	import ActivityFeed from './ActivityFeed.svelte';
	import QuickActions from './QuickActions.svelte';
	import SubscriptionReminders from './SubscriptionReminders.svelte';
	import DashboardCharts from './DashboardCharts.svelte';

	interface Props {
		stats: DashboardStats | null;
		activities: Activity[];
		reminders: UpcomingReminder[];
		loading?: boolean;
	}

	let { stats, activities, reminders, loading = false }: Props = $props();
</script>

<div class="space-y-6">
	<!-- 統計卡片 -->
	<StatsGrid {stats} />

	<!-- 圖表區塊 -->
	<DashboardCharts />

	<!-- 活動和快速操作 -->
	<div class="grid gap-6 lg:grid-cols-2">
		<ActivityFeed {activities} {loading} />
		<QuickActions />
	</div>

	<!-- 訂閱到期提醒 -->
	<SubscriptionReminders {reminders} />
</div>
