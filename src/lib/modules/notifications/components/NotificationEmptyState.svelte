<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { Bell } from 'lucide-svelte';
	import type { NotificationFilters } from '../types';

	interface Props {
		filters: NotificationFilters;
	}

	let { filters }: Props = $props();
</script>

<Card class="py-12" role="region" aria-label="無通知">
	{#snippet children()}
		<div class="text-center text-gray-500 dark:text-gray-400">
			<Bell class="w-16 h-16 mx-auto mb-4 opacity-50" strokeWidth={1.5} />
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
	{/snippet}
</Card>
