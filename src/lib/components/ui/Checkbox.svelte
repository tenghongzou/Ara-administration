<script lang="ts">
	import { cn, generateUUID } from '$lib/utils';

	interface Props {
		name?: string;
		id?: string;
		checked?: boolean;
		label?: string;
		description?: string;
		disabled?: boolean;
		class?: string;
		onchange?: (event: Event) => void;
	}

	let {
		name,
		id,
		checked = $bindable(false),
		label,
		description,
		disabled = false,
		class: className = '',
		onchange
	}: Props = $props();

	let checkboxId = $derived(id || name || generateUUID());

	const checkboxStyles = `
		h-4 w-4 rounded
		border-gray-300 text-[var(--color-primary-600)]
		focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2
		disabled:opacity-50 disabled:cursor-not-allowed
		dark:border-gray-600 dark:bg-gray-900
	`;
</script>

<div class={cn('flex items-start gap-3', className)}>
	<input
		type="checkbox"
		{name}
		id={checkboxId}
		bind:checked
		{disabled}
		class={checkboxStyles}
		{onchange}
	/>

	{#if label || description}
		<div class="flex flex-col">
			{#if label}
				<label
					for={checkboxId}
					class="text-sm font-medium text-gray-700 dark:text-gray-300"
					class:cursor-not-allowed={disabled}
					class:opacity-50={disabled}
				>
					{label}
				</label>
			{/if}
			{#if description}
				<p class="text-sm text-gray-500 dark:text-gray-400">{description}</p>
			{/if}
		</div>
	{/if}
</div>
