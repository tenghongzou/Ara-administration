<script lang="ts">
	import type { FieldMapping } from '$lib/utils/csv-parser';
	import { Card } from '$lib/components/ui';
	import { ArrowRight, Check, X } from 'lucide-svelte';

	interface Props {
		headers: string[];
		mapping: FieldMapping;
		onMappingChange: (mapping: FieldMapping) => void;
	}

	let { headers, mapping, onMappingChange }: Props = $props();

	const fieldLabels: Record<keyof FieldMapping, { label: string; required: boolean }> = {
		name: { label: '服務名稱', required: true },
		category: { label: '分類', required: false },
		cost: { label: '費用', required: true },
		currency: { label: '幣別', required: false },
		billingCycle: { label: '計費週期', required: false },
		nextBillingDate: { label: '下次扣款日', required: true },
		status: { label: '狀態', required: false },
		description: { label: '描述', required: false },
		website: { label: '網站', required: false },
		accountEmail: { label: '帳號信箱', required: false },
		paymentMethod: { label: '付款方式', required: false },
		autoRenew: { label: '自動續訂', required: false },
		reminderDays: { label: '提醒天數', required: false }
	};

	function updateMapping(field: keyof FieldMapping, value: string | null) {
		const newMapping = { ...mapping, [field]: value };
		onMappingChange(newMapping);
	}

	let requiredFieldsMapped = $derived(
		Object.entries(fieldLabels)
			.filter(([_, config]) => config.required)
			.every(([field]) => mapping[field as keyof FieldMapping] !== null)
	);
</script>

<Card variant="bordered" class="p-4">
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">欄位對應</h3>
		{#if requiredFieldsMapped}
			<span class="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
				<Check class="w-4 h-4" />
				必填欄位已對應
			</span>
		{:else}
			<span class="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
				<X class="w-4 h-4" />
				請對應必填欄位
			</span>
		{/if}
	</div>

	<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
		請將您的 CSV/Excel 欄位對應到系統欄位。標示 <span class="text-red-500">*</span> 為必填欄位。
	</p>

	<div class="space-y-3">
		{#each Object.entries(fieldLabels) as [field, config]}
			{@const currentValue = mapping[field as keyof FieldMapping]}
			<div class="flex items-center gap-3">
				<div class="w-32 flex-shrink-0">
					<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
						{config.label}
						{#if config.required}
							<span class="text-red-500">*</span>
						{/if}
					</span>
				</div>

				<ArrowRight class="w-4 h-4 text-gray-400 flex-shrink-0" />

				<select
					class="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent"
					value={currentValue ?? ''}
					onchange={(e) => {
						const value = e.currentTarget.value;
						updateMapping(field as keyof FieldMapping, value || null);
					}}
				>
					<option value="">-- 不對應 --</option>
					{#each headers as header}
						<option value={header}>{header}</option>
					{/each}
				</select>

				{#if currentValue}
					<button
						type="button"
						onclick={() => updateMapping(field as keyof FieldMapping, null)}
						class="p-1 text-gray-400 hover:text-red-500 transition-colors"
						title="清除對應"
					>
						<X class="w-4 h-4" />
					</button>
				{/if}
			</div>
		{/each}
	</div>
</Card>
