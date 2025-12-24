<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';
	import { cn } from '$lib/utils';
	import type { DataGridColumn } from '$lib/types';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';

	interface Props {
		data: T[];
		columns: DataGridColumn<T>[];
		loading?: boolean;
		emptyMessage?: string;
		emptyIcon?: Snippet;
		rowKey?: keyof T;
		selectable?: boolean;
		selectedRows?: T[];
		onSelectionChange?: (rows: T[]) => void;
		sortColumn?: string;
		sortDirection?: 'asc' | 'desc';
		onSort?: (column: string, direction: 'asc' | 'desc') => void;
		onRefresh?: () => void;
		onRowClick?: (row: T, index: number) => void;
		onRowDoubleClick?: (row: T, index: number) => void;
		striped?: boolean;
		bordered?: boolean;
		compact?: boolean;
		hoverable?: boolean;
		stickyHeader?: boolean;
		maxHeight?: string;
		class?: string;
		rowClass?: string | ((row: T, index: number) => string);
		// 響應式卡片模式
		responsiveMode?: 'scroll' | 'card';
		cardTitle?: keyof T;
		cardSubtitle?: keyof T;
		cardBadge?: keyof T;
		mobileBreakpoint?: number;
		cardRender?: Snippet<[T, number]>;
	}

	let {
		data,
		columns,
		loading = false,
		emptyMessage = '沒有資料',
		emptyIcon,
		rowKey,
		selectable = false,
		selectedRows = $bindable([]),
		onSelectionChange,
		sortColumn,
		sortDirection = 'asc',
		onSort,
		onRefresh,
		onRowClick,
		onRowDoubleClick,
		striped = false,
		bordered = true,
		compact = false,
		hoverable = true,
		stickyHeader = true,
		maxHeight,
		class: className = '',
		rowClass,
		// 響應式卡片模式
		responsiveMode = 'scroll',
		cardTitle,
		cardSubtitle,
		cardBadge,
		mobileBreakpoint = 768,
		cardRender
	}: Props = $props();

	// 視口寬度監聽
	let viewportWidth = $state(browser ? window.innerWidth : 1024);
	let isMobileView = $derived(responsiveMode === 'card' && viewportWidth < mobileBreakpoint);

	$effect(() => {
		if (!browser) return;

		const handleResize = () => {
			viewportWidth = window.innerWidth;
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	let allSelected = $derived(data.length > 0 && selectedRows.length === data.length);
	let someSelected = $derived(selectedRows.length > 0 && selectedRows.length < data.length);
	let hasActionsColumn = $derived(columns.some((col) => col.key === 'actions'));

	// 卡片模式輔助
	let actionsColumn = $derived(columns.find((col) => col.key === 'actions'));
	let cardColumns = $derived(
		columns.filter((col) => {
			const key = String(col.key);
			return key !== 'actions' && key !== String(cardTitle) && key !== String(cardBadge);
		})
	);
	let badgeColumn = $derived(cardBadge ? columns.find((col) => col.key === cardBadge) : undefined);

	function getRowKey(row: T, index: number): string {
		if (rowKey) {
			return String(row[rowKey]);
		}
		return String(index);
	}

	function getCellValue(row: T, key: keyof T | string): unknown {
		const keys = String(key).split('.');
		let value: unknown = row;
		for (const k of keys) {
			if (value && typeof value === 'object') {
				value = (value as Record<string, unknown>)[k];
			} else {
				return undefined;
			}
		}
		return value;
	}

	function handleSort(column: DataGridColumn<T>) {
		if (!column.sortable || !onSort) return;
		const key = String(column.key);
		const newDirection = sortColumn === key && sortDirection === 'asc' ? 'desc' : 'asc';
		onSort(key, newDirection);
	}

	function isRowSelected(row: T): boolean {
		if (!rowKey) return false;
		return selectedRows.some((r) => r[rowKey] === row[rowKey]);
	}

	function toggleRowSelection(row: T) {
		if (!selectable) return;

		let newSelection: T[];
		if (isRowSelected(row)) {
			newSelection = selectedRows.filter((r) => (rowKey ? r[rowKey] !== row[rowKey] : r !== row));
		} else {
			newSelection = [...selectedRows, row];
		}
		selectedRows = newSelection;
		onSelectionChange?.(newSelection);
	}

	function toggleAllSelection() {
		if (!selectable) return;

		let newSelection: T[];
		if (allSelected) {
			newSelection = [];
		} else {
			newSelection = [...data];
		}
		selectedRows = newSelection;
		onSelectionChange?.(newSelection);
	}

	function getRowClassName(row: T, index: number): string {
		if (typeof rowClass === 'function') {
			return rowClass(row, index);
		}
		return rowClass || '';
	}

	function handleRowClick(row: T, index: number, event: MouseEvent) {
		if (selectable && (event.target as HTMLElement).closest('.grid-checkbox')) {
			return;
		}
		onRowClick?.(row, index);
	}
</script>

{#if isMobileView}
	<!-- 卡片視圖 -->
	<div
		class={cn(
			'data-grid-container data-grid-card-view',
			className
		)}
	>
		{#if loading}
			<div class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500 dark:text-gray-400">
				<Spinner size="lg" />
				<span class="text-sm">載入中...</span>
			</div>
		{:else if data.length === 0}
			<div class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500 dark:text-gray-400">
				{#if emptyIcon}
					{@render emptyIcon()}
				{:else}
					<svg class="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
						/>
					</svg>
				{/if}
				<span class="text-sm">{emptyMessage}</span>
			</div>
		{:else}
			<div class="space-y-3 p-3">
				{#each data as row, rowIndex (getRowKey(row, rowIndex))}
					{#if cardRender}
						<!-- 自訂卡片渲染 -->
						{@render cardRender(row, rowIndex)}
					{:else}
						<!-- 預設卡片佈局 -->
						<div
							class={cn(
								'p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700',
								hoverable && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
								selectable && isRowSelected(row) && 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20',
								(onRowClick || onRowDoubleClick) && 'cursor-pointer',
								'transition-colors duration-150',
								getRowClassName(row, rowIndex)
							)}
							onclick={(e) => handleRowClick(row, rowIndex, e)}
							ondblclick={() => onRowDoubleClick?.(row, rowIndex)}
							role={onRowClick || onRowDoubleClick ? 'button' : undefined}
						>
							<!-- 卡片頭部：複選框 + 標題 + 狀態徽章 -->
							<div class="flex items-start gap-3">
								{#if selectable}
									<div class="flex-shrink-0 pt-0.5">
										<Checkbox
											checked={isRowSelected(row)}
											onchange={() => toggleRowSelection(row)}
											class="grid-checkbox"
										/>
									</div>
								{/if}

								<div class="flex-1 min-w-0">
									<div class="flex items-start justify-between gap-2">
										<div class="min-w-0">
											<h3 class="font-medium text-gray-900 dark:text-gray-100 truncate">
												{#if cardTitle}
													{getCellValue(row, cardTitle) ?? '-'}
												{:else}
													{getCellValue(row, columns[0].key) ?? '-'}
												{/if}
											</h3>
											{#if cardSubtitle}
												<p class="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
													{getCellValue(row, cardSubtitle) ?? '-'}
												</p>
											{/if}
										</div>

										{#if badgeColumn?.render}
											<div class="flex-shrink-0">
												{@render badgeColumn.render(row, rowIndex)}
											</div>
										{:else if cardBadge}
											<div class="flex-shrink-0">
												<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
													{getCellValue(row, cardBadge) ?? '-'}
												</span>
											</div>
										{/if}
									</div>

									<!-- 卡片內容：欄位網格 -->
									{#if cardColumns.length > 0}
										<div class="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
											{#each cardColumns as column}
												<div class="min-w-0">
													<dt class="text-gray-500 dark:text-gray-400 text-xs">{column.header}</dt>
													<dd class="text-gray-900 dark:text-gray-100 truncate mt-0.5">
														{#if column.render}
															{@render column.render(row, rowIndex)}
														{:else}
															{getCellValue(row, column.key) ?? '-'}
														{/if}
													</dd>
												</div>
											{/each}
										</div>
									{/if}

									<!-- 卡片操作按鈕 -->
									{#if actionsColumn?.render}
										<div class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
											{@render actionsColumn.render(row, rowIndex)}
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<!-- 表格視圖 -->
	<div
		class={cn(
			'data-grid-container',
			'bg-white dark:bg-gray-900 rounded-lg',
			bordered && 'border border-gray-200 dark:border-gray-700',
			className?.includes('h-full') && 'h-full flex flex-col',
			className
		)}
	>
	<div
		class={cn(
			'data-grid-wrapper overflow-x-auto',
			(className?.includes('h-full') || maxHeight) && 'overflow-y-auto',
			className?.includes('h-full') && 'flex-1 min-h-0'
		)}
		style={maxHeight ? `max-height: ${maxHeight}` : undefined}
	>
		<!-- Header -->
		<div
			class={cn(
				'data-grid-header',
				'flex items-stretch',
				'bg-gray-50 dark:bg-gray-800',
				'border-b border-gray-200 dark:border-gray-700',
				stickyHeader && 'sticky top-0 z-10'
			)}
		>
			{#if selectable}
				<div
					class={cn(
						'data-grid-cell data-grid-cell-checkbox',
						'flex items-center justify-center',
						'w-12 min-w-12 px-2',
						compact ? 'py-2' : 'py-3',
						'border-r border-gray-200 dark:border-gray-700'
					)}
				>
					<Checkbox
						checked={allSelected}
						onchange={toggleAllSelection}
						class="grid-checkbox"
					/>
				</div>
			{/if}

			{#each columns as column, colIndex}
				{@const isActionsColumn = column.key === 'actions'}
				{@const isLastColumn = colIndex === columns.length - 1}
				{@const showRefreshInColumn = isActionsColumn && onRefresh}
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class={cn(
						'data-grid-cell data-grid-header-cell',
						'flex items-center gap-2',
						compact ? 'px-3 py-2' : 'px-4 py-3',
						'text-sm font-semibold text-gray-700 dark:text-gray-300',
						'select-none',
						column.align === 'center' && !showRefreshInColumn && 'justify-center text-center',
						column.align === 'right' && 'justify-end text-right',
						showRefreshInColumn && 'justify-between',
						column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
						column.frozen && 'sticky left-0 z-5 bg-gray-50 dark:bg-gray-800',
						(!isLastColumn || (onRefresh && !hasActionsColumn)) && 'border-r border-gray-200 dark:border-gray-700'
					)}
					style:width={column.width}
					style:min-width={column.minWidth || '100px'}
					style:max-width={column.maxWidth}
					style:flex={column.width ? 'none' : '1'}
					onclick={() => handleSort(column)}
					onkeydown={(e) => e.key === 'Enter' && handleSort(column)}
					role={column.sortable ? 'button' : undefined}
					tabindex={column.sortable ? 0 : undefined}
				>
					<div class={cn('flex items-center gap-2', showRefreshInColumn && 'flex-1 justify-center')}>
						{#if column.headerRender}
							{@render column.headerRender()}
						{:else}
							<span class="truncate">{column.header}</span>
						{/if}

						{#if column.sortable}
							<span
								class={cn(
									'flex-shrink-0 text-gray-400',
									sortColumn === column.key && 'text-[var(--color-primary-600)]'
								)}
							>
								{#if sortColumn === column.key}
									{#if sortDirection === 'asc'}
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 15l7-7 7 7"
											/>
										</svg>
									{:else}
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									{/if}
								{:else}
									<svg
										class="w-4 h-4 opacity-50"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
										/>
									</svg>
								{/if}
							</span>
						{/if}
					</div>

					{#if showRefreshInColumn}
						<button
							type="button"
							class={cn(
								'p-1.5 rounded-md flex-shrink-0',
								'text-gray-500 dark:text-gray-400',
								'hover:text-gray-700 dark:hover:text-gray-200',
								'hover:bg-gray-100 dark:hover:bg-gray-700',
								'transition-colors',
								'disabled:opacity-50 disabled:cursor-not-allowed'
							)}
							onclick={(e) => { e.stopPropagation(); onRefresh?.(); }}
							disabled={loading}
							aria-label="重新整理"
						>
							<svg
								class={cn('w-4 h-4', loading && 'animate-spin')}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
						</button>
					{/if}
				</div>
			{/each}

			{#if onRefresh && !hasActionsColumn}
				<div
					class={cn(
						'data-grid-cell data-grid-header-cell',
						'flex items-center justify-center',
						'w-12 min-w-12',
						compact ? 'py-2' : 'py-3'
					)}
				>
					<button
						type="button"
						class={cn(
							'p-1.5 rounded-md',
							'text-gray-500 dark:text-gray-400',
							'hover:text-gray-700 dark:hover:text-gray-200',
							'hover:bg-gray-100 dark:hover:bg-gray-700',
							'transition-colors',
							'disabled:opacity-50 disabled:cursor-not-allowed'
						)}
						onclick={onRefresh}
						disabled={loading}
						aria-label="重新整理"
					>
						<svg
							class={cn('w-4 h-4', loading && 'animate-spin')}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
					</button>
				</div>
			{/if}
		</div>

		<!-- Body -->
		<div class="data-grid-body">
			{#if loading}
				<div
					class={cn(
						'data-grid-loading',
						'flex flex-col items-center justify-center gap-3',
						compact ? 'py-8' : 'py-16',
						'text-gray-500 dark:text-gray-400'
					)}
				>
					<Spinner size="lg" />
					<span class="text-sm">載入中...</span>
				</div>
			{:else if data.length === 0}
				<div
					class={cn(
						'data-grid-empty',
						'flex flex-col items-center justify-center gap-3',
						compact ? 'py-8' : 'py-16',
						'text-gray-500 dark:text-gray-400'
					)}
				>
					{#if emptyIcon}
						{@render emptyIcon()}
					{:else}
						<svg class="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
							/>
						</svg>
					{/if}
					<span class="text-sm">{emptyMessage}</span>
				</div>
			{:else}
				{#each data as row, rowIndex (getRowKey(row, rowIndex))}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						class={cn(
							'data-grid-row',
							'flex items-stretch',
							'border-b border-gray-100 dark:border-gray-800 last:border-b-0',
							striped && rowIndex % 2 === 1 && 'bg-gray-50/50 dark:bg-gray-800/30',
							hoverable && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
							selectable && isRowSelected(row) && 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20',
							(onRowClick || onRowDoubleClick) && 'cursor-pointer',
							'transition-colors duration-150',
							getRowClassName(row, rowIndex)
						)}
						onclick={(e) => handleRowClick(row, rowIndex, e)}
						ondblclick={() => onRowDoubleClick?.(row, rowIndex)}
						role={onRowClick || onRowDoubleClick ? 'button' : undefined}
					>
						{#if selectable}
							<div
								class={cn(
									'data-grid-cell data-grid-cell-checkbox',
									'flex items-center justify-center',
									'w-12 min-w-12 px-2',
									compact ? 'py-2' : 'py-3',
									'border-r border-gray-100 dark:border-gray-800'
								)}
							>
								<Checkbox
									checked={isRowSelected(row)}
									onchange={() => toggleRowSelection(row)}
									class="grid-checkbox"
								/>
							</div>
						{/if}

						{#each columns as column, colIndex}
							{@const isLastColumn = colIndex === columns.length - 1}
							<div
								class={cn(
									'data-grid-cell',
									'flex items-center',
									compact ? 'px-3 py-2' : 'px-4 py-3',
									'text-sm text-gray-900 dark:text-gray-100',
									column.align === 'center' && 'justify-center text-center',
									column.align === 'right' && 'justify-end text-right',
									column.frozen && 'sticky left-0 z-5 bg-white dark:bg-gray-900',
									(!isLastColumn || (onRefresh && !hasActionsColumn)) && 'border-r border-gray-100 dark:border-gray-800'
								)}
								style:width={column.width}
								style:min-width={column.minWidth || '100px'}
								style:max-width={column.maxWidth}
								style:flex={column.width ? 'none' : '1'}
							>
								{#if column.render}
									{@render column.render(row, rowIndex)}
								{:else}
									<span class="truncate">{getCellValue(row, column.key) ?? '-'}</span>
								{/if}
							</div>
						{/each}

						{#if onRefresh && !hasActionsColumn}
							<div
								class={cn(
									'data-grid-cell',
									'w-12 min-w-12',
									compact ? 'py-2' : 'py-3'
								)}
							></div>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
{/if}
