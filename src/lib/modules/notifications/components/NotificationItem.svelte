<script lang="ts">
	import { Card, Badge, Checkbox } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import type { Notification } from '$lib/stores/notifications';
	import { notificationsService } from '../services/notifications.service';

	interface Props {
		notification: Notification;
		selected?: boolean;
		selectable?: boolean;
		onMarkRead?: (id: string) => void;
		onDelete?: (id: string) => void;
		onSelect?: (id: string, selected: boolean) => void;
	}

	let {
		notification,
		selected = false,
		selectable = false,
		onMarkRead,
		onDelete,
		onSelect
	}: Props = $props();

	const style = $derived(notificationsService.getTypeStyle(notification.type));
	const badge = $derived(notificationsService.getTypeBadge(notification.type));
	const formattedTime = $derived(notificationsService.formatTime(notification.timestamp));
</script>

<Card
	class={cn(
		'transition-all duration-200',
		!notification.read && 'ring-2 ring-[var(--color-primary-200)] dark:ring-[var(--color-primary-800)]',
		selected && 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20'
	)}
>
	<div class="p-4">
		<div class="flex gap-4">
			{#if selectable}
				<div class="flex items-start pt-1">
					<Checkbox
						checked={selected}
						onchange={(e) => {
							const target = e.currentTarget as HTMLInputElement;
							onSelect?.(notification.id, target.checked);
						}}
					/>
				</div>
			{/if}
			<div
				class={cn(
					'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold',
					style.bg,
					style.text
				)}
				aria-hidden="true"
			>
				{style.icon}
			</div>
			<div class="flex-1 min-w-0">
				<div class="flex items-start justify-between gap-3">
					<div class="flex items-center gap-2 flex-wrap">
						<a
							href="/notifications/{notification.id}"
							class={cn(
								'font-semibold hover:text-[var(--color-primary-600)]',
								notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'
							)}
						>
							{notification.title}
						</a>
						<Badge variant={badge.variant}>{badge.label}</Badge>
						{#if !notification.read}
							<span class="w-2 h-2 bg-[var(--color-primary-500)] rounded-full"></span>
						{/if}
					</div>
					<span class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
						{formattedTime}
					</span>
				</div>
				<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
					{notification.message}
				</p>
				<div class="flex items-center gap-3 mt-3">
					{#if notification.link}
						<a
							href={notification.link}
							class="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] font-medium"
						>
							查看詳情 →
						</a>
					{/if}
					<a
						href="/notifications/{notification.id}"
						class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
					>
						展開
					</a>
					{#if !notification.read && onMarkRead}
						<button
							type="button"
							class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
							onclick={() => onMarkRead(notification.id)}
						>
							標為已讀
						</button>
					{/if}
					{#if onDelete}
						<button
							type="button"
							class="text-sm text-gray-400 hover:text-red-500 dark:hover:text-red-400"
							onclick={() => onDelete(notification.id)}
						>
							刪除
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</Card>
