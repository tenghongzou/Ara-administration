<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		checked?: boolean;
		disabled?: boolean;
		size?: 'sm' | 'md' | 'lg';
		label?: string;
		description?: string;
		class?: string;
		onchange?: (checked: boolean) => void;
	}

	let {
		checked = $bindable(false),
		disabled = false,
		size = 'md',
		label,
		description,
		class: className = '',
		onchange
	}: Props = $props();

	const toggleId = crypto.randomUUID();

	function handleChange() {
		if (disabled) return;
		checked = !checked;
		onchange?.(checked);
	}

	const sizeStyles = {
		sm: {
			track: 'h-5 w-9',
			thumb: 'h-4 w-4',
			translate: 'translate-x-4'
		},
		md: {
			track: 'h-6 w-11',
			thumb: 'h-5 w-5',
			translate: 'translate-x-5'
		},
		lg: {
			track: 'h-7 w-14',
			thumb: 'h-6 w-6',
			translate: 'translate-x-7'
		}
	};

	let currentSize = $derived(sizeStyles[size]);
</script>

<div class={cn('flex items-center', className)}>
	<button
		type="button"
		id={toggleId}
		role="switch"
		aria-checked={checked}
		aria-labelledby={label ? `${toggleId}-label` : undefined}
		aria-describedby={description ? `${toggleId}-desc` : undefined}
		{disabled}
		onclick={handleChange}
		class={cn(
			'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
			currentSize.track,
			checked
				? 'bg-primary-600'
				: 'bg-gray-200 dark:bg-gray-700',
			disabled && 'cursor-not-allowed opacity-50'
		)}
	>
		<span class="sr-only">{label || 'Toggle'}</span>
		<span
			aria-hidden="true"
			class={cn(
				'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
				currentSize.thumb,
				checked ? currentSize.translate : 'translate-x-0'
			)}
		></span>
	</button>

	{#if label || description}
		<div class="ml-3">
			{#if label}
				<span
					id="{toggleId}-label"
					class={cn(
						'text-sm font-medium',
						disabled
							? 'text-gray-400 dark:text-gray-500'
							: 'text-gray-900 dark:text-gray-100'
					)}
				>
					{label}
				</span>
			{/if}
			{#if description}
				<p
					id="{toggleId}-desc"
					class="text-sm text-gray-500 dark:text-gray-400"
				>
					{description}
				</p>
			{/if}
		</div>
	{/if}
</div>
