<script lang="ts">
	import { cn, generateUUID } from '$lib/utils';

	interface Option {
		value: string;
		label: string;
		disabled?: boolean;
	}

	interface Props {
		name?: string;
		id?: string;
		value?: string;
		options: Option[];
		placeholder?: string;
		label?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
		onchange?: (event: Event & { currentTarget: EventTarget & HTMLSelectElement }) => void;
	}

	let {
		name,
		id,
		value = $bindable(''),
		options,
		placeholder = '請選擇',
		label,
		error,
		disabled = false,
		required = false,
		class: className = '',
		onchange
	}: Props = $props();

	let selectId = $derived(id || name || generateUUID());

	const baseStyles = `
		w-full px-3 py-2 pr-10
		border rounded-md
		text-sm text-gray-900
		bg-white bg-no-repeat bg-right
		appearance-none
		transition-colors duration-200
		focus:outline-none focus:ring-2 focus:ring-offset-0
		disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
		dark:bg-gray-900 dark:text-gray-100
	`;

	let selectStyles = $derived(
		cn(
			baseStyles,
			error
				? 'border-red-300 focus:border-red-500 focus:ring-red-500'
				: 'border-gray-300 focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] dark:border-gray-600'
		)
	);
</script>

<div class={cn('space-y-1.5', className)}>
	{#if label}
		<label for={selectId} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative">
		<select
			{name}
			id={selectId}
			bind:value
			{disabled}
			{required}
			aria-invalid={!!error}
			class={selectStyles}
			{onchange}
		>
			{#if placeholder}
				<option value="" disabled>{placeholder}</option>
			{/if}
			{#each options as option}
				<option value={option.value} disabled={option.disabled}>
					{option.label}
				</option>
			{/each}
		</select>

		<div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
			<svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</div>
	</div>

	{#if error}
		<p class="text-sm text-red-600 dark:text-red-400">{error}</p>
	{/if}
</div>
