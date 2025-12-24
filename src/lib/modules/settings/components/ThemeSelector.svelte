<script lang="ts">
	import type { Theme } from '../types';

	interface Props {
		value: Theme;
		onChange: (theme: Theme) => void;
	}

	let { value, onChange }: Props = $props();

	const themes: { value: Theme; label: string }[] = [
		{ value: 'light', label: '淺色' },
		{ value: 'dark', label: '深色' },
		{ value: 'system', label: '系統' }
	];

	function handleSelect(theme: Theme) {
		onChange(theme);
	}
</script>

<div class="grid grid-cols-3 gap-4">
	<!-- Light Theme -->
	<button
		type="button"
		onclick={() => handleSelect('light')}
		class="relative rounded-lg border-2 p-2 transition-all {value === 'light' ? 'border-[var(--color-primary-500)] ring-2 ring-[var(--color-primary-200)]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}"
	>
		<div class="rounded bg-white border border-gray-200 p-2 space-y-1">
			<div class="h-2 w-8 bg-gray-200 rounded"></div>
			<div class="h-2 w-12 bg-gray-100 rounded"></div>
			<div class="h-2 w-6 bg-gray-200 rounded"></div>
		</div>
		<span class="block mt-2 text-xs text-gray-600 dark:text-gray-400">淺色</span>
	</button>

	<!-- Dark Theme -->
	<button
		type="button"
		onclick={() => handleSelect('dark')}
		class="relative rounded-lg border-2 p-2 transition-all {value === 'dark' ? 'border-[var(--color-primary-500)] ring-2 ring-[var(--color-primary-200)]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}"
	>
		<div class="rounded bg-gray-900 border border-gray-700 p-2 space-y-1">
			<div class="h-2 w-8 bg-gray-700 rounded"></div>
			<div class="h-2 w-12 bg-gray-800 rounded"></div>
			<div class="h-2 w-6 bg-gray-700 rounded"></div>
		</div>
		<span class="block mt-2 text-xs text-gray-600 dark:text-gray-400">深色</span>
	</button>

	<!-- System Theme -->
	<button
		type="button"
		onclick={() => handleSelect('system')}
		class="relative rounded-lg border-2 p-2 transition-all {value === 'system' ? 'border-[var(--color-primary-500)] ring-2 ring-[var(--color-primary-200)]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}"
	>
		<div class="rounded border border-gray-200 dark:border-gray-700 p-2 space-y-1 bg-gradient-to-r from-white to-gray-900">
			<div class="h-2 w-8 bg-gray-400 rounded"></div>
			<div class="h-2 w-12 bg-gray-500 rounded"></div>
			<div class="h-2 w-6 bg-gray-400 rounded"></div>
		</div>
		<span class="block mt-2 text-xs text-gray-600 dark:text-gray-400">系統</span>
	</button>
</div>
