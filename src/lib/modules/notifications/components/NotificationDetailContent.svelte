<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, Badge, Button } from '$lib/components/ui';
	import type { Notification } from '$lib/stores';
	import { notificationsService } from '../services/notifications.service';
	import { cn } from '$lib/utils';
	import { ArrowLeft, ExternalLink, Trash2, CheckCircle } from 'lucide-svelte';

	interface Props {
		notification: Notification | undefined;
		relatedNotifications: Notification[];
		onMarkRead: () => void;
		onDelete: () => void;
	}

	let { notification, relatedNotifications, onMarkRead, onDelete }: Props = $props();

	const style = $derived(notification ? notificationsService.getTypeStyle(notification.type) : null);
	const badge = $derived(notification ? notificationsService.getTypeBadge(notification.type) : null);
	const formattedTime = $derived(
		notification ? notificationsService.formatFullDateTime(notification.timestamp) : ''
	);
</script>

<div class="max-w-3xl mx-auto">
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

				<div class="prose dark:prose-invert max-w-none mb-6">
					<p class="text-gray-700 dark:text-gray-300 leading-relaxed">
						{notification.message}
					</p>
				</div>

				<div class="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
					{#if notification.link}
						<Button variant="primary" onclick={() => goto(notification.link!)}>
							{#snippet children()}
								<ExternalLink class="w-4 h-4 mr-2" />
								前往相關頁面
							{/snippet}
						</Button>
					{/if}
					{#if !notification.read}
						<Button variant="outline" onclick={onMarkRead}>
							{#snippet children()}
								<CheckCircle class="w-4 h-4 mr-2" />
								標為已讀
							{/snippet}
						</Button>
					{/if}
					<Button variant="ghost" class="text-red-600 hover:text-red-500" onclick={onDelete}>
						{#snippet children()}
							<Trash2 class="w-4 h-4 mr-2" />
							刪除通知
						{/snippet}
					</Button>
				</div>
			</div>
		</Card>

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
