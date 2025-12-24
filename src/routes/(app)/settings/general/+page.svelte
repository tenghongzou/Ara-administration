<script lang="ts">
	import { config } from '$lib/constants';
	import { toast } from '$lib/stores/toast';
	import { ui } from '$lib/stores/ui';
	import { applyTheme, type Theme } from '$lib/utils';
	import { PageContainer } from '$lib/components/layout';
	import { Button, Select, Card, Checkbox } from '$lib/components/ui';

	let currentTheme = $state<'light' | 'dark' | 'system'>('system');
	let language = $state('zh-TW');
	let compactMode = $state(false);
	let animationsEnabled = $state(true);
	let saving = $state(false);

	ui.subscribe((state) => {
		currentTheme = state.theme;
	});

	const themeOptions = [
		{ value: 'light', label: '淺色模式' },
		{ value: 'dark', label: '深色模式' },
		{ value: 'system', label: '跟隨系統' }
	];

	const languageOptions = [
		{ value: 'zh-TW', label: '繁體中文' },
		{ value: 'zh-CN', label: '简体中文' },
		{ value: 'en', label: 'English' },
		{ value: 'ja', label: '日本語' }
	];

	function handleThemeChange() {
		ui.setTheme(currentTheme);
		applyTheme(currentTheme);
		toast.success('主題已更新');
	}

	async function handleSave() {
		saving = true;
		try {
			await new Promise((resolve) => setTimeout(resolve, 500));
			toast.success('設定已儲存');
		} catch {
			toast.error('儲存失敗');
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>一般設定 - {config.appName}</title>
</svelte:head>

<PageContainer
	title="一般設定"
	description="主題模式、語言和外觀偏好設定"
	backLink="/settings"
	backLabel="返回設定"
>
	<div class="max-w-3xl mx-auto space-y-6">
		<!-- 主題設定 -->
		<Card variant="bordered">
			{#snippet header()}
				<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">主題設定</h2>
			{/snippet}
			{#snippet children()}
				<div class="space-y-4">
					<Select
						bind:value={currentTheme}
						options={themeOptions}
						label="主題模式"
						onchange={handleThemeChange}
					/>
					<p class="text-sm text-gray-500 dark:text-gray-400">
						選擇您偏好的介面主題。「跟隨系統」會根據您的作業系統設定自動切換。
					</p>

					<!-- 主題預覽 -->
					<div class="grid grid-cols-3 gap-4 pt-4">
						<button
							type="button"
							onclick={() => { currentTheme = 'light'; handleThemeChange(); }}
							class="relative rounded-lg border-2 p-2 transition-all {currentTheme === 'light' ? 'border-[var(--color-primary-500)] ring-2 ring-[var(--color-primary-200)]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}"
						>
							<div class="rounded bg-white border border-gray-200 p-2 space-y-1">
								<div class="h-2 w-8 bg-gray-200 rounded"></div>
								<div class="h-2 w-12 bg-gray-100 rounded"></div>
								<div class="h-2 w-6 bg-gray-200 rounded"></div>
							</div>
							<span class="block mt-2 text-xs text-gray-600 dark:text-gray-400">淺色</span>
						</button>
						<button
							type="button"
							onclick={() => { currentTheme = 'dark'; handleThemeChange(); }}
							class="relative rounded-lg border-2 p-2 transition-all {currentTheme === 'dark' ? 'border-[var(--color-primary-500)] ring-2 ring-[var(--color-primary-200)]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}"
						>
							<div class="rounded bg-gray-900 border border-gray-700 p-2 space-y-1">
								<div class="h-2 w-8 bg-gray-700 rounded"></div>
								<div class="h-2 w-12 bg-gray-800 rounded"></div>
								<div class="h-2 w-6 bg-gray-700 rounded"></div>
							</div>
							<span class="block mt-2 text-xs text-gray-600 dark:text-gray-400">深色</span>
						</button>
						<button
							type="button"
							onclick={() => { currentTheme = 'system'; handleThemeChange(); }}
							class="relative rounded-lg border-2 p-2 transition-all {currentTheme === 'system' ? 'border-[var(--color-primary-500)] ring-2 ring-[var(--color-primary-200)]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}"
						>
							<div class="rounded border border-gray-200 dark:border-gray-700 p-2 space-y-1 bg-gradient-to-r from-white to-gray-900">
								<div class="h-2 w-8 bg-gray-400 rounded"></div>
								<div class="h-2 w-12 bg-gray-500 rounded"></div>
								<div class="h-2 w-6 bg-gray-400 rounded"></div>
							</div>
							<span class="block mt-2 text-xs text-gray-600 dark:text-gray-400">系統</span>
						</button>
					</div>
				</div>
			{/snippet}
		</Card>

		<!-- 語言設定 -->
		<Card variant="bordered">
			{#snippet header()}
				<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">語言設定</h2>
			{/snippet}
			{#snippet children()}
				<div class="space-y-4">
					<Select
						bind:value={language}
						options={languageOptions}
						label="介面語言"
					/>
					<p class="text-sm text-gray-500 dark:text-gray-400">
						選擇介面顯示的語言。變更後需要重新載入頁面。
					</p>
				</div>
			{/snippet}
		</Card>

		<!-- 顯示設定 -->
		<Card variant="bordered">
			{#snippet header()}
				<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">顯示設定</h2>
			{/snippet}
			{#snippet children()}
				<div class="space-y-4">
					<Checkbox
						bind:checked={compactMode}
						label="精簡模式"
						description="減少介面元素間距，在螢幕上顯示更多內容"
					/>
					<Checkbox
						bind:checked={animationsEnabled}
						label="啟用動畫"
						description="介面過場動畫效果"
					/>
				</div>
			{/snippet}
		</Card>

		<!-- 儲存按鈕 -->
		<div class="flex justify-end gap-3">
			<Button variant="outline" href="/settings">
				{#snippet children()}取消{/snippet}
			</Button>
			<Button loading={saving} onclick={handleSave}>
				{#snippet children()}儲存設定{/snippet}
			</Button>
		</div>
	</div>
</PageContainer>
