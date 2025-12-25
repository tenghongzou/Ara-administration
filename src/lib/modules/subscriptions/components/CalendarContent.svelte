<script lang="ts">
	import type { Subscription } from '$lib/types';
	import { Spinner } from '$lib/components/ui';
	import { SubscriptionCalendar } from '$lib/components/calendar';
	import { subscriptionsService } from '../services/subscriptions.service';
	import type { CalendarDayData } from '../types';
	import CalendarStatsPanel from './CalendarStatsPanel.svelte';
	import CalendarHelpCard from './CalendarHelpCard.svelte';

	interface Props {
		loading?: boolean;
		calendarData: CalendarDayData[];
		year: number;
		month: number;
		onMonthChange: (year: number, month: number) => void;
		onDayClick: (date: string, subscriptions: Subscription[]) => void;
	}

	let {
		loading = false,
		calendarData,
		year,
		month,
		onMonthChange,
		onDayClick
	}: Props = $props();

	let calendarStats = $derived(subscriptionsService.calculateCalendarStats(calendarData));
</script>

{#if loading}
	<div class="flex items-center justify-center py-20">
		<Spinner size="lg" />
	</div>
{:else}
	<div class="space-y-6">
		<CalendarStatsPanel stats={calendarStats} />

		<SubscriptionCalendar
			{year}
			{month}
			{calendarData}
			{onMonthChange}
			{onDayClick}
		/>

		<CalendarHelpCard />
	</div>
{/if}
