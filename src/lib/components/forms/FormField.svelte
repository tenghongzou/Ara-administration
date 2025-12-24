<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		label?: string;
		error?: string;
		hint?: string;
		required?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		label,
		error,
		hint,
		required = false,
		class: className = '',
		children
	}: Props = $props();
</script>

<div class={cn('space-y-1.5', className)}>
	{#if label}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<span class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</span>
	{/if}

	{@render children()}

	{#if error}
		<p class="text-sm text-red-600 dark:text-red-400">{error}</p>
	{:else if hint}
		<p class="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
	{/if}
</div>
