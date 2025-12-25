<script lang="ts">
	import { config } from '$lib/constants';
	import { subscriptionsApi } from '$lib/services';
	import type { Subscription } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import {
		CalendarContent,
		CalendarDayModal,
		type CalendarDayData
	} from '$lib/modules/subscriptions';

	let currentYear = $state(new Date().getFullYear());
	let currentMonth = $state(new Date().getMonth());
	let calendarData = $state<CalendarDayData[]>([]);
	let loading = $state(true);

	let selectedDate = $state<string | null>(null);
	let selectedSubscriptions = $state<Subscription[]>([]);
	let showModal = $state(false);

	async function loadCalendarData() {
		loading = true;
		try {
			calendarData = await subscriptionsApi.getCalendarData(currentYear, currentMonth);
		} catch (error) {
			toast.error('載入日曆資料失敗');
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadCalendarData();
	});

	function handleMonthChange(year: number, month: number) {
		currentYear = year;
		currentMonth = month;
		loadCalendarData();
	}

	function handleDayClick(date: string, subscriptions: Subscription[]) {
		selectedDate = date;
		selectedSubscriptions = subscriptions;
		showModal = true;
	}
</script>

<svelte:head>
	<title>訂閱日曆 - {config.appName}</title>
</svelte:head>

<PageContainer
	title="訂閱日曆"
	description="查看每月訂閱扣款日期"
	backLink="/subscriptions"
	backLabel="返回訂閱列表"
>
	<CalendarContent
		{loading}
		{calendarData}
		year={currentYear}
		month={currentMonth}
		onMonthChange={handleMonthChange}
		onDayClick={handleDayClick}
	/>
</PageContainer>

<CalendarDayModal
	bind:open={showModal}
	date={selectedDate}
	subscriptions={selectedSubscriptions}
	onclose={() => (showModal = false)}
/>
