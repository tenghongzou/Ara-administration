<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		page: number;
		pageSize: number;
		total: number;
		pageSizeOptions?: number[];
		showPageSizeSelector?: boolean;
		showTotal?: boolean;
		compact?: boolean;
		disabled?: boolean;
		onPageChange: (page: number) => void;
		onPageSizeChange?: (pageSize: number) => void;
		class?: string;
	}

	let {
		page,
		pageSize,
		total,
		pageSizeOptions = [10, 20, 50, 100],
		showPageSizeSelector = true,
		showTotal = true,
		compact = false,
		disabled = false,
		onPageChange,
		onPageSizeChange,
		class: className = ''
	}: Props = $props();

	let totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));
	let hasPrev = $derived(page > 1);
	let hasNext = $derived(page < totalPages);

	// Sync pageInput with page prop using derived
	let pageInput = $derived(String(page));
	let editingPage = $state('');

	let pageSizeSelectOptions = $derived(
		pageSizeOptions.map((size) => ({
			value: String(size),
			label: `${size} 筆/頁`
		}))
	);

	function handlePageSizeChange(event: Event) {
		const newPageSize = Number((event.target as HTMLSelectElement).value);
		onPageSizeChange?.(newPageSize);
		const newTotalPages = Math.ceil(total / newPageSize);
		if (page > newTotalPages) {
			onPageChange(newTotalPages);
		}
	}

	let isEditing = $state(false);

	function handlePageInputFocus() {
		isEditing = true;
		editingPage = pageInput;
	}

	function handlePageInputChange() {
		const targetPage = parseInt(editingPage, 10);
		if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
			if (targetPage !== page) {
				onPageChange(targetPage);
			}
		}
		isEditing = false;
		editingPage = '';
	}

	function handlePageInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handlePageInputChange();
			(event.target as HTMLInputElement).blur();
		} else if (event.key === 'Escape') {
			isEditing = false;
			editingPage = '';
			(event.target as HTMLInputElement).blur();
		}
	}

	function handlePageInputBlur() {
		handlePageInputChange();
	}

	function goToPage(targetPage: number) {
		if (disabled) return;
		if (targetPage >= 1 && targetPage <= totalPages && targetPage !== page) {
			onPageChange(targetPage);
		}
	}

	const btnClass = $derived(
		cn(
			'pagination-btn',
			'flex items-center justify-center',
			compact ? 'w-7 h-7' : 'w-8 h-8',
			'rounded-md border border-gray-300 dark:border-gray-600',
			'bg-white dark:bg-gray-900',
			'text-gray-700 dark:text-gray-300',
			'hover:bg-gray-50 dark:hover:bg-gray-800',
			'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-900',
			'transition-colors'
		)
	);
</script>

<div
	class={cn(
		'pagination',
		'flex flex-col sm:flex-row items-center gap-3 sm:gap-2',
		compact ? 'text-xs' : 'text-sm',
		disabled && 'opacity-50 pointer-events-none',
		className
	)}
>
	<!-- Left: Total & Page Size -->
	<div class="flex items-center gap-3 order-2 sm:order-1">
		{#if showTotal}
			<div class="pagination-total text-gray-600 dark:text-gray-400">
				共 <span class="font-medium text-gray-900 dark:text-gray-100">{total}</span> 筆
			</div>
		{/if}

		{#if showPageSizeSelector && onPageSizeChange}
			<div class="pagination-size-selector">
				<select
					class={cn(
						'px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600',
						'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
						'text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]'
					)}
					value={String(pageSize)}
					onchange={handlePageSizeChange}
					{disabled}
				>
					{#each pageSizeSelectOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
		{/if}
	</div>

	<!-- Center: Navigation -->
	<div class="pagination-nav flex items-center gap-1 sm:mx-auto order-1 sm:order-2">
		<!-- First Page -->
		<button
			type="button"
			class={btnClass}
			disabled={!hasPrev || disabled}
			onclick={() => goToPage(1)}
			aria-label="第一頁"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
				/>
			</svg>
		</button>

		<!-- Previous Page -->
		<button
			type="button"
			class={btnClass}
			disabled={!hasPrev || disabled}
			onclick={() => goToPage(page - 1)}
			aria-label="上一頁"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		<!-- Page Input -->
		<div class="flex items-center gap-1.5 px-2">
			<input
				type="text"
				inputmode="numeric"
				class={cn(
					compact ? 'w-10 h-7 text-xs' : 'w-12 h-8 text-sm',
					'px-1 text-center rounded-md border border-gray-300 dark:border-gray-600',
					'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
					'font-medium',
					'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]'
				)}
				value={isEditing ? editingPage : pageInput}
				onfocus={handlePageInputFocus}
				oninput={(e) => (editingPage = e.currentTarget.value)}
				onkeydown={handlePageInputKeydown}
				onblur={handlePageInputBlur}
				{disabled}
				aria-label="目前頁數"
			/>
			<span class="text-gray-500 dark:text-gray-400">/</span>
			<span class="font-medium text-gray-700 dark:text-gray-300 tabular-nums">{totalPages}</span>
		</div>

		<!-- Next Page -->
		<button
			type="button"
			class={btnClass}
			disabled={!hasNext || disabled}
			onclick={() => goToPage(page + 1)}
			aria-label="下一頁"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>

		<!-- Last Page -->
		<button
			type="button"
			class={btnClass}
			disabled={!hasNext || disabled}
			onclick={() => goToPage(totalPages)}
			aria-label="最後一頁"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 5l7 7-7 7M5 5l7 7-7 7"
				/>
			</svg>
		</button>
	</div>

	<!-- Right: Empty spacer for balance -->
	<div class="hidden sm:block sm:w-[150px] order-3"></div>
</div>
