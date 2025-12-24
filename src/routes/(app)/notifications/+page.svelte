<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { notifications, unreadCount, type Notification } from '$lib/stores';
	import { toast } from '$lib/stores/toast';
	import {
		notificationsService,
		NotificationFiltersPanel,
		NotificationItem,
		NotificationBatchActions,
		type NotificationFilters,
		type NotificationCategory,
		type BatchActionType
	} from '$lib/modules/notifications';

	let items = $state<Notification[]>([]);
	let unread = $state(0);
	let selectedIds = $state<Set<string>>(new Set());

	let filters = $state<NotificationFilters>({
		category: 'all',
		status: 'all',
		search: ''
	});

	notifications.subscribe((state) => {
		items = state.items;
	});

	unreadCount.subscribe((count) => (unread = count));

	// 篩選後的通知
	const filteredItems = $derived(notificationsService.filterNotifications(items, filters));

	// 分類統計
	const categoryCounts = $derived(notificationsService.getCategoryCounts(items));

	// 選擇相關
	const selectedCount = $derived(selectedIds.size);
	const allSelected = $derived(
		filteredItems.length > 0 && filteredItems.every((item) => selectedIds.has(item.id))
	);

	function handleFilterChange(newFilters: NotificationFilters) {
		filters = newFilters;
		// 清除選擇
		selectedIds = new Set();
	}

	function handleSelect(id: string, selected: boolean) {
		const newSet = new Set(selectedIds);
		if (selected) {
			newSet.add(id);
		} else {
			newSet.delete(id);
		}
		selectedIds = newSet;
	}

	function handleSelectAll() {
		selectedIds = new Set(filteredItems.map((item) => item.id));
	}

	function handleDeselectAll() {
		selectedIds = new Set();
	}

	async function handleBatchAction(type: BatchActionType) {
		if (selectedIds.size === 0) return;

		const ids = Array.from(selectedIds);

		try {
			if (type === 'markRead') {
				ids.forEach((id) => notifications.markAsRead(id));
				toast.success(`已將 ${ids.length} 則通知標為已讀`);
			} else if (type === 'delete') {
				ids.forEach((id) => notifications.remove(id));
				toast.success(`已刪除 ${ids.length} 則通知`);
			}
			selectedIds = new Set();
		} catch (error) {
			toast.error('操作失敗');
		}
	}

	function handleMarkRead(id: string) {
		notifications.markAsRead(id);
	}

	function handleDelete(id: string) {
		notifications.remove(id);
	}
</script>

<svelte:head>
	<title>通知中心 - 管理後台</title>
</svelte:head>

<div class="p-4 lg:p-6 max-w-4xl mx-auto">
	<!-- 返回按鈕 -->
	<div class="mb-4">
		<a
			href="/settings"
			class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			返回設定
		</a>
	</div>

	<!-- 標題區 -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">通知中心</h1>
			<p class="text-gray-500 dark:text-gray-400 mt-1">
				{#if unread > 0}
					您有 {unread} 則未讀通知
				{:else}
					所有通知已讀取
				{/if}
			</p>
		</div>
		<div class="flex gap-2">
			{#if unread > 0}
				<Button variant="outline" onclick={() => notifications.markAllAsRead()}>
					{#snippet children()}全部標為已讀{/snippet}
				</Button>
			{/if}
			{#if items.length > 0}
				<Button variant="ghost" onclick={() => notifications.clear()}>
					{#snippet children()}清除全部{/snippet}
				</Button>
			{/if}
		</div>
	</div>

	<!-- 篩選器 -->
	<div class="mb-6">
		<NotificationFiltersPanel
			{filters}
			totalCount={items.length}
			unreadCount={unread}
			{categoryCounts}
			onFilterChange={handleFilterChange}
		/>
	</div>

	<!-- 批量操作 -->
	<div class="mb-4">
		<NotificationBatchActions
			{selectedCount}
			onAction={handleBatchAction}
			onSelectAll={handleSelectAll}
			onDeselectAll={handleDeselectAll}
		/>
	</div>

	<!-- 通知列表 -->
	{#if filteredItems.length === 0}
		<Card class="py-12" role="region" aria-label="無通知">
			<div class="text-center text-gray-500 dark:text-gray-400">
				<svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>
				<p class="text-lg font-medium mb-1">沒有通知</p>
				<p class="text-sm">
					{#if filters.search}
						找不到符合「{filters.search}」的通知
					{:else if filters.status === 'unread'}
						所有通知已讀取完畢
					{:else if filters.category !== 'all'}
						此分類目前沒有通知
					{:else}
						目前沒有任何通知
					{/if}
				</p>
			</div>
		</Card>
	{:else}
		<div class="space-y-3" role="list" aria-label="通知列表">
			{#each filteredItems as item (item.id)}
				<NotificationItem
					notification={item}
					selected={selectedIds.has(item.id)}
					selectable={true}
					onMarkRead={handleMarkRead}
					onDelete={handleDelete}
					onSelect={handleSelect}
				/>
			{/each}
		</div>
	{/if}
</div>
