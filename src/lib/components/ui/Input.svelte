<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date';
		name?: string;
		id?: string;
		value?: string | number | '';
		placeholder?: string;
		label?: string;
		error?: string;
		hint?: string;
		disabled?: boolean;
		required?: boolean;
		readonly?: boolean;
		autocomplete?: HTMLInputElement['autocomplete'];
		class?: string;
		inputClass?: string;
		min?: string | number;
		max?: string | number;
		step?: string | number;
		oninput?: (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => void;
		onchange?: (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => void;
		onblur?: (event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) => void;
	}

	let {
		type = 'text',
		name,
		id,
		value = $bindable(''),
		placeholder,
		label,
		error,
		hint,
		disabled = false,
		required = false,
		readonly = false,
		autocomplete,
		class: className = '',
		inputClass = '',
		min,
		max,
		step,
		oninput,
		onchange,
		onblur
	}: Props = $props();

	let inputId = $derived(id || name || crypto.randomUUID());

	const baseInputStyles = `
		w-full px-3 py-2
		border rounded-md
		text-sm text-gray-900 placeholder-gray-400
		bg-white dark:bg-gray-900
		dark:text-gray-100 dark:placeholder-gray-500
		focus:outline-none focus:ring-2 focus:ring-offset-0
		disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
		dark:disabled:bg-gray-800
	`;

	let inputStyles = $derived(
		cn(
			baseInputStyles,
			error
				? 'border-red-300 focus:border-red-500 focus:ring-red-500'
				: 'border-gray-300 focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] dark:border-gray-600',
			inputClass
		)
	);
</script>

<div class={cn('space-y-1.5', className)}>
	{#if label}
		<label for={inputId} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<input
		{type}
		{name}
		id={inputId}
		bind:value
		{placeholder}
		{disabled}
		{required}
		{readonly}
		{autocomplete}
		{min}
		{max}
		{step}
		aria-invalid={!!error}
		aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
		class={inputStyles}
		{oninput}
		{onchange}
		{onblur}
	/>

	{#if error}
		<p id="{inputId}-error" class="text-sm text-red-600 dark:text-red-400">
			{error}
		</p>
	{:else if hint}
		<p id="{inputId}-hint" class="text-sm text-gray-500 dark:text-gray-400">
			{hint}
		</p>
	{/if}
</div>
