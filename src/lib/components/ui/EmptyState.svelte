<script lang="ts">
	import { cn } from '$lib/utils';
	import Button from './Button.svelte';

	interface Props {
		title?: string;
		description?: string;
		icon?: import('svelte').Snippet;
		action?: import('svelte').Snippet;
		class?: string;
	}

	let {
		title = '沒有資料',
		description = '目前沒有任何資料',
		icon,
		action,
		class: className = ''
	}: Props = $props();
</script>

<div
	class={cn(
		'flex flex-col items-center justify-center py-12 px-4 text-center',
		className
	)}
	role="status"
	aria-label={title}
>
	<div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
		{#if icon}
			{@render icon()}
		{:else}
			<svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
				/>
			</svg>
		{/if}
	</div>
	<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
		{title}
	</h3>
	<p class="text-gray-500 dark:text-gray-400 max-w-md mb-6">
		{description}
	</p>
	{#if action}
		{@render action()}
	{/if}
</div>
