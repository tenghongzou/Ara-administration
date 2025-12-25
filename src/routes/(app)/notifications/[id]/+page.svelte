<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { PageContainer } from '$lib/components/layout';
	import { notifications, type Notification } from '$lib/stores';
	import { NotificationDetailContent } from '$lib/modules/notifications';

	let items = $state<Notification[]>([]);
	notifications.subscribe((state) => {
		items = state.items;
	});

	const notificationId = $derived($page.params.id);
	const notification = $derived(items.find((n) => n.id === notificationId));

	const relatedNotifications = $derived(
		notification
			? items
					.filter((n) => n.type === notification.type && n.id !== notification.id)
					.slice(0, 3)
			: []
	);

	function handleMarkRead() {
		if (notification && !notification.read) {
			notifications.markAsRead(notification.id);
		}
	}

	function handleDelete() {
		if (notification) {
			notifications.remove(notification.id);
			goto('/notifications');
		}
	}

	$effect(() => {
		if (notification && !notification.read) {
			const timer = setTimeout(() => {
				notifications.markAsRead(notification.id);
			}, 2000);
			return () => clearTimeout(timer);
		}
	});
</script>

<svelte:head>
	<title>{notification?.title ?? '通知詳情'} - 管理後台</title>
</svelte:head>

<PageContainer>
	<NotificationDetailContent
		{notification}
		{relatedNotifications}
		onMarkRead={handleMarkRead}
		onDelete={handleDelete}
	/>
</PageContainer>
