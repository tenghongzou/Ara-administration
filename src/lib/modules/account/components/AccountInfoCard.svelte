<script lang="ts">
	import { Card } from '$lib/components/ui';

	interface Props {
		username: string;
		role: string;
	}

	let { username, role }: Props = $props();
</script>

<Card variant="bordered">
	{#snippet header()}
		<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">帳號資訊</h2>
	{/snippet}
	{#snippet children()}
		<div class="space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
						使用者名稱
					</span>
					<div
						class="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400"
					>
						{username}
					</div>
					<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
						使用者名稱無法修改
					</p>
				</div>
				<div>
					<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
						角色
					</span>
					<div
						class="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400"
					>
						{role}
					</div>
					<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
						角色由管理員指派
					</p>
				</div>
			</div>
		</div>
	{/snippet}
</Card>
