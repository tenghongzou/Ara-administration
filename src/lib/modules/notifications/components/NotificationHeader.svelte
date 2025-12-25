<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { CheckCheck, Trash2 } from 'lucide-svelte';

	interface Props {
		unreadCount: number;
		totalCount: number;
		onMarkAllRead: () => void;
		onClearAll: () => void;
	}

	let { unreadCount, totalCount, onMarkAllRead, onClearAll }: Props = $props();
</script>

<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
	<div>
		<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">通知中心</h1>
		<p class="text-gray-500 dark:text-gray-400 mt-1">
			{#if unreadCount > 0}
				您有 {unreadCount} 則未讀通知
			{:else}
				所有通知已讀取
			{/if}
		</p>
	</div>
	<div class="flex gap-2">
		{#if unreadCount > 0}
			<Button variant="outline" onclick={onMarkAllRead}>
				{#snippet children()}
					<CheckCheck class="w-4 h-4 mr-1.5" />
					全部標為已讀
				{/snippet}
			</Button>
		{/if}
		{#if totalCount > 0}
			<Button variant="ghost" onclick={onClearAll}>
				{#snippet children()}
					<Trash2 class="w-4 h-4 mr-1.5" />
					清除全部
				{/snippet}
			</Button>
		{/if}
	</div>
</div>
