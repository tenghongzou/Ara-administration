<script lang="ts">
	import { Spinner } from '$lib/components/ui';
	import type { Subscription, PaymentHistory } from '$lib/types';
	import type { SubscriptionFormData, SubscriptionFormErrors } from '../types';
	import SubscriptionInfoCard from './SubscriptionInfoCard.svelte';
	import PaymentHistoryList from './PaymentHistoryList.svelte';
	import SubscriptionForm from './SubscriptionForm.svelte';

	interface Props {
		subscription: Subscription | null;
		paymentHistory: PaymentHistory[];
		loading?: boolean;
		saving?: boolean;
		formData: SubscriptionFormData;
		errors: SubscriptionFormErrors;
		onSubmit: (data: SubscriptionFormData) => void;
		onCancel: () => void;
	}

	let {
		subscription,
		paymentHistory,
		loading = false,
		saving = false,
		formData = $bindable(),
		errors,
		onSubmit,
		onCancel
	}: Props = $props();
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-[400px]">
		<Spinner size="lg" />
	</div>
{:else if subscription}
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="space-y-6">
			<SubscriptionInfoCard {subscription} />
			{#if paymentHistory.length > 0}
				<PaymentHistoryList payments={paymentHistory} />
			{/if}
		</div>

		<div class="lg:col-span-2">
			<SubscriptionForm
				bind:formData
				{errors}
				{saving}
				submitLabel="儲存變更"
				onsubmit={onSubmit}
				oncancel={onCancel}
			/>
		</div>
	</div>
{/if}
