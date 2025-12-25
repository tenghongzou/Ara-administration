<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { ChevronRight } from 'lucide-svelte';
</script>

<Card variant="bordered">
	{#snippet children()}
		<div class="flex items-center justify-between">
			<div>
				<p class="font-medium text-gray-900 dark:text-gray-100">通知中心</p>
				<p class="text-sm text-gray-500 dark:text-gray-400">查看所有通知訊息</p>
			</div>
			<Button variant="outline" href="/notifications">
				{#snippet children()}
					前往通知中心
					<ChevronRight class="w-4 h-4 ml-1" />
				{/snippet}
			</Button>
		</div>
	{/snippet}
</Card>
