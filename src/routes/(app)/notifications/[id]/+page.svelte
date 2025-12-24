<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Card, Badge, Button } from '$lib/components/ui';
	import { PageContainer } from '$lib/components/layout';
	import { notifications, type Notification } from '$lib/stores';
	import { notificationsService } from '$lib/modules/notifications';
	import { cn } from '$lib/utils';
	import { ArrowLeft, ExternalLink, Trash2, CheckCircle } from 'lucide-svelte';

	let items = $state<Notification[]>([]);
	notifications.subscribe((state) => {
		items = state.items;
	});

	const notificationId = $derived($page.params.id);
	const notification = $derived(items.find((n) => n.id === notificationId));

	const style = $derived(notification ? notificationsService.getTypeStyle(notification.type) : null);
	const badge = $derived(notification ? notificationsService.getTypeBadge(notification.type) : null);
	const formattedTime = $derived(
		notification ? notificationsService.formatFullDateTime(notification.timestamp) : ''
	);

	// 相關通知（同類型的其他通知）
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

	// 自動標記為已讀
	$effect(() => {
		if (notification && !notification.read) {
			// 延遲標記，給用戶一點時間閱讀
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
	<div class="max-w-3xl mx-auto">
		<!-- 返回按鈕 -->
		<div class="mb-6">
			<Button variant="ghost" onclick={() => goto('/notifications')}>
				{#snippet children()}
					<ArrowLeft class="w-4 h-4 mr-2" />
					返回通知列表
				{/snippet}
			</Button>
		</div>

		{#if notification && style && badge}
			<Card variant="bordered">
				<div class="p-6">
					<!-- 標題區 -->
					<div class="flex items-start gap-4 mb-6">
						<div
							class={cn(
								'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold',
								style.bg,
								style.text
							)}
						>
							{style.icon}
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">
									{notification.title}
								</h1>
								<Badge variant={badge.variant}>{badge.label}</Badge>
								{#if !notification.read}
									<span class="w-2 h-2 bg-[var(--color-primary-500)] rounded-full"></span>
								{/if}
							</div>
							<p class="text-sm text-gray-500 dark:text-gray-400">
								{formattedTime}
							</p>
						</div>
					</div>

					<!-- 內容 -->
					<div class="prose dark:prose-invert max-w-none mb-6">
						<p class="text-gray-700 dark:text-gray-300 leading-relaxed">
							{notification.message}
						</p>
					</div>

					<!-- 操作按鈕 -->
					<div class="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
						{#if notification.link}
							<Button variant="default" onclick={() => goto(notification.link!)}>
								{#snippet children()}
									<ExternalLink class="w-4 h-4 mr-2" />
									前往相關頁面
								{/snippet}
							</Button>
						{/if}
						{#if !notification.read}
							<Button variant="outline" onclick={handleMarkRead}>
								{#snippet children()}
									<CheckCircle class="w-4 h-4 mr-2" />
									標為已讀
								{/snippet}
							</Button>
						{/if}
						<Button variant="ghost" class="text-red-600 hover:text-red-500" onclick={handleDelete}>
							{#snippet children()}
								<Trash2 class="w-4 h-4 mr-2" />
								刪除通知
							{/snippet}
						</Button>
					</div>
				</div>
			</Card>

			<!-- 相關通知 -->
			{#if relatedNotifications.length > 0}
				<div class="mt-8">
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
						相關通知
					</h2>
					<div class="space-y-3">
						{#each relatedNotifications as related}
							{@const relatedStyle = notificationsService.getTypeStyle(related.type)}
							<a
								href="/notifications/{related.id}"
								class="block p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
							>
								<div class="flex items-start gap-3">
									<div
										class={cn(
											'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm',
											relatedStyle.bg,
											relatedStyle.text
										)}
									>
										{relatedStyle.icon}
									</div>
									<div class="flex-1 min-w-0">
										<p class={cn(
											'font-medium truncate',
											related.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'
										)}>
											{related.title}
										</p>
										<p class="text-sm text-gray-500 dark:text-gray-400 truncate">
											{related.message}
										</p>
									</div>
									<span class="text-xs text-gray-400 whitespace-nowrap">
										{notificationsService.formatTime(related.timestamp)}
									</span>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		{:else}
			<Card variant="bordered">
				<div class="p-12 text-center">
					<p class="text-gray-500 dark:text-gray-400">找不到此通知</p>
					<Button variant="outline" class="mt-4" onclick={() => goto('/notifications')}>
						{#snippet children()}返回通知列表{/snippet}
					</Button>
				</div>
			</Card>
		{/if}
	</div>
</PageContainer>
