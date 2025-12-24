<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		title: string;
		value: string | number;
		change?: number;
		changeLabel?: string;
		icon?: Snippet;
		variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
		class?: string;
	}

	let {
		title,
		value,
		change,
		changeLabel = '較上期',
		icon,
		variant = 'default',
		class: className = ''
	}: Props = $props();

	const iconColors = {
		default: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
		primary:
			'bg-[var(--color-primary-100)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-400)]',
		success: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
		warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
		error: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
	};

	let changeDirection = $derived(
		change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : null
	);

	let changeColor = $derived(() => {
		if (changeDirection === 'up') return 'text-green-600 dark:text-green-400';
		if (changeDirection === 'down') return 'text-red-600 dark:text-red-400';
		return 'text-gray-500';
	});
</script>

<div
	class={cn(
		'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
		className
	)}
>
	<div class="flex items-start justify-between">
		<div class="flex-1">
			<p class="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
			<p class="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>

			{#if change !== undefined}
				<div class="mt-2 flex items-center gap-1 text-sm">
					<span class={changeColor()}>
						{#if changeDirection === 'up'}
							<svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 10l7-7m0 0l7 7m-7-7v18"
								/>
							</svg>
							+{change}%
						{:else if changeDirection === 'down'}
							<svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 14l-7 7m0 0l-7-7m7 7V3"
								/>
							</svg>
							{change}%
						{:else}
							0%
						{/if}
					</span>
					<span class="text-gray-500 dark:text-gray-400">{changeLabel}</span>
				</div>
			{/if}
		</div>

		{#if icon}
			<div class={cn('p-3 rounded-lg', iconColors[variant])}>
				{@render icon()}
			</div>
		{/if}
	</div>
</div>
