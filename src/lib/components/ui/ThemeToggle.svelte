<script lang="ts">
	import { browser } from '$app/environment';
	import { cn, applyTheme, type Theme } from '$lib/utils';
	import { ui } from '$lib/stores/ui';

	interface Props {
		size?: 'sm' | 'md';
		class?: string;
	}

	let { size = 'md', class: className = '' }: Props = $props();

	let currentTheme = $state<Theme>('system');

	ui.subscribe((state) => {
		currentTheme = state.theme;
	});

	const themes: Theme[] = ['light', 'dark', 'system'];

	function handleClick() {
		const currentIndex = themes.indexOf(currentTheme);
		const nextIndex = (currentIndex + 1) % themes.length;
		const nextTheme = themes[nextIndex];

		currentTheme = nextTheme;
		ui.setTheme(nextTheme);

		if (browser) {
			applyTheme(nextTheme);
		}
	}

	const iconSize = $derived(size === 'sm' ? 'w-4 h-4' : 'w-5 h-5');
	const buttonSize = $derived(size === 'sm' ? 'p-1.5' : 'p-2');

	const themeLabel = $derived(
		currentTheme === 'light' ? '淺色' : currentTheme === 'dark' ? '深色' : '系統'
	);
</script>

<button
	type="button"
	class={cn(
		buttonSize,
		'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
		'rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
		className
	)}
	onclick={handleClick}
	aria-label="切換主題：{themeLabel}"
	title="主題：{themeLabel}（點擊切換）"
>
	{#if currentTheme === 'light'}
		<!-- Sun icon -->
		<svg class={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
			/>
		</svg>
	{:else if currentTheme === 'dark'}
		<!-- Moon icon -->
		<svg class={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
			/>
		</svg>
	{:else}
		<!-- Computer/System icon -->
		<svg class={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
			/>
		</svg>
	{/if}
</button>
