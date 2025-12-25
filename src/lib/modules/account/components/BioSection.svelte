<script lang="ts">
	import { Card } from '$lib/components/ui';

	interface Props {
		value: string;
		error?: string;
		maxLength?: number;
		onUpdate: (value: string) => void;
	}

	let { value, error = '', maxLength = 500, onUpdate }: Props = $props();

	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		onUpdate(target.value);
	}
</script>

<Card variant="bordered">
	{#snippet header()}
		<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">個人簡介</h2>
	{/snippet}
	{#snippet children()}
		<div class="space-y-1.5">
			<label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				自我介紹
			</label>
			<textarea
				id="bio"
				{value}
				oninput={handleInput}
				rows={4}
				class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] resize-none"
				placeholder="介紹一下自己..."
			></textarea>
			<div class="flex justify-between">
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{#if error}
						<span class="text-red-500">{error}</span>
					{:else}
						最多 {maxLength} 字元
					{/if}
				</p>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{value.length}/{maxLength}
				</p>
			</div>
		</div>
	{/snippet}
</Card>
