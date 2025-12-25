<script lang="ts">
	import { notifications, unreadCount, type Notification } from '$lib/stores';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import {
		notificationsService,
		NotificationsContent,
		type NotificationFilters,
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

	function handleFilterChange(newFilters: NotificationFilters) {
		filters = newFilters;
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

<PageContainer backLink="/settings" backLabel="返回設定" class="max-w-4xl mx-auto">
	<NotificationsContent
		{items}
		{filteredItems}
		{filters}
		unreadCount={unread}
		{selectedIds}
		{categoryCounts}
		onFilterChange={handleFilterChange}
		onMarkRead={handleMarkRead}
		onDelete={handleDelete}
		onSelect={handleSelect}
		onSelectAll={handleSelectAll}
		onDeselectAll={handleDeselectAll}
		onBatchAction={handleBatchAction}
		onMarkAllRead={() => notifications.markAllAsRead()}
		onClearAll={() => notifications.clear()}
	/>
</PageContainer>
