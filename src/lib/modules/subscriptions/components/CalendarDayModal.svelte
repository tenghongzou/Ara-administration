<script lang="ts">
	import type { Subscription } from '$lib/types';
	import { subscriptionsService } from '../services/subscriptions.service';
	import { Modal } from '$lib/components/ui';
	import { ExternalLink } from 'lucide-svelte';

	interface Props {
		open: boolean;
		date: string | null;
		subscriptions: Subscription[];
		onClose: () => void;
	}

	let { open = $bindable(), date, subscriptions, onClose }: Props = $props();

	let totalsByCurrency = $derived(
		subscriptions.reduce(
			(acc, s) => {
				acc[s.currency] = (acc[s.currency] ?? 0) + s.cost;
				return acc;
			},
			{} as Record<string, number>
		)
	);

	let formattedTotals = $derived(subscriptionsService.formatMultiCurrency(totalsByCurrency));
</script>

<Modal bind:open title={date ? subscriptionsService.formatFullDate(date) : ''} size="md" {onClose}>
	{#snippet children()}
		{#if subscriptions.length > 0}
			<div class="space-y-3">
				<div
					class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700"
				>
					<span>共 {subscriptions.length} 筆訂閱</span>
					<span>
						總計
						{#each formattedTotals as total, i}
							{#if i > 0} / {/if}{total}
						{/each}
					</span>
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
