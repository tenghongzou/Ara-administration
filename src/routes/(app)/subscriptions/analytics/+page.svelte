<script lang="ts">
	import { config } from '$lib/constants';
	import { subscriptionsApi } from '$lib/services';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { AnalyticsContent, type AnalyticsData } from '$lib/modules/subscriptions';

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
	<AnalyticsContent {analytics} {loading} />
</PageContainer>
