<script lang="ts">
	import type { Subscription } from '$lib/types';
	import { subscriptionsService } from '../services/subscriptions.service';
	import { Card, Badge } from '$lib/components/ui';
	import { ExternalLink } from 'lucide-svelte';

	interface Props {
		subscription: Subscription;
	}

	let { subscription }: Props = $props();
</script>

<Card>
	{#snippet children()}
		<div class="text-center">
			<div
				class="w-20 h-20 mx-auto rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-3xl font-bold text-gray-600 dark:text-gray-300 mb-4"
			>
				{subscription.name.charAt(0).toUpperCase()}
			</div>
			<h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
				{subscription.name}
			</h3>
			<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
				{subscriptionsService.getCategoryLabel(subscription.category)}
			</p>
			<div class="mt-3">
				<Badge variant={subscription.status === 'active' ? 'success' : subscription.status === 'paused' ? 'warning' : 'error'}>
					{#snippet children()}{subscriptionsService.getStatusLabel(subscription.status)}{/snippet}
				</Badge>
			</div>
		</div>

		<div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
			<div class="flex justify-between">
				<span class="text-sm text-gray-500 dark:text-gray-400">費用</span>
				<span class="text-sm font-medium text-gray-900 dark:text-gray-100">
					{subscriptionsService.formatCurrency(subscription.cost, subscription.currency)} / {subscriptionsService.getBillingCycleLabel(subscription.billingCycle)}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-gray-500 dark:text-gray-400">下次扣款</span>
				<span class="text-sm font-medium text-gray-900 dark:text-gray-100">
					{subscriptionsService.formatDate(subscription.nextBillingDate)}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-gray-500 dark:text-gray-400">自動續訂</span>
				<span class="text-sm font-medium text-gray-900 dark:text-gray-100">
					{subscription.autoRenew ? '是' : '否'}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-gray-500 dark:text-gray-400">建立時間</span>
				<span class="text-sm text-gray-600 dark:text-gray-400">
					{subscriptionsService.formatDate(subscription.createdAt)}
				</span>
			</div>
			{#if subscription.website}
				<div class="pt-2">
					<a
						href={subscription.website}
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-[var(--color-primary-600)] hover:underline flex items-center gap-1"
					>
						<ExternalLink class="w-4 h-4" />
						前往官網
					</a>
				</div>
			{/if}
		</div>
	{/snippet}
</Card>
