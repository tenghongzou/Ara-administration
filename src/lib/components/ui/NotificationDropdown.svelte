<script lang="ts">
	import { cn } from '$lib/utils';
	import { notifications, unreadCount, type Notification } from '$lib/stores';
	import Button from './Button.svelte';

	let isOpen = $state(false);
	let items = $state<Notification[]>([]);
	let unread = $state(0);

	notifications.subscribe((state) => {
		isOpen = state.isOpen;
		items = state.items;
	});

	unreadCount.subscribe((count) => (unread = count));

	function formatTime(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (minutes < 1) return '剛剛';
		if (minutes < 60) return `${minutes} 分鐘前`;
		if (hours < 24) return `${hours} 小時前`;
		if (days < 7) return `${days} 天前`;
		return date.toLocaleDateString('zh-TW');
	}

	function getTypeIcon(type: Notification['type']) {
		switch (type) {
			case 'success':
				return { icon: '✓', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' };
			case 'warning':
				return { icon: '!', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' };
			case 'error':
				return { icon: '✕', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' };
			default:
				return { icon: 'i', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' };
		}
	}

	function handleToggle() {
		notifications.toggle();
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.notification-dropdown')) {
			notifications.close();
		}
	}

	function handleItemClick(item: Notification) {
		notifications.markAsRead(item.id);
		if (item.link) {
			notifications.close();
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="notification-dropdown relative">
	<button
		type="button"
		class="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
		onclick={handleToggle}
		aria-label="通知"
		aria-expanded={isOpen}
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
			/>
		</svg>
		{#if unread > 0}
			<span class="absolute top-1 right-1 w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
				{unread > 9 ? '9+' : unread}
			</span>
		{/if}
	</button>

	{#if isOpen}
		<div class="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
			<div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
				<h3 class="font-semibold text-gray-900 dark:text-gray-100">通知</h3>
				{#if unread > 0}
					<button
						type="button"
						class="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]"
						onclick={() => notifications.markAllAsRead()}
					>
						全部標為已讀
					</button>
				{/if}
			</div>

			<div class="max-h-96 overflow-y-auto">
				{#if items.length === 0}
					<div class="py-8 text-center text-gray-500 dark:text-gray-400">
						<svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
						<p class="text-sm">沒有通知</p>
					</div>
				{:else}
					{#each items as item}
						{@const typeStyle = getTypeIcon(item.type)}
						<div
							class={cn(
								'flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-b-0',
								!item.read && 'bg-blue-50/50 dark:bg-blue-900/10'
							)}
							onclick={() => handleItemClick(item)}
							onkeydown={(e) => e.key === 'Enter' && handleItemClick(item)}
							role="button"
							tabindex="0"
						>
							<div class={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold', typeStyle.bg, typeStyle.text)}>
								{typeStyle.icon}
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-start justify-between gap-2">
									<p class={cn('text-sm font-medium truncate', item.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100')}>
										{item.title}
									</p>
									{#if !item.read}
										<span class="w-2 h-2 bg-[var(--color-primary-500)] rounded-full flex-shrink-0 mt-1.5"></span>
									{/if}
								</div>
								<p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{item.message}</p>
								<p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTime(item.timestamp)}</p>
							</div>
							<button
								type="button"
								class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
								onclick={(e) => { e.stopPropagation(); notifications.remove(item.id); }}
								aria-label="刪除通知"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					{/each}
				{/if}
			</div>

			{#if items.length > 0}
				<div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
					<Button variant="ghost" class="w-full" href="/notifications" onclick={() => notifications.close()}>
						{#snippet children()}查看全部通知{/snippet}
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</div>
