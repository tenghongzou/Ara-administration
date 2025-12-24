<script lang="ts">
	import { Card, Select, Input, Button } from '$lib/components/ui';
	import type { LogFilters } from '../types';
	import { actionOptions, resourceOptions, statusOptions } from '../services/logs.service';

	interface Props {
		filters: LogFilters;
		onFilterChange: (filters: LogFilters) => void;
		showAdvanced?: boolean;
	}

	let { filters, onFilterChange, showAdvanced = false }: Props = $props();

	let localFilters = $state<LogFilters>({
		action: filters.action || '',
		resource: filters.resource || '',
		status: filters.status || '',
		search: filters.search || '',
		dateRange: filters.dateRange
	});
	let showDateRange = $state(showAdvanced);

	// 當顯示日期篩選時初始化 dateRange
	function toggleDateRange() {
		showDateRange = !showDateRange;
		if (showDateRange && !localFilters.dateRange) {
			const today = new Date().toISOString().split('T')[0];
			const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
			localFilters.dateRange = { start: lastMonth, end: today };
		}
	}

	// 將選項格式轉換為 Select 組件需要的格式
	const actionSelectOptions = actionOptions.map((opt) => ({
		value: opt.value,
		label: opt.label
	}));

	const resourceSelectOptions = resourceOptions.map((opt) => ({
		value: opt.value,
		label: opt.label
	}));

	const statusSelectOptions = statusOptions.map((opt) => ({
		value: opt.value,
		label: opt.label
	}));

	function handleChange() {
		onFilterChange(localFilters);
	}

	function handleClear() {
		localFilters = {
			action: '',
			resource: '',
			status: '',
			search: '',
			dateRange: undefined
		};
		showDateRange = false;
		onFilterChange(localFilters);
	}

</script>

<Card variant="bordered" role="region" aria-label="篩選條件">
	{#snippet children()}
		<div class="space-y-4">
			<!-- 基本篩選 -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Select
					label="操作類型"
					options={actionSelectOptions}
					bind:value={localFilters.action}
					onchange={handleChange}
				/>
				<Select
					label="資源類型"
					options={resourceSelectOptions}
					bind:value={localFilters.resource}
					onchange={handleChange}
				/>
				<Select
					label="狀態"
					options={statusSelectOptions}
					bind:value={localFilters.status}
					onchange={handleChange}
				/>
				<div>
					<Input
						label="搜尋"
						placeholder="使用者、IP、詳情..."
						bind:value={localFilters.search}
						onchange={handleChange}
					/>
				</div>
			</div>

			<!-- 進階篩選切換 -->
			<div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
				<button
					type="button"
					class="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] font-medium"
					onclick={toggleDateRange}
				>
					{showDateRange ? '隱藏進階篩選' : '顯示進階篩選'}
				</button>
				<Button variant="ghost" size="sm" onclick={handleClear}>
					{#snippet children()}清除篩選{/snippet}
				</Button>
			</div>

			<!-- 日期範圍篩選 -->
			{#if showDateRange && localFilters.dateRange}
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
					<Input
						type="date"
						label="開始日期"
						bind:value={localFilters.dateRange.start}
						onchange={handleChange}
					/>
					<Input
						type="date"
						label="結束日期"
						bind:value={localFilters.dateRange.end}
						onchange={handleChange}
					/>
				</div>
			{/if}
		</div>
	{/snippet}
</Card>
