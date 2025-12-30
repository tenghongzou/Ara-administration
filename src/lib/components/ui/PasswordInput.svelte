<script lang="ts">
	import { cn, generateUUID } from '$lib/utils';

	interface Props {
		name?: string;
		id?: string;
		value?: string;
		placeholder?: string;
		label?: string;
		error?: string;
		hint?: string;
		disabled?: boolean;
		required?: boolean;
		readonly?: boolean;
		autocomplete?: 'current-password' | 'new-password' | 'off';
		showStrength?: boolean;
		class?: string;
		inputClass?: string;
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
		onblur?: (event: FocusEvent) => void;
	}

	let {
		name,
		id,
		value = $bindable(''),
		placeholder = '••••••••',
		label,
		error,
		hint,
		disabled = false,
		required = false,
		readonly = false,
		autocomplete = 'current-password',
		showStrength = false,
		class: className = '',
		inputClass = '',
		oninput,
		onchange,
		onblur
	}: Props = $props();

	let showPassword = $state(false);
	let inputId = $derived(id || name || generateUUID());

	// Password strength calculation
	let strength = $derived.by(() => {
		if (!value || !showStrength) return { score: 0, label: '', color: '' };

		let score = 0;
		const checks = {
			length: value.length >= 8,
			lowercase: /[a-z]/.test(value),
			uppercase: /[A-Z]/.test(value),
			number: /[0-9]/.test(value),
			special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
		};

		score = Object.values(checks).filter(Boolean).length;

		if (score <= 1) return { score: 1, label: '弱', color: 'bg-red-500' };
		if (score <= 2) return { score: 2, label: '普通', color: 'bg-orange-500' };
		if (score <= 3) return { score: 3, label: '中等', color: 'bg-yellow-500' };
		if (score <= 4) return { score: 4, label: '強', color: 'bg-green-500' };
		return { score: 5, label: '非常強', color: 'bg-green-600' };
	});

	const baseInputStyles = `
		w-full px-3 py-2 pr-10
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

	function toggleVisibility() {
		showPassword = !showPassword;
	}
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

	<div class="relative">
		<input
			type={showPassword ? 'text' : 'password'}
			{name}
			id={inputId}
			bind:value
			{placeholder}
			{disabled}
			{required}
			{readonly}
			{autocomplete}
			aria-invalid={!!error}
			aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
			class={inputStyles}
			{oninput}
			{onchange}
			{onblur}
		/>

		<button
			type="button"
			onclick={toggleVisibility}
			disabled={disabled}
			class={cn(
				'absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded',
				'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
				'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-1',
				'disabled:opacity-50 disabled:cursor-not-allowed',
				'transition-colors duration-200'
			)}
			aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
			tabindex="-1"
		>
			{#if showPassword}
				<!-- Eye Off Icon -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
					<line x1="1" y1="1" x2="23" y2="23" />
				</svg>
			{:else}
				<!-- Eye Icon -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
			{/if}
		</button>
	</div>

	{#if showStrength && value}
		<div class="space-y-1">
			<div class="flex gap-1">
				{#each Array(5) as _, i}
					<div
						class={cn(
							'h-1 flex-1 rounded-full transition-colors duration-200',
							i < strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-700'
						)}
					></div>
				{/each}
			</div>
			<p class="text-xs text-gray-500 dark:text-gray-400">
				密碼強度：<span
					class={cn(
						strength.score <= 1 && 'text-red-500',
						strength.score === 2 && 'text-orange-500',
						strength.score === 3 && 'text-yellow-600',
						strength.score >= 4 && 'text-green-500'
					)}>{strength.label}</span
				>
			</p>
		</div>
	{/if}

	{#if error}
		<p id="{inputId}-error" class="text-sm text-red-600 dark:text-red-400">
			{error}
		</p>
	{:else if hint && !showStrength}
		<p id="{inputId}-hint" class="text-sm text-gray-500 dark:text-gray-400">
			{hint}
		</p>
	{/if}
</div>
