<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { config } from '$lib/constants';
	import { Button } from '$lib/components/ui';
	import { isAuthenticated } from '$lib/stores/auth';

	let status = $derived($page.status);
	let message = $derived($page.error?.message || '發生未知錯誤');

	// 根據錯誤碼取得對應資訊
	let errorInfo = $derived.by(() => {
		switch (status) {
			case 404:
				return {
					title: '找不到頁面',
					description: '您要找的頁面可能已被移除、名稱已更改或暫時無法使用。',
					icon: 'search',
					suggestions: [
						{ label: '檢查網址是否正確', icon: 'link' },
						{ label: '使用搜尋功能找到內容', icon: 'search' },
						{ label: '返回上一頁重新導覽', icon: 'back' }
					]
				};
			case 403:
				return {
					title: '存取被拒絕',
					description: '您沒有權限存取此頁面。請確認您已登入並擁有適當的權限。',
					icon: 'lock',
					suggestions: [
						{ label: '確認您已登入正確的帳號', icon: 'user' },
						{ label: '聯絡管理員取得權限', icon: 'mail' },
						{ label: '返回儀表板', icon: 'home' }
					]
				};
			case 500:
				return {
					title: '伺服器錯誤',
					description: '伺服器發生錯誤，我們正在努力修復中。請稍後再試。',
					icon: 'server',
					suggestions: [
						{ label: '重新整理頁面', icon: 'refresh' },
						{ label: '稍後再嘗試', icon: 'clock' },
						{ label: '聯絡技術支援', icon: 'mail' }
					]
				};
			case 502:
			case 503:
			case 504:
				return {
					title: '服務暫時無法使用',
					description: '伺服器正在維護或暫時過載，請稍後再試。',
					icon: 'maintenance',
					suggestions: [
						{ label: '等待幾分鐘後重試', icon: 'clock' },
						{ label: '檢查系統狀態頁面', icon: 'status' },
						{ label: '聯絡技術支援', icon: 'mail' }
					]
				};
			default:
				return {
					title: '發生錯誤',
					description: message || '發生未預期的錯誤，請稍後再試。',
					icon: 'warning',
					suggestions: [
						{ label: '重新整理頁面', icon: 'refresh' },
						{ label: '返回首頁', icon: 'home' },
						{ label: '聯絡支援', icon: 'mail' }
					]
				};
		}
	});

	function handleGoBack() {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			window.history.back();
		} else {
			goto('/');
		}
	}

	function handleRefresh() {
		if (typeof window !== 'undefined') {
			window.location.reload();
		}
	}

	// 檢查是否已登入，決定返回目標
	let authenticated = $state(false);
	$effect(() => {
		const unsubscribe = isAuthenticated.subscribe((value) => {
			authenticated = value;
		});
		return unsubscribe;
	});
	let homeUrl = $derived(authenticated ? '/dashboard' : '/login');
</script>

<svelte:head>
	<title>{status} - {errorInfo.title} - {config.appName}</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
	<div class="max-w-lg w-full">
		<!-- 錯誤圖示與狀態碼 -->
		<div class="text-center mb-8">
			<div class="relative inline-block">
				<!-- 背景圓圈動畫 -->
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
				</div>

				<!-- 狀態碼 -->
				<div class="relative z-10 w-32 h-32 flex items-center justify-center">
					<span class="text-6xl font-bold text-gray-300 dark:text-gray-700">{status}</span>
				</div>
			</div>
		</div>

		<!-- 錯誤卡片 -->
		<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
			<!-- 頂部裝飾條 -->
			<div class="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>

			<div class="p-8">
				<!-- 圖示 -->
				<div class="flex justify-center mb-6">
					{#if errorInfo.icon === 'search'}
						<div class="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
							<svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
					{:else if errorInfo.icon === 'lock'}
						<div class="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
							<svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
						</div>
					{:else if errorInfo.icon === 'server' || errorInfo.icon === 'maintenance'}
						<div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
							<svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
							</svg>
						</div>
					{:else}
						<div class="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
							<svg class="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
					{/if}
				</div>

				<!-- 標題與描述 -->
				<div class="text-center mb-6">
					<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
						{errorInfo.title}
					</h1>
					<p class="text-gray-600 dark:text-gray-400">
						{errorInfo.description}
					</p>
				</div>

				<!-- 建議操作 -->
				<div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
					<p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">您可以嘗試：</p>
					<ul class="space-y-2">
						{#each errorInfo.suggestions as suggestion}
							<li class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
								<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
								{suggestion.label}
							</li>
						{/each}
					</ul>
				</div>

				<!-- 操作按鈕 -->
				<div class="flex flex-col sm:flex-row gap-3">
					<Button class="flex-1" onclick={handleGoBack}>
						{#snippet children()}
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
							</svg>
							返回上頁
						{/snippet}
					</Button>
					<Button variant="outline" class="flex-1" href={homeUrl}>
						{#snippet children()}
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
							</svg>
							{authenticated ? '返回儀表板' : '前往登入'}
						{/snippet}
					</Button>
				</div>

				{#if status >= 500}
					<div class="mt-4">
						<Button variant="ghost" class="w-full" onclick={handleRefresh}>
							{#snippet children()}
								<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
								重新整理頁面
							{/snippet}
						</Button>
					</div>
				{/if}
			</div>
		</div>

		<!-- 錯誤詳細資訊（開發模式） -->
		{#if message && status !== 404}
			<div class="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
				<p class="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
					<span class="font-semibold">錯誤訊息：</span>{message}
				</p>
			</div>
		{/if}

		<!-- 頁腳 -->
		<div class="mt-8 text-center">
			<p class="text-sm text-gray-400 dark:text-gray-500">
				錯誤代碼：{status}
			</p>
		</div>
	</div>
</div>
