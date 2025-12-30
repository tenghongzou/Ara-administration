<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Subscription } from '$lib/types';
	import type { CalendarDayData } from '$lib/services';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface Props {
		year: number;
		month: number;
		calendarData: CalendarDayData[];
		onMonthChange?: (year: number, month: number) => void;
		onDayClick?: (date: string, subscriptions: Subscription[], totalAmount: number) => void;
		class?: string;
	}

	let {
		year,
		month,
		calendarData,
		onMonthChange,
		onDayClick,
		class: className = ''
	}: Props = $props();

	const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

	// 計算日曆網格
	let calendarGrid = $derived(() => {
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const daysInMonth = lastDay.getDate();
		const startDayOfWeek = firstDay.getDay();

		const grid: {
			date: number | null;
			dateStr: string;
			isToday: boolean;
			data: CalendarDayData | null;
		}[] = [];

		// 填充上個月的空白
		for (let i = 0; i < startDayOfWeek; i++) {
			grid.push({ date: null, dateStr: '', isToday: false, data: null });
		}

		const today = new Date();
		const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

		// 填充當月日期
		for (let day = 1; day <= daysInMonth; day++) {
			const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
			const data = calendarData.find((d) => d.date === dateStr) || null;
			grid.push({
				date: day,
				dateStr,
				isToday: dateStr === todayStr,
				data
			});
		}

		return grid;
	});

	// 月份名稱
	let monthName = $derived(
		new Date(year, month).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })
	);

	function prevMonth() {
		let newMonth = month - 1;
		let newYear = year;
		if (newMonth < 0) {
			newMonth = 11;
			newYear--;
		}
		onMonthChange?.(newYear, newMonth);
	}

	function nextMonth() {
		let newMonth = month + 1;
		let newYear = year;
		if (newMonth > 11) {
			newMonth = 0;
			newYear++;
		}
		onMonthChange?.(newYear, newMonth);
	}

	function handleDayClick(day: ReturnType<typeof calendarGrid>[0]) {
		if (day.date && day.data) {
			onDayClick?.(day.dateStr, day.data.subscriptions, day.data.totalAmount);
		}
	}

	// 格式化金額顯示
	function formatAmount(amount: number): string {
		if (amount >= 1000) {
			return (amount / 1000).toFixed(1) + 'k';
		}
		return amount.toString();
	}

	// 根據金額計算背景顏色強度
	function getAmountIntensity(amount: number): string {
		if (amount >= 2000) return 'bg-red-500/30 dark:bg-red-500/40';
		if (amount >= 1000) return 'bg-orange-500/30 dark:bg-orange-500/40';
		if (amount >= 500) return 'bg-yellow-500/30 dark:bg-yellow-500/40';
		return 'bg-blue-500/20 dark:bg-blue-500/30';
	}
</script>

<div class={cn('bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
	<!-- 月份導航 -->
	<div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
		<button
			type="button"
			onclick={prevMonth}
			class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
		>
			<ChevronLeft class="w-5 h-5" />
		</button>
		<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{monthName}</h2>
		<button
			type="button"
			onclick={nextMonth}
			class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
		>
			<ChevronRight class="w-5 h-5" />
		</button>
	</div>

	<!-- 星期標題 -->
	<div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
		{#each weekDays as day}
			<div class="py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
				{day}
			</div>
		{/each}
	</div>

	<!-- 日期網格 -->
	<div class="grid grid-cols-7">
		{#each calendarGrid() as day, i}
			{@const isWeekend = i % 7 === 0 || i % 7 === 6}
			<button
				type="button"
				disabled={!day.date}
				onclick={() => handleDayClick(day)}
				class={cn(
					'relative min-h-20 p-1 border-b border-r border-gray-100 dark:border-gray-800',
					'text-left transition-colors',
					day.date && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
					day.date && day.data && 'cursor-pointer',
					!day.date && 'bg-gray-50 dark:bg-gray-800/30',
					isWeekend && day.date && 'bg-gray-50/50 dark:bg-gray-800/20'
				)}
			>
				{#if day.date}
					<span
						class={cn(
							'inline-flex items-center justify-center w-7 h-7 text-sm rounded-full',
							day.isToday && 'bg-[var(--color-primary-600)] text-white font-semibold',
							!day.isToday && 'text-gray-700 dark:text-gray-300'
						)}
					>
						{day.date}
					</span>

					{#if day.data}
						<div
							class={cn(
								'mt-1 px-1.5 py-1 rounded text-xs',
								getAmountIntensity(day.data.totalAmount)
							)}
						>
							<div class="font-medium text-gray-800 dark:text-gray-200">
								${formatAmount(day.data.totalAmount)}
							</div>
							<div class="text-gray-600 dark:text-gray-400">
								{day.data.subscriptions.length} 筆
							</div>
						</div>
					{/if}
				{/if}
			</button>
		{/each}
	</div>

	<!-- 圖例 -->
	<div class="flex items-center justify-center gap-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
		<div class="flex items-center gap-1">
			<span class="w-3 h-3 rounded bg-blue-500/20 dark:bg-blue-500/30"></span>
			<span>&lt;$500</span>
		</div>
		<div class="flex items-center gap-1">
			<span class="w-3 h-3 rounded bg-yellow-500/30 dark:bg-yellow-500/40"></span>
			<span>$500-999</span>
		</div>
		<div class="flex items-center gap-1">
			<span class="w-3 h-3 rounded bg-orange-500/30 dark:bg-orange-500/40"></span>
			<span>$1000-1999</span>
		</div>
		<div class="flex items-center gap-1">
			<span class="w-3 h-3 rounded bg-red-500/30 dark:bg-red-500/40"></span>
			<span>&gt;$2000</span>
		</div>
	</div>
</div>
