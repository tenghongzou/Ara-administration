<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		title?: string;
		description?: string;
		backLink?: string;
		backLabel?: string;
		actions?: Snippet;
		fullHeight?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		title,
		description,
		backLink,
		backLabel = '返回',
		actions,
		fullHeight = false,
		class: className = '',
		children
	}: Props = $props();
</script>

<div class={cn('p-4 lg:p-6', fullHeight && 'h-full flex flex-col overflow-hidden', className)}>
	{#if backLink}
		<a
			href={backLink}
			class={cn('inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors', fullHeight && 'flex-shrink-0')}
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			{backLabel}
		</a>
	{/if}

	{#if title || actions}
		<div class={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6', fullHeight && 'flex-shrink-0')}>
			<div>
				{#if title}
					<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
				{/if}
				{#if description}
					<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
				{/if}
			</div>

			{#if actions}
				<div class="flex items-center gap-3">
					{@render actions()}
				</div>
			{/if}
		</div>
	{/if}

	{#if fullHeight}
		<div class="flex-1 min-h-0 flex flex-col">
			{@render children()}
		</div>
	{:else}
		{@render children()}
	{/if}
</div>
