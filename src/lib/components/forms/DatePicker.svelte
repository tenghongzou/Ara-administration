<script lang="ts">
	import { cn, generateUUID } from '$lib/utils';
	import dayjs from 'dayjs';

	interface Props {
		name?: string;
		id?: string;
		value?: string;
		label?: string;
		placeholder?: string;
		error?: string;
		hint?: string;
		disabled?: boolean;
		required?: boolean;
		min?: string;
		max?: string;
		class?: string;
		onchange?: (value: string) => void;
	}

	let {
		name,
		id,
		value = $bindable(''),
		label,
		placeholder = '選擇日期',
		error,
		hint,
		disabled = false,
		required = false,
		min,
		max,
		class: className = '',
		onchange
	}: Props = $props();

	let showCalendar = $state(false);
	let currentMonth = $state(value ? dayjs(value) : dayjs());
	let inputRef: HTMLInputElement;

	const inputId = $derived(id || name || generateUUID());

	const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

	let calendarDays = $derived.by(() => {
		const startOfMonth = currentMonth.startOf('month');
		const endOfMonth = currentMonth.endOf('month');
		const startDay = startOfMonth.day();
		const daysInMonth = currentMonth.daysInMonth();

		const days: Array<{ date: dayjs.Dayjs; isCurrentMonth: boolean; isDisabled: boolean }> = [];

		// 上個月的日期
		for (let i = startDay - 1; i >= 0; i--) {
			const date = startOfMonth.subtract(i + 1, 'day');
			days.push({
				date,
				isCurrentMonth: false,
				isDisabled: isDateDisabled(date)
			});
		}

		// 當月的日期
		for (let i = 1; i <= daysInMonth; i++) {
			const date = startOfMonth.add(i - 1, 'day');
			days.push({
				date,
				isCurrentMonth: true,
				isDisabled: isDateDisabled(date)
			});
		}

		// 下個月的日期（補齊到 42 天）
		const remainingDays = 42 - days.length;
		for (let i = 1; i <= remainingDays; i++) {
			const date = endOfMonth.add(i, 'day');
			days.push({
				date,
				isCurrentMonth: false,
				isDisabled: isDateDisabled(date)
			});
		}

		return days;
	});

	function isDateDisabled(date: dayjs.Dayjs): boolean {
		if (min && date.isBefore(dayjs(min), 'day')) return true;
		if (max && date.isAfter(dayjs(max), 'day')) return true;
		return false;
	}

	function selectDate(date: dayjs.Dayjs) {
		if (isDateDisabled(date)) return;
		value = date.format('YYYY-MM-DD');
		onchange?.(value);
		showCalendar = false;
	}

	function prevMonth() {
		currentMonth = currentMonth.subtract(1, 'month');
	}

	function nextMonth() {
		currentMonth = currentMonth.add(1, 'month');
	}

	function handleInputClick() {
		if (!disabled) {
			showCalendar = !showCalendar;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			showCalendar = false;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.datepicker-container')) {
			showCalendar = false;
		}
	}

	let displayValue = $derived(value ? dayjs(value).format('YYYY/MM/DD') : '');

	const baseInputStyles = `
		w-full px-3 py-2 pr-10
		border rounded-md
		text-sm text-gray-900 placeholder-gray-400
		transition-colors duration-200
		focus:outline-none focus:ring-2 focus:ring-offset-0
		disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
		dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500
		cursor-pointer
	`;

	let inputStyles = $derived(
		cn(
			baseInputStyles,
			error
				? 'border-red-300 focus:border-red-500 focus:ring-red-500'
				: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600'
		)
	);
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div class={cn('relative datepicker-container', className)}>
	{#if label}
		<label for={inputId} class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
			{label}
			{#if required}
				<span class="text-red-500" aria-hidden="true">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative">
		<input
			type="text"
			{name}
			id={inputId}
			value={displayValue}
			{placeholder}
			{disabled}
			readonly
			role="combobox"
			aria-invalid={!!error}
			aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
			aria-haspopup="dialog"
			aria-expanded={showCalendar}
			aria-controls="{inputId}-calendar"
			class={inputStyles}
			onclick={handleInputClick}
			bind:this={inputRef}
		/>

		<!-- Calendar Icon -->
		<div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
			<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
				/>
			</svg>
		</div>
	</div>

	{#if showCalendar}
		<div
			id="{inputId}-calendar"
			class="absolute z-50 mt-1 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
			role="dialog"
			aria-modal="true"
			aria-label="選擇日期"
		>
			<!-- Month Navigation -->
			<div class="flex items-center justify-between mb-4">
				<button
					type="button"
					class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
					onclick={prevMonth}
					aria-label="上個月"
				>
					<svg class="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<span class="text-sm font-medium text-gray-900 dark:text-gray-100">
					{currentMonth.format('YYYY年 M月')}
				</span>
				<button
					type="button"
					class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
					onclick={nextMonth}
					aria-label="下個月"
				>
					<svg class="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>

			<!-- Week Days -->
			<div class="grid grid-cols-7 gap-1 mb-2">
				{#each weekDays as day}
					<div class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
						{day}
					</div>
				{/each}
			</div>

			<!-- Calendar Days -->
			<div class="grid grid-cols-7 gap-1" role="grid">
				{#each calendarDays as { date, isCurrentMonth, isDisabled }}
					{@const isSelected = value === date.format('YYYY-MM-DD')}
					{@const isToday = date.isSame(dayjs(), 'day')}
					<button
						type="button"
						class={cn(
							'w-8 h-8 text-sm rounded-full transition-colors',
							isCurrentMonth
								? 'text-gray-900 dark:text-gray-100'
								: 'text-gray-400 dark:text-gray-600',
							isDisabled && 'opacity-50 cursor-not-allowed',
							!isDisabled && !isSelected && 'hover:bg-gray-100 dark:hover:bg-gray-800',
							isSelected && 'bg-primary-600 text-white hover:bg-primary-700',
							isToday && !isSelected && 'ring-1 ring-primary-500'
						)}
						disabled={isDisabled}
						onclick={() => selectDate(date)}
						aria-label={`${date.format('YYYY年M月D日')}${isSelected ? '，已選取' : ''}`}
						aria-pressed={isSelected}
					>
						{date.date()}
					</button>
				{/each}
			</div>

			<!-- Quick Actions -->
			<div class="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
				<button
					type="button"
					class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
					onclick={() => selectDate(dayjs())}
				>
					今天
				</button>
				<button
					type="button"
					class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
					onclick={() => { value = ''; showCalendar = false; onchange?.(''); }}
				>
					清除
				</button>
			</div>
		</div>
	{/if}

	{#if error}
		<p id="{inputId}-error" class="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
			{error}
		</p>
	{:else if hint}
		<p id="{inputId}-hint" class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
			{hint}
		</p>
	{/if}
</div>
