<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import '../app.css';
	import { ui } from '$lib/stores/ui';
	import { initTheme, type Theme } from '$lib/utils';

	let { children } = $props();

	onMount(() => {
		// Initialize theme from store
		let currentTheme: Theme = 'system';
		const unsubscribe = ui.subscribe((state) => {
			currentTheme = state.theme;
		});
		initTheme(currentTheme);
		unsubscribe();
	});
</script>

<svelte:head>
	<title>Admin Dashboard</title>
	<meta name="description" content="後台管理系統" />
</svelte:head>

{@render children()}
