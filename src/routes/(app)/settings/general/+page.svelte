<script lang="ts">
	import { config } from '$lib/constants';
	import { toast } from '$lib/stores/toast';
	import { ui } from '$lib/stores/ui';
	import { applyTheme } from '$lib/utils';
	import { PageContainer } from '$lib/components/layout';
	import { GeneralSettingsContent, type Theme } from '$lib/modules/settings';

	let currentTheme = $state<Theme>('system');
	let language = $state('zh-TW');
	let compactMode = $state(false);
	let animationsEnabled = $state(true);
	let saving = $state(false);

	ui.subscribe((state) => {
		currentTheme = state.theme;
	});

	function handleThemeChange(theme: Theme) {
		currentTheme = theme;
		ui.setTheme(theme);
		applyTheme(theme);
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
	<GeneralSettingsContent
		theme={currentTheme}
		bind:language
		bind:compactMode
		bind:animationsEnabled
		{saving}
		onThemeChange={handleThemeChange}
		onSave={handleSave}
	/>
</PageContainer>
