<script lang="ts">
	import { Card, Checkbox } from '$lib/components/ui';

	interface Props {
		compactMode?: boolean;
		animationsEnabled?: boolean;
		onCompactModeChange?: (value: boolean) => void;
		onAnimationsChange?: (value: boolean) => void;
	}

	let {
		compactMode = $bindable(false),
		animationsEnabled = $bindable(true),
		onCompactModeChange,
		onAnimationsChange
	}: Props = $props();
</script>

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
				onchange={() => onCompactModeChange?.(compactMode)}
			/>
			<Checkbox
				bind:checked={animationsEnabled}
				label="啟用動畫"
				description="介面過場動畫效果"
				onchange={() => onAnimationsChange?.(animationsEnabled)}
			/>
		</div>
	{/snippet}
</Card>
