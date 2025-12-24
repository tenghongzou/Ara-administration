<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	import Spinner from './Spinner.svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
		size?: 'sm' | 'md' | 'lg' | 'icon';
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit' | 'reset';
		href?: string;
		class?: string;
		children: Snippet;
		onclick?: (event: MouseEvent) => void;
		'aria-label'?: string;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		type = 'button',
		href,
		class: className = '',
		children,
		onclick,
		'aria-label': ariaLabel
	}: Props = $props();

	const baseStyles = `
		inline-flex items-center justify-center gap-2
		font-medium whitespace-nowrap
		transition-all duration-200
		focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
		disabled:pointer-events-none disabled:opacity-50
	`;

	const variants = {
		primary: `
			bg-[var(--color-primary-600)] text-white
			hover:bg-[var(--color-primary-700)] active:bg-[var(--color-primary-800)]
			focus-visible:ring-[var(--color-primary-500)]
		`,
		secondary: `
			bg-gray-100 text-gray-900
			hover:bg-gray-200 active:bg-gray-300
			focus-visible:ring-gray-500
			dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700
		`,
		outline: `
			border border-gray-300 bg-transparent text-gray-700
			hover:bg-gray-50 active:bg-gray-100
			focus-visible:ring-gray-500
			dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800
		`,
		ghost: `
			bg-transparent text-gray-700
			hover:bg-gray-100 active:bg-gray-200
			focus-visible:ring-gray-500
			dark:text-gray-300 dark:hover:bg-gray-800
		`,
		danger: `
			bg-red-600 text-white
			hover:bg-red-700 active:bg-red-800
			focus-visible:ring-red-500
		`,
		link: `
			bg-transparent text-[var(--color-primary-600)] underline-offset-4
			hover:underline
			focus-visible:ring-[var(--color-primary-500)]
		`
	};

	const sizes = {
		sm: 'h-8 px-3 text-xs rounded-md',
		md: 'h-10 px-4 text-sm rounded-md',
		lg: 'h-12 px-6 text-base rounded-lg',
		icon: 'h-10 w-10 rounded-md'
	};

	let computedClass = $derived(cn(baseStyles, variants[variant], sizes[size], className));

	let isDisabled = $derived(disabled || loading);
</script>

{#if href && !isDisabled}
	<a {href} class={computedClass} aria-label={ariaLabel}>
		{@render children()}
	</a>
{:else}
	<button
		{type}
		class={computedClass}
		disabled={isDisabled}
		aria-disabled={isDisabled}
		aria-label={ariaLabel}
		{onclick}
	>
		{#if loading}
			<Spinner size="sm" />
		{/if}
		{@render children()}
	</button>
{/if}
