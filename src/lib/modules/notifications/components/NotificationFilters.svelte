<script lang="ts">
	import { Input, Button } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import type { NotificationFilters, NotificationCategory, NotificationStatus } from '../types';
	import { categoryOptions } from '../services/notifications.service';

	interface Props {
		filters: NotificationFilters;
		totalCount: number;
		unreadCount: number;
		categoryCounts: Record<NotificationCategory, number>;
		onFilterChange: (filters: NotificationFilters) => void;
	}

	let { filters, totalCount, unreadCount, categoryCounts, onFilterChange }: Props = $props();

	function updateCategory(category: NotificationCategory) {
		onFilterChange({ ...filters, category });
	}

	function updateStatus(status: NotificationStatus) {
		onFilterChange({ ...filters, status });
	}

	function updateSearch(search: string) {
		onFilterChange({ ...filters, search });
	}

	function clearSearch() {
		onFilterChange({ ...filters, search: '' });
	}
</script>

<div class="space-y-4">
	<!-- 搜尋框 -->
	<div class="relative">
		<Input
			type="search"
			placeholder="搜尋通知..."
			value={filters.search ?? ''}
			oninput={(e) => {
				const target = e.currentTarget as HTMLInputElement;
				updateSearch(target.value);
			}}
		/>
		{#if filters.search}
			<button
				type="button"
				class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
				onclick={clearSearch}
			>
				✕
			</button>
		{/if}
	</div>

	<!-- 分類篩選 -->
	<div class="flex flex-wrap gap-2" role="tablist" aria-label="通知分類">
		{#each categoryOptions as option}
			{@const count = categoryCounts[option.value] ?? 0}
			<button
				type="button"
				role="tab"
				aria-selected={filters.category === option.value}
				class={cn(
					'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5',
					filters.category === option.value
						? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)]/30 dark:text-[var(--color-primary-300)]'
						: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
				)}
				onclick={() => updateCategory(option.value)}
			>
				<span>{option.icon}</span>
				<span>{option.label}</span>
				<span class="text-xs opacity-70">({count})</span>
			</button>
		{/each}
	</div>

	<!-- 狀態篩選 -->
	<div class="flex gap-2 border-t border-gray-100 dark:border-gray-800 pt-4" role="tablist" aria-label="通知狀態">
		<button
			type="button"
			role="tab"
			aria-selected={filters.status === 'all'}
			class={cn(
				'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
				filters.status === 'all'
					? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)]/30 dark:text-[var(--color-primary-300)]'
					: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
			)}
			onclick={() => updateStatus('all')}
		>
			全部 ({totalCount})
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={filters.status === 'unread'}
			class={cn(
				'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
				filters.status === 'unread'
					? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)]/30 dark:text-[var(--color-primary-300)]'
					: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
			)}
			onclick={() => updateStatus('unread')}
		>
			未讀 ({unreadCount})
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={filters.status === 'read'}
			class={cn(
				'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
				filters.status === 'read'
					? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)]/30 dark:text-[var(--color-primary-300)]'
					: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
			)}
			onclick={() => updateStatus('read')}
		>
			已讀 ({totalCount - unreadCount})
		</button>
	</div>
</div>
