<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// 重導向至儀表板
		goto('/dashboard');
	});
</script>

<div class="flex items-center justify-center min-h-screen">
	<div class="text-center">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">載入中...</h1>
		<p class="mt-2 text-gray-600 dark:text-gray-400">正在跳轉至儀表板</p>
	</div>
</div>
