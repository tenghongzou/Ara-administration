<script lang="ts">
	import { config } from '$lib/constants';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import {
		dashboardService,
		DashboardContent,
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
	<DashboardContent
		{stats}
		{activities}
		reminders={subscriptionReminders}
		{loading}
	/>
</PageContainer>
