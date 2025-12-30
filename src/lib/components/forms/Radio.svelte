<script lang="ts">
	import { cn, generateUUID } from '$lib/utils';

	interface Option {
		value: string;
		label: string;
		description?: string;
		disabled?: boolean;
	}

	interface Props {
		name: string;
		options: Option[];
		value?: string;
		label?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		orientation?: 'horizontal' | 'vertical';
		class?: string;
		onchange?: (value: string) => void;
	}

	let {
		name,
		options,
		value = $bindable(''),
		label,
		error,
		disabled = false,
		required = false,
		orientation = 'vertical',
		class: className = '',
		onchange
	}: Props = $props();

	const groupId = generateUUID();

	function handleChange(optionValue: string) {
		if (disabled) return;
		value = optionValue;
		onchange?.(optionValue);
	}

	const radioStyles = `
		h-4 w-4
		border-gray-300 text-primary-600
		focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
		disabled:opacity-50 disabled:cursor-not-allowed
		dark:border-gray-600 dark:bg-gray-900
	`;
</script>

<div class={cn('space-y-2', className)} role="radiogroup" aria-labelledby={label ? `${groupId}-label` : undefined}>
	{#if label}
		<span id="{groupId}-label" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
			{#if required}
				<span class="text-red-500" aria-hidden="true">*</span>
			{/if}
		</span>
	{/if}

	<div
		class={cn(
			'flex gap-4',
			orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
		)}
	>
		{#each options as option}
			{@const optionId = `${groupId}-${option.value}`}
			{@const isDisabled = disabled || option.disabled}
			<label
				for={optionId}
				class={cn(
					'flex items-start gap-3 cursor-pointer',
					isDisabled && 'cursor-not-allowed opacity-50'
				)}
			>
				<input
					type="radio"
					id={optionId}
					{name}
					value={option.value}
					checked={value === option.value}
					disabled={isDisabled}
					required={required && value === ''}
					class={radioStyles}
					onchange={() => handleChange(option.value)}
					aria-describedby={option.description ? `${optionId}-desc` : undefined}
				/>
				<div class="flex flex-col">
					<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
						{option.label}
					</span>
					{#if option.description}
						<span
							id="{optionId}-desc"
							class="text-sm text-gray-500 dark:text-gray-400"
						>
							{option.description}
						</span>
					{/if}
				</div>
			</label>
		{/each}
	</div>

	{#if error}
		<p class="text-sm text-red-600 dark:text-red-400" role="alert">
			{error}
		</p>
	{/if}
</div>
