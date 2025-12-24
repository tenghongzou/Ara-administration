<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
		size?: 'sm' | 'md';
		class?: string;
		children: Snippet;
	}

	let { variant = 'default', size = 'md', class: className = '', children }: Props = $props();

	const baseStyles = 'inline-flex items-center font-medium rounded-full';

	const variants = {
		default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
		success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
		warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
		error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
		info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
		outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
	};

	const sizes = {
		sm: 'px-2 py-0.5 text-xs',
		md: 'px-2.5 py-0.5 text-sm'
	};

	let computedClass = $derived(cn(baseStyles, variants[variant], sizes[size], className));
</script>

<span class={computedClass}>
	{@render children()}
</span>
