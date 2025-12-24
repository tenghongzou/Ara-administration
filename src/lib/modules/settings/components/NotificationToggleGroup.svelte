<script lang="ts">
	import { Toggle } from '$lib/components/forms';

	interface ToggleItem {
		key: string;
		label: string;
		description: string;
		checked: boolean;
	}

	interface Props {
		items: ToggleItem[];
		disabled?: boolean;
		onToggle: (key: string, value: boolean) => void;
	}

	let { items, disabled = false, onToggle }: Props = $props();
</script>

<div class="space-y-4">
	{#each items as item}
		<div class="flex items-center justify-between py-2">
			<div>
				<p class="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
				<p class="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
			</div>
			<Toggle
				checked={item.checked}
				{disabled}
				onchange={() => onToggle(item.key, !item.checked)}
			/>
		</div>
	{/each}
</div>
