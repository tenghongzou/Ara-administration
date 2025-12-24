<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface Column<T> {
		key: keyof T | string;
		header: string;
		sortable?: boolean;
		width?: string;
		align?: 'left' | 'center' | 'right';
		render?: Snippet<[T]>;
	}

	interface Props {
		data: T[];
		columns: Column<T>[];
		loading?: boolean;
		emptyMessage?: string;
		sortColumn?: string;
		sortDirection?: 'asc' | 'desc';
		onSort?: (column: string, direction: 'asc' | 'desc') => void;
		onRowClick?: (row: T) => void;
		class?: string;
	}

	let {
		data,
		columns,
		loading = false,
		emptyMessage = '沒有資料',
		sortColumn,
		sortDirection = 'asc',
		onSort,
		onRowClick,
		class: className = ''
	}: Props = $props();

	function handleSort(column: Column<T>) {
		if (!column.sortable || !onSort) return;

		const key = column.key as string;
		const newDirection = sortColumn === key && sortDirection === 'asc' ? 'desc' : 'asc';
		onSort(key, newDirection);
	}

	function getCellValue(row: T, key: keyof T | string): unknown {
		return row[key as keyof T];
	}
</script>

<div class={cn('overflow-x-auto', className)}>
	<table class="w-full text-sm">
		<thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
			<tr>
				{#each columns as column}
					<th
						class={cn(
							'px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-left',
							column.align === 'center' && 'text-center',
							column.align === 'right' && 'text-right',
							column.sortable &&
								'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700'
						)}
						style={column.width ? `width: ${column.width}` : undefined}
						onclick={() => handleSort(column)}
					>
						<div
							class="flex items-center gap-2"
							class:justify-center={column.align === 'center'}
							class:justify-end={column.align === 'right'}
						>
							{column.header}
							{#if column.sortable}
								<span class="text-gray-400">
									{#if sortColumn === column.key}
										{sortDirection === 'asc' ? '↑' : '↓'}
									{:else}
										↕
									{/if}
								</span>
							{/if}
						</div>
					</th>
				{/each}
			</tr>
		</thead>

		<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
			{#if loading}
				<tr>
					<td colspan={columns.length} class="px-4 py-12 text-center">
						<div class="flex items-center justify-center gap-2 text-gray-500">
							<Spinner size="sm" />
							載入中...
						</div>
					</td>
				</tr>
			{:else if data.length === 0}
				<tr>
					<td
						colspan={columns.length}
						class="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
					>
						{emptyMessage}
					</td>
				</tr>
			{:else}
				{#each data as row}
					<tr
						class={cn(
							'bg-white dark:bg-gray-900',
							'hover:bg-gray-50 dark:hover:bg-gray-800',
							onRowClick && 'cursor-pointer'
						)}
						onclick={() => onRowClick?.(row)}
					>
						{#each columns as column}
							<td
								class={cn(
									'px-4 py-3 text-gray-900 dark:text-gray-100',
									column.align === 'center' && 'text-center',
									column.align === 'right' && 'text-right'
								)}
							>
								{#if column.render}
									{@render column.render(row)}
								{:else}
									{getCellValue(row, column.key)}
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
