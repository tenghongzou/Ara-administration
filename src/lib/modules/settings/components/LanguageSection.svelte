<script lang="ts">
	import { Card, Select } from '$lib/components/ui';
	import { languageOptions } from '../types';

	interface Props {
		value: string;
		onChange?: (value: string) => void;
	}

	let { value = $bindable(), onChange }: Props = $props();
</script>

<Card variant="bordered">
	{#snippet header()}
		<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">語言設定</h2>
	{/snippet}
	{#snippet children()}
		<div class="space-y-4">
			<Select
				bind:value
				options={languageOptions}
				label="介面語言"
				onchange={() => onChange?.(value)}
			/>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				選擇介面顯示的語言。變更後需要重新載入頁面。
			</p>
		</div>
	{/snippet}
</Card>
