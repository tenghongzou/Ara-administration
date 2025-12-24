<script lang="ts">
	import { config, categoryLabels } from '$lib/constants';
	import { subscriptionsApi, type CalendarDayData } from '$lib/services';
	import type { Subscription } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Card, Spinner, Modal, Badge } from '$lib/components/ui';
	import { SubscriptionCalendar } from '$lib/components/calendar';
	import { Calendar, CreditCard, ExternalLink } from 'lucide-svelte';

	let currentYear = $state(new Date().getFullYear());
	let currentMonth = $state(new Date().getMonth());
	let calendarData = $state<CalendarDayData[]>([]);
	let loading = $state(true);

	// 選中的日期詳情
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

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			weekday: 'long'
		});
	}

	function formatCurrency(amount: number, currency: string = 'TWD'): string {
		return new Intl.NumberFormat('zh-TW', {
			style: 'currency',
			currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	// 計算當月總支出
	let monthlyTotal = $derived(
		calendarData.reduce((sum, day) => sum + day.totalAmount, 0)
	);

	// 計算當月扣款次數
	let monthlyCount = $derived(
		calendarData.reduce((sum, day) => sum + day.subscriptions.length, 0)
	);
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
	{#if loading}
		<div class="flex items-center justify-center py-20">
			<Spinner size="lg" />
		</div>
	{:else}
		<div class="space-y-6">
			<!-- 月度統計 -->
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Card variant="bordered" class="p-4">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
							<CreditCard class="w-5 h-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<p class="text-sm text-gray-500 dark:text-gray-400">本月預估支出</p>
							<p class="text-xl font-semibold text-gray-900 dark:text-gray-100">
								{formatCurrency(monthlyTotal)}
							</p>
						</div>
					</div>
				</Card>

				<Card variant="bordered" class="p-4">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
							<Calendar class="w-5 h-5 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<p class="text-sm text-gray-500 dark:text-gray-400">扣款次數</p>
							<p class="text-xl font-semibold text-gray-900 dark:text-gray-100">
								{monthlyCount} 次
							</p>
						</div>
					</div>
				</Card>

				<Card variant="bordered" class="p-4">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
							<Calendar class="w-5 h-5 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<p class="text-sm text-gray-500 dark:text-gray-400">有扣款日期</p>
							<p class="text-xl font-semibold text-gray-900 dark:text-gray-100">
								{calendarData.length} 天
							</p>
						</div>
					</div>
				</Card>
			</div>

			<!-- 日曆 -->
			<SubscriptionCalendar
				year={currentYear}
				month={currentMonth}
				{calendarData}
				onMonthChange={handleMonthChange}
				onDayClick={handleDayClick}
			/>

			<!-- 使用說明 -->
			<Card variant="bordered" class="p-4">
				<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">使用說明</h3>
				<ul class="text-sm text-gray-500 dark:text-gray-400 space-y-1">
					<li>• 點擊有顏色標記的日期可查看當日訂閱詳情</li>
					<li>• 顏色深淺代表當日扣款金額大小</li>
					<li>• 使用左右箭頭切換月份</li>
				</ul>
			</Card>
		</div>
	{/if}
</PageContainer>

<!-- 日期詳情 Modal -->
<Modal bind:open={showModal} title={selectedDate ? formatDate(selectedDate) : ''} size="md">
	{#snippet children()}
		{#if selectedSubscriptions.length > 0}
			<div class="space-y-3">
				<div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700">
					<span>共 {selectedSubscriptions.length} 筆訂閱</span>
					<span>
						總計 {formatCurrency(selectedSubscriptions.reduce((sum, s) => sum + s.cost, 0))}
					</span>
				</div>

				{#each selectedSubscriptions as subscription}
					<a
						href="/subscriptions/{subscription.id}"
						class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
								<span class="text-lg font-medium text-gray-600 dark:text-gray-400">
									{subscription.name.charAt(0)}
								</span>
							</div>
							<div>
								<p class="font-medium text-gray-900 dark:text-gray-100">
									{subscription.name}
								</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">
									{categoryLabels[subscription.category]}
								</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<span class="font-medium text-gray-900 dark:text-gray-100">
								{formatCurrency(subscription.cost, subscription.currency)}
							</span>
							<ExternalLink class="w-4 h-4 text-gray-400" />
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<p class="text-center text-gray-500 dark:text-gray-400 py-4">
				此日期無訂閱扣款
			</p>
		{/if}
	{/snippet}
</Modal>
