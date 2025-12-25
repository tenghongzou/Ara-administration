<script lang="ts">
	import type { Theme } from '../types';
	import ThemeSection from './ThemeSection.svelte';
	import LanguageSection from './LanguageSection.svelte';
	import DisplaySection from './DisplaySection.svelte';
	import GeneralSettingsActions from './GeneralSettingsActions.svelte';

	interface Props {
		theme: Theme;
		language?: string;
		compactMode?: boolean;
		animationsEnabled?: boolean;
		saving?: boolean;
		onThemeChange: (theme: Theme) => void;
		onLanguageChange?: (lang: string) => void;
		onCompactModeChange?: (value: boolean) => void;
		onAnimationsChange?: (value: boolean) => void;
		onSave: () => void;
	}

	let {
		theme,
		language = $bindable('zh-TW'),
		compactMode = $bindable(false),
		animationsEnabled = $bindable(true),
		saving = false,
		onThemeChange,
		onSave
	}: Props = $props();
</script>

<div class="max-w-3xl mx-auto space-y-6">
	<ThemeSection value={theme} onChange={onThemeChange} />

	<LanguageSection bind:value={language} />

	<DisplaySection bind:compactMode bind:animationsEnabled />

	<GeneralSettingsActions {saving} onSave={onSave} />
</div>
