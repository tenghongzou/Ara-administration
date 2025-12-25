<script lang="ts">
	import type { Subscription } from '$lib/types';
	import type { DataGridColumn } from '$lib/types';
	import { DataGrid } from '$lib/components/data-display';
	import { Button, Badge } from '$lib/components/ui';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import { hasPermission } from '$lib/stores/auth';
	import { subscriptionsService } from '../services/subscriptions.service';
	import {
		billingCycleLabels,
		subscriptionStatusLabels,
		subscriptionStatusColors,
		categoryLabels,
		categoryColors
	} from '$lib/services';

	interface Props {
		subscriptions: Subscription[];
		loading?: boolean;
		selectedRows?: Subscription[];
		sortColumn?: string;
		sortDirection?: 'asc' | 'desc';
		onSelectionChange?: (rows: Subscription[]) => void;
		onSort?: (column: string, direction: 'asc' | 'desc') => void;
		onRefresh?: () => void;
		onDelete?: (subscription: Subscription) => void;
	}

	let {
		subscriptions,
		loading = false,
		selectedRows = [],
		sortColumn = '',
		sortDirection = 'asc',
		onSelectionChange,
		onSort,
		onRefresh,
		onDelete
	}: Props = $props();

	const columns: DataGridColumn<Subscription>[] = [
		{
			key: 'name',
			header: '服務',
			minWidth: '200px',
			sortable: true,
			render: nameCell
		},
		{
			key: 'category',
			header: '分類',
			width: '120px',
			sortable: true,
			align: 'center',
			render: categoryCell
		},
		{
			key: 'cost',
			header: '費用',
			width: '120px',
			sortable: true,
			align: 'right',
			render: costCell
		},
		{
			key: 'billingCycle',
			header: '週期',
			width: '100px',
			sortable: true,
			align: 'center',
			render: cycleCell
		},
		{
			key: 'nextBillingDate',
			header: '下次扣款',
			width: '120px',
			sortable: true,
			render: nextBillingCell
		},
		{
			key: 'status',
			header: '狀態',
			width: '100px',
			sortable: true,
			align: 'center',
			render: statusCell
		},
		{
			key: 'actions',
			header: '操作',
			width: '120px',
			align: 'center',
			render: actionsCell
		}
	];
</script>

<div data-testid="subscriptions-table">
	<DataGrid
		data={subscriptions}
		{columns}
		{loading}
		rowKey="id"
		selectable
		{selectedRows}
		{onSelectionChange}
		{sortColumn}
		{sortDirection}
		{onSort}
		{onRefresh}
		striped
		hoverable
		responsiveMode="card"
		cardTitle="name"
		cardSubtitle="category"
		cardBadge="status"
	/>
</div>

{#snippet nameCell(subscription: Subscription)}
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
{/snippet}

{#snippet categoryCell(subscription: Subscription)}
	<span class={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[subscription.category]}`}>
		{categoryLabels[subscription.category]}
	</span>
{/snippet}

{#snippet costCell(subscription: Subscription)}
	<span class="font-medium text-gray-900 dark:text-gray-100">
		{subscriptionsService.formatCurrency(subscription.cost, subscription.currency)}
	</span>
{/snippet}

{#snippet cycleCell(subscription: Subscription)}
	<span class="text-gray-700 dark:text-gray-300">
		{billingCycleLabels[subscription.billingCycle]}
	</span>
{/snippet}

{#snippet nextBillingCell(subscription: Subscription)}
	<span
		class={subscriptionsService.isUpcoming(subscription.nextBillingDate)
			? 'text-orange-600 dark:text-orange-400 font-medium'
			: 'text-gray-600 dark:text-gray-400'}
	>
		{subscriptionsService.formatDate(subscription.nextBillingDate)}
	</span>
{/snippet}

{#snippet statusCell(subscription: Subscription)}
	<Badge variant={subscriptionStatusColors[subscription.status]} size="sm">
		{#snippet children()}{subscriptionStatusLabels[subscription.status]}{/snippet}
	</Badge>
{/snippet}

{#snippet actionsCell(subscription: Subscription)}
	<div class="flex items-center justify-center gap-1">
		{#if hasPermission('subscriptions:update')}
			<Button variant="ghost" size="icon" href="/subscriptions/{subscription.id}">
				{#snippet children()}
					<Pencil class="w-4 h-4" />
				{/snippet}
			</Button>
		{/if}
		{#if hasPermission('subscriptions:delete') && onDelete}
			<Button variant="ghost" size="icon" onclick={() => onDelete(subscription)}>
				{#snippet children()}
					<Trash2 class="w-4 h-4 text-red-500" />
				{/snippet}
			</Button>
		{/if}
	</div>
{/snippet}
