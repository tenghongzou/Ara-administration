<script lang="ts">
	import { Button, Input, Select } from '$lib/components/ui';
	import type { SubscriptionFilters } from '../types';
	import { categoryOptions, statusOptions, billingCycleOptions } from '../types';

	interface Props {
		filters: SubscriptionFilters;
		onSearch: () => void;
		onFiltersChange?: (filters: SubscriptionFilters) => void;
	}

	let { filters = $bindable(), onSearch, onFiltersChange }: Props = $props();

	function handleFilterChange() {
		onFiltersChange?.(filters);
	}
</script>

<div
	class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
	data-testid="subscriptions-filters"
>
	<div class="flex flex-col lg:flex-row gap-4">
		<div class="flex-1">
			<Input
				bind:value={filters.search}
				placeholder="搜尋訂閱服務名稱..."
				onchange={() => {
					handleFilterChange();
					onSearch();
				}}
				id="subscription-search"
			/>
		</div>
		<div class="flex flex-wrap gap-2">
			<div class="w-32">
				<Select
					bind:value={filters.category}
					options={categoryOptions}
					placeholder="分類"
					onchange={() => {
						handleFilterChange();
						onSearch();
					}}
				/>
			</div>
			<div class="w-32">
				<Select
					bind:value={filters.status}
					options={statusOptions}
					placeholder="狀態"
					onchange={() => {
						handleFilterChange();
						onSearch();
					}}
				/>
			</div>
			<div class="w-32">
				<Select
					bind:value={filters.billingCycle}
					options={billingCycleOptions}
					placeholder="週期"
					onchange={() => {
						handleFilterChange();
						onSearch();
					}}
				/>
			</div>
			<Button variant="outline" onclick={onSearch}>
				{#snippet children()}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					搜尋
				{/snippet}
			</Button>
		</div>
	</div>
</div>
