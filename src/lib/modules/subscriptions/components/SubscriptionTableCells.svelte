<script lang="ts" module>
	import type { Subscription } from '$lib/types';
	import { subscriptionsService } from '../services/subscriptions.service';
	import {
		billingCycleLabels,
		subscriptionStatusLabels,
		subscriptionStatusColors,
		categoryLabels,
		categoryColors
	} from '$lib/services';

	export function formatCurrency(amount: number, currency: string = 'TWD'): string {
		return subscriptionsService.formatCurrency(amount, currency);
	}

	export function formatDate(dateString?: string): string {
		return subscriptionsService.formatDate(dateString);
	}

	export function isUpcoming(dateString: string): boolean {
		return subscriptionsService.isUpcoming(dateString);
	}

	export function getCategoryLabel(subscription: Subscription): string {
		return categoryLabels[subscription.category];
	}

	export function getCategoryColor(subscription: Subscription): string {
		return categoryColors[subscription.category];
	}

	export function getStatusLabel(subscription: Subscription): string {
		return subscriptionStatusLabels[subscription.status];
	}

	export function getStatusColor(subscription: Subscription): 'success' | 'default' | 'warning' | 'error' {
		return subscriptionStatusColors[subscription.status];
	}

	export function getBillingCycleLabel(subscription: Subscription): string {
		return billingCycleLabels[subscription.billingCycle];
	}
</script>

<script lang="ts">
	import { Button, Badge } from '$lib/components/ui';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import { userPermissions, checkPermissionInList } from '$lib/stores/auth';

	interface Props {
		subscription: Subscription;
		cellType: 'name' | 'category' | 'cost' | 'cycle' | 'nextBilling' | 'status' | 'actions';
		onEdit?: (subscription: Subscription) => void;
		onDelete?: (subscription: Subscription) => void;
	}

	let { subscription, cellType, onEdit, onDelete }: Props = $props();

	// 響應式權限
	let permissions = $state<readonly string[]>([]);
	$effect(() => {
		const unsubscribe = userPermissions.subscribe((p) => {
			permissions = p;
		});
		return unsubscribe;
	});

	const canUpdate = $derived(checkPermissionInList(permissions, 'subscriptions:update'));
	const canDelete = $derived(checkPermissionInList(permissions, 'subscriptions:delete'));
</script>

{#if cellType === 'name'}
	<div class="flex items-center gap-3">
		<div
			class="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center flex-shrink-0 font-bold text-gray-600 dark:text-gray-300"
		>
			{subscription.name.charAt(0).toUpperCase()}
		</div>
		<div class="min-w-0">
			<p class="font-medium text-gray-900 dark:text-gray-100 truncate">{subscription.name}</p>
			{#if subscription.description}
				<p class="text-xs text-gray-500 dark:text-gray-400 truncate">{subscription.description}</p>
			{/if}
		</div>
	</div>
{:else if cellType === 'category'}
	<span class={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(subscription)}`}>
		{getCategoryLabel(subscription)}
	</span>
{:else if cellType === 'cost'}
	<span class="font-medium text-gray-900 dark:text-gray-100">
		{formatCurrency(subscription.cost, subscription.currency)}
	</span>
{:else if cellType === 'cycle'}
	<span class="text-gray-700 dark:text-gray-300">
		{getBillingCycleLabel(subscription)}
	</span>
{:else if cellType === 'nextBilling'}
	<span
		class={isUpcoming(subscription.nextBillingDate)
			? 'text-orange-600 dark:text-orange-400 font-medium'
			: 'text-gray-600 dark:text-gray-400'}
	>
		{formatDate(subscription.nextBillingDate)}
	</span>
{:else if cellType === 'status'}
	<Badge variant={getStatusColor(subscription)} size="sm">
		{#snippet children()}{getStatusLabel(subscription)}{/snippet}
	</Badge>
{:else if cellType === 'actions'}
	<div class="flex items-center justify-center gap-1">
		{#if canUpdate}
			<Button variant="ghost" size="icon" href="/subscriptions/{subscription.id}">
				{#snippet children()}
					<Pencil class="w-4 h-4" />
				{/snippet}
			</Button>
		{/if}
		{#if canDelete && onDelete}
			<Button variant="ghost" size="icon" onclick={() => onDelete(subscription)}>
				{#snippet children()}
					<Trash2 class="w-4 h-4 text-red-500" />
				{/snippet}
			</Button>
		{/if}
	</div>
{/if}
