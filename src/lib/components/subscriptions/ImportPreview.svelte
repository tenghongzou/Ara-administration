<script lang="ts">
	import type { MappedSubscription } from '$lib/utils/csv-parser';
	import { categoryLabels, billingCycleLabels } from '$lib/constants';
	import { Card, Badge } from '$lib/components/ui';
	import { CheckCircle, XCircle, AlertTriangle, Copy } from 'lucide-svelte';

	interface Props {
		subscriptions: MappedSubscription[];
		duplicateRows: Set<number>;
		selectedRows: Set<number>;
		onSelectionChange: (selected: Set<number>) => void;
	}

	let { subscriptions, duplicateRows, selectedRows, onSelectionChange }: Props = $props();

	function toggleRow(row: number) {
		const newSelected = new Set(selectedRows);
		if (newSelected.has(row)) {
			newSelected.delete(row);
		} else {
			newSelected.add(row);
		}
		onSelectionChange(newSelected);
	}

	function toggleAll() {
		const validRows = subscriptions.filter((s) => s.errors.length === 0).map((s) => s.row);
		const allSelected = validRows.every((row) => selectedRows.has(row));

		if (allSelected) {
			onSelectionChange(new Set());
		} else {
			onSelectionChange(new Set(validRows));
		}
	}

	function formatCurrency(amount: number, currency: string = 'TWD'): string {
		return new Intl.NumberFormat('zh-TW', {
			style: 'currency',
			currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	let validCount = $derived(subscriptions.filter((s) => s.errors.length === 0).length);
	let errorCount = $derived(subscriptions.filter((s) => s.errors.length > 0).length);
	let duplicateCount = $derived(duplicateRows.size);
</script>

<Card variant="bordered" class="overflow-hidden">
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">匯入預覽</h3>
			<div class="flex items-center gap-4 text-sm">
				<span class="flex items-center gap-1 text-green-600 dark:text-green-400">
					<CheckCircle class="w-4 h-4" />
					{validCount} 筆有效
				</span>
				{#if errorCount > 0}
					<span class="flex items-center gap-1 text-red-600 dark:text-red-400">
						<XCircle class="w-4 h-4" />
						{errorCount} 筆錯誤
					</span>
				{/if}
				{#if duplicateCount > 0}
					<span class="flex items-center gap-1 text-amber-600 dark:text-amber-400">
						<Copy class="w-4 h-4" />
						{duplicateCount} 筆重複
					</span>
				{/if}
			</div>
		</div>

		<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
			已選擇 {selectedRows.size} 筆資料進行匯入
		</p>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full text-sm">
			<thead class="bg-gray-50 dark:bg-gray-800">
				<tr>
					<th class="px-4 py-3 text-left">
						<input
							type="checkbox"
							checked={validCount > 0 && subscriptions.filter((s) => s.errors.length === 0).every((s) => selectedRows.has(s.row))}
							onchange={toggleAll}
							class="rounded border-gray-300 dark:border-gray-600 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
						/>
					</th>
					<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">列</th>
					<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">狀態</th>
					<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">名稱</th>
					<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">分類</th>
					<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">費用</th>
					<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">週期</th>
					<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">下次扣款</th>
					<th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">問題</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
				{#each subscriptions as sub}
					{@const hasErrors = sub.errors.length > 0}
					{@const isDuplicate = duplicateRows.has(sub.row)}
					{@const isSelected = selectedRows.has(sub.row)}
					<tr
						class={[
							'transition-colors',
							hasErrors ? 'bg-red-50 dark:bg-red-900/10' : '',
							isDuplicate && !hasErrors ? 'bg-amber-50 dark:bg-amber-900/10' : '',
							isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''
						].filter(Boolean).join(' ')}
					>
						<td class="px-4 py-3">
							<input
								type="checkbox"
								checked={isSelected}
								disabled={hasErrors}
								onchange={() => toggleRow(sub.row)}
								class="rounded border-gray-300 dark:border-gray-600 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] disabled:opacity-50"
							/>
						</td>
						<td class="px-4 py-3 text-gray-600 dark:text-gray-400">{sub.row}</td>
						<td class="px-4 py-3">
							{#if hasErrors}
								<Badge variant="danger">錯誤</Badge>
							{:else if isDuplicate}
								<Badge variant="warning">重複</Badge>
							{:else}
								<Badge variant="success">有效</Badge>
							{/if}
						</td>
						<td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
							{sub.data.name}
						</td>
						<td class="px-4 py-3 text-gray-600 dark:text-gray-400">
							{categoryLabels[sub.data.category] || sub.data.category}
						</td>
						<td class="px-4 py-3 text-gray-900 dark:text-gray-100">
							{formatCurrency(sub.data.cost, sub.data.currency)}
						</td>
						<td class="px-4 py-3 text-gray-600 dark:text-gray-400">
							{billingCycleLabels[sub.data.billingCycle] || sub.data.billingCycle}
						</td>
						<td class="px-4 py-3 text-gray-600 dark:text-gray-400">
							{sub.data.nextBillingDate}
						</td>
						<td class="px-4 py-3">
							{#if hasErrors}
								<div class="space-y-1">
									{#each sub.errors as error}
										<p class="text-xs text-red-600 dark:text-red-400">
											{error.message}
										</p>
									{/each}
								</div>
							{:else if sub.warnings.length > 0}
								<div class="space-y-1">
									{#each sub.warnings as warning}
										<p class="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1">
											<AlertTriangle class="w-3 h-3 flex-shrink-0 mt-0.5" />
											{warning}
										</p>
									{/each}
								</div>
							{:else}
								<span class="text-gray-400">-</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</Card>
