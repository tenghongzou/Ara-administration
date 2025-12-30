<script lang="ts">
	import type { Subscription } from '$lib/types';
	import { subscriptionsService } from '../services/subscriptions.service';
	import { Modal } from '$lib/components/ui';
	import { ExternalLink } from 'lucide-svelte';

	interface Props {
		open: boolean;
		date: string | null;
		subscriptions: Subscription[];
		totalAmount?: number;
		onClose: () => void;
	}

	let { open = $bindable(), date, subscriptions, totalAmount, onClose }: Props = $props();

	// 計算總金額（使用後端傳回的 totalAmount 或前端計算）
	let displayTotal = $derived(
		totalAmount !== undefined
			? subscriptionsService.formatCurrency(totalAmount)
			: subscriptionsService.formatCurrency(
					subscriptions.reduce((sum, s) => sum + s.cost, 0)
				)
	);
</script>

<Modal bind:open title={date ? subscriptionsService.formatFullDate(date) : ''} size="md" {onClose}>
	{#snippet children()}
		{#if subscriptions.length > 0}
			<div class="space-y-3">
				<div
					class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700"
				>
					<span>共 {subscriptions.length} 筆訂閱</span>
					<span>總計 {displayTotal}</span>
				</div>

				{#each subscriptions as subscription}
					<a
						href="/subscriptions/{subscription.id}"
						class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
							>
								<span class="text-lg font-medium text-gray-600 dark:text-gray-400">
									{subscription.name.charAt(0)}
								</span>
							</div>
							<div>
								<p class="font-medium text-gray-900 dark:text-gray-100">
									{subscription.name}
								</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">
									{subscriptionsService.getCategoryLabel(subscription.category)}
								</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<span class="font-medium text-gray-900 dark:text-gray-100">
								{subscriptionsService.formatCurrency(subscription.cost, subscription.currency)}
							</span>
							<ExternalLink class="w-4 h-4 text-gray-400" />
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<p class="text-center text-gray-500 dark:text-gray-400 py-4">此日期無訂閱扣款</p>
		{/if}
	{/snippet}
</Modal>
