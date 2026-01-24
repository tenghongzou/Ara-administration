<script lang="ts">
	import { onMount } from 'svelte';
	import { config } from '$lib/constants';
	import {
		subscriptionsApi,
		billingCycleLabels,
		subscriptionStatusLabels,
		categoryLabels
	} from '$lib/services';
	import type { Subscription, SubscriptionStats } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { exportToCSV, getExportFilename } from '$lib/utils';
	import {
		subscriptionsService,
		SubscriptionsContent,
		SubscriptionDeleteModals,
		type SubscriptionFilters
	} from '$lib/modules/subscriptions';

	let subscriptions = $state<Subscription[]>([]);
	let stats = $state<SubscriptionStats | null>(null);
	let loading = $state(true);
	let page = $state(1);
	let pageSize = $state(10);
	let total = $state(0);
	let sortColumn = $state('');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let selectedSubscriptions = $state<Subscription[]>([]);

	let filters = $state<SubscriptionFilters>({
		search: '',
		category: '',
		status: '',
		billingCycle: ''
	});

	let showDeleteModal = $state(false);
	let subscriptionToDelete = $state<Subscription | null>(null);
	let deleting = $state(false);

	let showBatchDeleteModal = $state(false);
	let batchDeleting = $state(false);

	async function loadSubscriptions() {
		loading = true;
		try {
			const [response, statsResponse] = await Promise.all([
				subscriptionsApi.getSubscriptions({
					page,
					pageSize,
					search: filters.search,
					category: filters.category,
					status: filters.status,
					billingCycle: filters.billingCycle,
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

	function handleExport() {
		const dataToExport = selectedSubscriptions.length > 0 ? selectedSubscriptions : subscriptions;
		if (dataToExport.length === 0) {
			toast.error('沒有可匯出的資料');
			return;
		}

		const exportColumns = subscriptionsService.getExportColumns();

		exportToCSV(
			dataToExport.map((s) => ({
				...s,
				category: categoryLabels[s.category],
				billingCycle: billingCycleLabels[s.billingCycle],
				status: subscriptionStatusLabels[s.status]
			})),
			getExportFilename('subscriptions'),
			exportColumns
		);
		toast.success(`已匯出 ${dataToExport.length} 筆訂閱資料`);
	}

	onMount(() => {
		loadSubscriptions();
	});
</script>

<svelte:head>
	<title>訂閱管理 - {config.appName}</title>
</svelte:head>

<PageContainer title="訂閱管理" description="管理您的訂閱服務">
	<SubscriptionsContent
		{subscriptions}
		{stats}
		{loading}
		bind:filters
		selectedRows={selectedSubscriptions}
		{sortColumn}
		{sortDirection}
		{page}
		{pageSize}
		{total}
		onSearch={handleSearch}
		onSelectionChange={handleSelectionChange}
		onSort={handleSort}
		onRefresh={loadSubscriptions}
		onDelete={confirmDelete}
		onPageChange={handlePageChange}
		onPageSizeChange={handlePageSizeChange}
		onBatchDelete={() => (showBatchDeleteModal = true)}
		onExport={handleExport}
	/>
</PageContainer>

<SubscriptionDeleteModals
	bind:showDeleteModal
	{subscriptionToDelete}
	{deleting}
	onDeleteConfirm={handleDelete}
	onDeleteCancel={() => (showDeleteModal = false)}
	bind:showBatchDeleteModal
	selectedCount={selectedSubscriptions.length}
	{batchDeleting}
	onBatchDeleteConfirm={handleBatchDelete}
	onBatchDeleteCancel={() => (showBatchDeleteModal = false)}
/>
