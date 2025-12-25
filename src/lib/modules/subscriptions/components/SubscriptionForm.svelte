<script lang="ts">
	import type { SubscriptionFormData, SubscriptionFormErrors } from '../types';
	import {
		categoryOptions,
		statusOptions,
		billingCycleOptions,
		currencyOptions,
		paymentMethodOptions
	} from '../types';
	import { Card, Input, Select, Checkbox, Button } from '$lib/components/ui';

	interface Props {
		formData: SubscriptionFormData;
		errors: SubscriptionFormErrors;
		saving: boolean;
		submitLabel?: string;
		onsubmit: (data: SubscriptionFormData) => void;
		oncancel: () => void;
	}

	let {
		formData = $bindable(),
		errors,
		saving,
		submitLabel = '儲存',
		onsubmit,
		oncancel
	}: Props = $props();

	// Filter options for form (remove "all" option)
	const formCategoryOptions = categoryOptions.filter((o) => o.value !== '');
	const formStatusOptions = statusOptions.filter(
		(o) => o.value !== '' && o.value !== 'cancelled' && o.value !== 'expired'
	);
	const formBillingCycleOptions = billingCycleOptions.filter((o) => o.value !== '');

	function handleSubmit(event: Event) {
		event.preventDefault();
		onsubmit(formData);
	}
</script>

<form onsubmit={handleSubmit}>
	<div class="space-y-6">
		<!-- Basic Info -->
		<Card>
			{#snippet children()}
				<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">基本資訊</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="md:col-span-2">
						<Input
							bind:value={formData.name}
							label="服務名稱"
							placeholder="例如：Netflix、Spotify"
							required
							error={errors.name}
							disabled={saving}
						/>
					</div>
					<Select
						bind:value={formData.category}
						options={formCategoryOptions}
						label="分類"
						required
						disabled={saving}
					/>
					<Select
						bind:value={formData.status}
						options={formStatusOptions}
						label="狀態"
						required
						disabled={saving}
					/>
					<div>
						<Input
							bind:value={formData.cost}
							type="number"
							label="費用"
							placeholder="0"
							required
							error={errors.cost}
							disabled={saving}
							min="0"
							step="1"
						/>
					</div>
					<Select
						bind:value={formData.currency}
						options={currencyOptions}
						label="貨幣"
						required
						disabled={saving}
					/>
					<Select
						bind:value={formData.billingCycle}
						options={formBillingCycleOptions}
						label="計費週期"
						required
						disabled={saving}
					/>
					<Input
						bind:value={formData.nextBillingDate}
						type="date"
						label="下次扣款日"
						required
						error={errors.nextBillingDate}
						disabled={saving}
					/>
				</div>
			{/snippet}
		</Card>

		<!-- Account & Payment -->
		<Card>
			{#snippet children()}
				<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">帳戶與付款</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Input
						bind:value={formData.accountEmail}
						type="email"
						label="帳號 Email"
						placeholder="user@example.com"
						error={errors.accountEmail}
						disabled={saving}
					/>
					<Select
						bind:value={formData.paymentMethod}
						options={paymentMethodOptions}
						label="付款方式"
						disabled={saving}
					/>
					<Input
						bind:value={formData.website}
						label="官網連結"
						placeholder="https://..."
						error={errors.website}
						disabled={saving}
					/>
					<Input
						bind:value={formData.reminderDays}
						type="number"
						label="提前提醒天數"
						placeholder="例如：3"
						disabled={saving}
						min="0"
						max="30"
					/>
				</div>
				<div class="mt-4">
					<Checkbox bind:checked={formData.autoRenew} label="自動續訂" disabled={saving} />
				</div>
			{/snippet}
		</Card>

		<!-- Notes -->
		<Card>
			{#snippet children()}
				<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">備註</h3>
				<div>
					<label
						for="description"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>
						描述
					</label>
					<textarea
						id="description"
						bind:value={formData.description}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
						rows="3"
						placeholder="輸入備註..."
						disabled={saving}
					></textarea>
				</div>
			{/snippet}
		</Card>

		<!-- Actions -->
		<div class="flex justify-end gap-3">
			<Button variant="outline" onclick={oncancel} disabled={saving}>
				{#snippet children()}取消{/snippet}
			</Button>
			<Button type="submit" loading={saving}>
				{#snippet children()}{submitLabel}{/snippet}
			</Button>
		</div>
	</div>
</form>
