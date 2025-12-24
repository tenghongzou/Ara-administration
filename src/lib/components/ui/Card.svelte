<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		variant?: 'default' | 'bordered' | 'elevated';
		padding?: 'none' | 'sm' | 'md' | 'lg';
		hoverable?: boolean;
		class?: string;
		header?: Snippet;
		footer?: Snippet;
		children: Snippet;
		role?: 'region' | 'group' | 'article' | 'section';
		'aria-labelledby'?: string;
		'aria-label'?: string;
	}

	let {
		variant = 'bordered',
		padding = 'md',
		hoverable = false,
		class: className = '',
		header,
		footer,
		children,
		role,
		'aria-labelledby': ariaLabelledby,
		'aria-label': ariaLabel
	}: Props = $props();

	const baseStyles = 'rounded-lg overflow-hidden';

	const variants = {
		default: 'bg-white dark:bg-gray-900',
		bordered: 'bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700',
		elevated: 'bg-white shadow-md dark:bg-gray-900'
	};

	const paddings = {
		none: '',
		sm: 'p-3',
		md: 'p-4',
		lg: 'p-6'
	};

	let computedClass = $derived(
		cn(
			baseStyles,
			variants[variant],
			hoverable && 'transition-shadow hover:shadow-lg cursor-pointer',
			className
		)
	);
</script>

<div
	class={computedClass}
	{role}
	aria-labelledby={ariaLabelledby}
	aria-label={ariaLabel}
>
	{#if header}
		<div class="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
			{@render header()}
		</div>
	{/if}

	<div class={paddings[padding]}>
		{@render children()}
	</div>

	{#if footer}
		<div
			class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800"
		>
			{@render footer()}
		</div>
	{/if}
</div>
