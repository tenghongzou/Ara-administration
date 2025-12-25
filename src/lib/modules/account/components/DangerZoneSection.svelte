<script lang="ts">
	import { Card, Button } from '$lib/components/ui';

	interface Props {
		onDeleteAccount: () => void;
	}

	let { onDeleteAccount }: Props = $props();
</script>

<Card variant="bordered" class="border-red-200 dark:border-red-900">
	{#snippet header()}
		<div class="flex items-center gap-2">
			<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>
			<h2 class="text-lg font-semibold text-red-600 dark:text-red-400">危險區域</h2>
		</div>
	{/snippet}
	{#snippet children()}
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-900 dark:text-gray-100">刪除帳號</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">
						永久刪除您的帳號和所有相關資料。此操作無法復原。
					</p>
				</div>
				<Button variant="danger" onclick={onDeleteAccount}>
					{#snippet children()}刪除帳號{/snippet}
				</Button>
			</div>
		</div>
	{/snippet}
</Card>
