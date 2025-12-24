<script lang="ts">
	import { config } from '$lib/constants';
	import {
		categoryOptions,
		subscriptionStatusOptions,
		billingCycleOptions
	} from '$lib/constants';
	import {
		subscriptionsApi,
		billingCycleLabels,
		subscriptionStatusLabels,
		subscriptionStatusColors,
		categoryLabels,
		categoryColors
	} from '$lib/services';
	import type { Subscription, SubscriptionStats, BillingCycle } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Button, Badge, Input, Select, Card, ConfirmModal } from '$lib/components/ui';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import { DataGrid, Pagination } from '$lib/components/data-display';
	import { PermissionGuard } from '$lib/components/auth';
	import type { DataGridColumn } from '$lib/types';
	import { exportToCSV, getExportFilename } from '$lib/utils';
	import { hasPermission } from '$lib/stores/auth';

	let subscriptions = $state<Subscription[]>([]);
	let stats = $state<SubscriptionStats | null>(null);
	let loading = $state(true);
	let page = $state(1);
	let pageSize = $state(10);
	let total = $state(0);
	let search = $state('');
	let categoryFilter = $state('');
	let statusFilter = $state('');
	let cycleFilter = $state('');
	let sortColumn = $state('');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let selectedSubscriptions = $state<Subscription[]>([]);

	let showDeleteModal = $state(false);
	let subscriptionToDelete = $state<Subscription | null>(null);
	let deleting = $state(false);

	let showBatchDeleteModal = $state(false);
	let batchDeleting = $state(false);

	// 使用從 constants 匯入的選項
	const statusOptions = subscriptionStatusOptions;
	const cycleOptions = billingCycleOptions;

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

	async function loadSubscriptions() {
		loading = true;
		try {
			const [response, statsResponse] = await Promise.all([
				subscriptionsApi.getSubscriptions({
					page,
					pageSize,
					search,
					category: categoryFilter,
					status: statusFilter,
					billingCycle: cycleFilter,
					sortBy: sortColumn,
					sortDirection
				}),
				subscriptionsApi.getStatistics()
			]);
			subscriptions = response.data;
			total = response.pagination.total;
			stats = statsResponse;
		} catch (error) {
			toast.error('載入訂閱資料失敗');
		} finally {
			loading = false;
		}
	}

	function handleSort(column: string, direction: 'asc' | 'desc') {
		sortColumn = column;
		sortDirection = direction;
		loadSubscriptions();
	}

	function handlePageChange(newPage: number) {
		page = newPage;
		selectedSubscriptions = [];
		loadSubscriptions();
	}

	function handlePageSizeChange(newPageSize: number) {
		pageSize = newPageSize;
		page = 1;
		selectedSubscriptions = [];
		loadSubscriptions();
	}

	function handleSearch() {
		page = 1;
		selectedSubscriptions = [];
		loadSubscriptions();
	}

	function handleSelectionChange(rows: Subscription[]) {
		selectedSubscriptions = rows;
	}

	function confirmDelete(subscription: Subscription) {
		subscriptionToDelete = subscription;
		showDeleteModal = true;
	}

	async function handleDelete() {
		if (!subscriptionToDelete) return;

		deleting = true;
		try {
			await subscriptionsApi.deleteSubscription(subscriptionToDelete.id);
			toast.success('訂閱已刪除');
			showDeleteModal = false;
			subscriptionToDelete = null;
			loadSubscriptions();
		} catch (error) {
			toast.error('刪除訂閱失敗');
		} finally {
			deleting = false;
		}
	}

	async function handleBatchDelete() {
		if (selectedSubscriptions.length === 0) return;

		batchDeleting = true;
		try {
			await Promise.all(
				selectedSubscriptions.map((sub) => subscriptionsApi.deleteSubscription(sub.id))
			);
			toast.success(`已刪除 ${selectedSubscriptions.length} 筆訂閱`);
			showBatchDeleteModal = false;
			selectedSubscriptions = [];
			loadSubscriptions();
		} catch (error) {
			toast.error('批次刪除失敗');
		} finally {
			batchDeleting = false;
		}
	}

	$effect(() => {
		loadSubscriptions();
	});

	function formatDate(dateString?: string): string {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}

	function formatCurrency(amount: number, currency: string = 'TWD'): string {
		return new Intl.NumberFormat('zh-TW', {
			style: 'currency',
			currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function handleExport() {
		const dataToExport = selectedSubscriptions.length > 0 ? selectedSubscriptions : subscriptions;
		if (dataToExport.length === 0) {
			toast.error('沒有可匯出的資料');
			return;
		}

		const columns = [
			{ key: 'name' as const, label: '服務名稱' },
			{ key: 'category' as const, label: '分類' },
			{ key: 'cost' as const, label: '費用' },
			{ key: 'currency' as const, label: '貨幣' },
			{ key: 'billingCycle' as const, label: '週期' },
			{ key: 'nextBillingDate' as const, label: '下次扣款日' },
			{ key: 'status' as const, label: '狀態' }
		];

		exportToCSV(
			dataToExport.map((s) => ({
				...s,
				category: categoryLabels[s.category],
				billingCycle: billingCycleLabels[s.billingCycle],
				status: subscriptionStatusLabels[s.status]
			})),
			getExportFilename('subscriptions'),
			columns
		);
		toast.success(`已匯出 ${dataToExport.length} 筆訂閱資料`);
	}

	function isUpcoming(dateString: string): boolean {
		const date = new Date(dateString);
		const now = new Date();
		const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
		return date >= now && date <= sevenDays;
	}
</script>

<svelte:head>
	<title>訂閱管理 - {config.appName}</title>
</svelte:head>

<PageContainer title="訂閱管理" description="管理您的訂閱服務">
	{#snippet actions()}
		<PermissionGuard permission="subscriptions:delete">
			{#snippet children()}
				{#if selectedSubscriptions.length > 0}
					<Button variant="danger" onclick={() => (showBatchDeleteModal = true)}>
						{#snippet children()}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							刪除選中 ({selectedSubscriptions.length})
						{/snippet}
					</Button>
				{/if}
			{/snippet}
		</PermissionGuard>
		<PermissionGuard permission="export:data">
			{#snippet children()}
				<Button variant="outline" onclick={handleExport}>
					{#snippet children()}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
							/>
						</svg>
						{selectedSubscriptions.length > 0 ? `匯出選中 (${selectedSubscriptions.length})` : '匯出'}
					{/snippet}
				</Button>
			{/snippet}
		</PermissionGuard>
		<PermissionGuard permission="subscriptions:create">
			{#snippet children()}
				<div data-testid="add-subscription-button">
					<Button href="/subscriptions/new">
						{#snippet children()}
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
							新增訂閱
						{/snippet}
					</Button>
				</div>
			{/snippet}
		</PermissionGuard>
	{/snippet}

	<div class="space-y-4" data-testid="subscriptions-page">
		<!-- Stats Cards -->
		{#if stats}
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="subscriptions-stats">
				<Card>
					{#snippet children()}
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
							>
								<svg
									class="w-6 h-6 text-blue-600 dark:text-blue-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div>
								<p class="text-sm text-gray-500 dark:text-gray-400">月費總計</p>
								<p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
									{formatCurrency(stats!.totalMonthly)}
								</p>
							</div>
						</div>
					{/snippet}
				</Card>
				<Card>
					{#snippet children()}
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
							>
								<svg
									class="w-6 h-6 text-green-600 dark:text-green-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							</div>
							<div>
								<p class="text-sm text-gray-500 dark:text-gray-400">年費總計</p>
								<p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
									{formatCurrency(stats!.totalYearly)}
								</p>
							</div>
						</div>
					{/snippet}
				</Card>
				<Card>
					{#snippet children()}
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"
							>
								<svg
									class="w-6 h-6 text-orange-600 dark:text-orange-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div>
								<p class="text-sm text-gray-500 dark:text-gray-400">即將到期 (7天內)</p>
								<p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
									{stats!.upcomingCount} 筆
								</p>
							</div>
						</div>
					{/snippet}
				</Card>
			</div>
		{/if}

		<!-- Filters -->
		<div
			class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
			data-testid="subscriptions-filters"
		>
			<div class="flex flex-col lg:flex-row gap-4">
				<div class="flex-1">
					<Input
						bind:value={search}
						placeholder="搜尋訂閱服務名稱..."
						onchange={handleSearch}
						id="subscription-search"
					/>
				</div>
				<div class="flex flex-wrap gap-2">
					<div class="w-32">
						<Select
							bind:value={categoryFilter}
							options={categoryOptions}
							placeholder="分類"
							onchange={handleSearch}
						/>
					</div>
					<div class="w-32">
						<Select
							bind:value={statusFilter}
							options={statusOptions}
							placeholder="狀態"
							onchange={handleSearch}
						/>
					</div>
					<div class="w-32">
						<Select
							bind:value={cycleFilter}
							options={cycleOptions}
							placeholder="週期"
							onchange={handleSearch}
						/>
					</div>
					<Button variant="outline" onclick={handleSearch}>
						{#snippet children()}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							搜尋
						{/snippet}
					</Button>
				</div>
			</div>
		</div>

		<!-- DataGrid -->
		<div data-testid="subscriptions-table">
			<DataGrid
				data={subscriptions}
				{columns}
				{loading}
				rowKey="id"
				selectable
				selectedRows={selectedSubscriptions}
				onSelectionChange={handleSelectionChange}
				{sortColumn}
				{sortDirection}
				onSort={handleSort}
				onRefresh={loadSubscriptions}
				striped
				hoverable
				responsiveMode="card"
				cardTitle="name"
				cardSubtitle="category"
				cardBadge="status"
			/>
		</div>

		<!-- Pagination -->
		{#if total > 0}
			<div
				class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
			>
				<Pagination
					{page}
					{pageSize}
					{total}
					onPageChange={handlePageChange}
					onPageSizeChange={handlePageSizeChange}
				/>
			</div>
		{/if}
	</div>
</PageContainer>

<!-- Delete Single Subscription Modal -->
<ConfirmModal
	bind:open={showDeleteModal}
	title="確認刪除"
	confirmText="刪除"
	variant="danger"
	loading={deleting}
	onConfirm={handleDelete}
>
	{#snippet children()}
		<p class="text-gray-600 dark:text-gray-400">
			確定要刪除訂閱「<span class="font-medium text-gray-900 dark:text-gray-100"
				>{subscriptionToDelete?.name}</span
			>」嗎？此操作無法復原。
		</p>
	{/snippet}
</ConfirmModal>

<!-- Batch Delete Modal -->
<ConfirmModal
	bind:open={showBatchDeleteModal}
	title="確認批次刪除"
	confirmText="刪除全部"
	variant="danger"
	loading={batchDeleting}
	onConfirm={handleBatchDelete}
>
	{#snippet children()}
		<p class="text-gray-600 dark:text-gray-400">
			確定要刪除選中的
			<span class="font-medium text-gray-900 dark:text-gray-100">{selectedSubscriptions.length}</span>
			筆訂閱嗎？此操作無法復原。
		</p>
	{/snippet}
</ConfirmModal>

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
		{formatCurrency(subscription.cost, subscription.currency)}
	</span>
{/snippet}

{#snippet cycleCell(subscription: Subscription)}
	<span class="text-gray-700 dark:text-gray-300">
		{billingCycleLabels[subscription.billingCycle]}
	</span>
{/snippet}

{#snippet nextBillingCell(subscription: Subscription)}
	<span
		class={isUpcoming(subscription.nextBillingDate)
			? 'text-orange-600 dark:text-orange-400 font-medium'
			: 'text-gray-600 dark:text-gray-400'}
	>
		{formatDate(subscription.nextBillingDate)}
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
		{#if hasPermission('subscriptions:delete')}
			<Button variant="ghost" size="icon" onclick={() => confirmDelete(subscription)}>
				{#snippet children()}
					<Trash2 class="w-4 h-4 text-red-500" />
				{/snippet}
			</Button>
		{/if}
	</div>
{/snippet}
