<script lang="ts">
	import { Card, Badge } from '$lib/components/ui';
	import type { PaymentHistory } from '$lib/types';
	import { subscriptionsService } from '../services/subscriptions.service';

	interface Props {
		payments: PaymentHistory[];
		class?: string;
	}

	let { payments, class: className = '' }: Props = $props();

	function getStatusVariant(status: string): 'success' | 'warning' | 'error' {
		switch (status) {
			case 'paid':
				return 'success';
			case 'pending':
				return 'warning';
			default:
				return 'error';
		}
	}

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'paid':
				return '已付款';
			case 'pending':
				return '待處理';
			default:
				return '失敗';
		}
	}
</script>

{#if payments.length > 0}
	<Card class={className}>
		{#snippet children()}
			<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">付款紀錄</h3>
			<div class="space-y-3">
				{#each payments as payment}
					<div
						class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
					>
						<div>
							<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
								{subscriptionsService.formatCurrency(payment.amount, payment.currency)}
							</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">
								{subscriptionsService.formatDate(payment.paidAt)}
							</p>
						</div>
						<Badge variant={getStatusVariant(payment.status)} size="sm">
							{#snippet children()}
								{getStatusLabel(payment.status)}
							{/snippet}
						</Badge>
					</div>
				{/each}
			</div>
		{/snippet}
	</Card>
{/if}
