<script lang="ts">
	import { Card, Select } from '$lib/components/ui';
	import ThemeSelector from './ThemeSelector.svelte';
	import { themeOptions, type Theme } from '../types';

	interface Props {
		value: Theme;
		onChange: (theme: Theme) => void;
	}

	let { value, onChange }: Props = $props();

	function handleSelectChange() {
		onChange(value);
	}
</script>

<Card variant="bordered">
	{#snippet header()}
		<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">主題設定</h2>
	{/snippet}
	{#snippet children()}
		<div class="space-y-4">
			<Select
				bind:value
				options={themeOptions}
				label="主題模式"
				onchange={handleSelectChange}
			/>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				選擇您偏好的介面主題。「跟隨系統」會根據您的作業系統設定自動切換。
			</p>

			<div class="pt-4">
				<ThemeSelector {value} {onChange} />
			</div>
		</div>
	{/snippet}
</Card>
