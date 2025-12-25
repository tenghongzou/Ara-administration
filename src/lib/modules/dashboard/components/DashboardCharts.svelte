<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { SimpleChart } from '$lib/components/data-display';
	import { mockUserGrowthData, mockPageViewsData } from '$lib/services';
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<Card variant="bordered">
		{#snippet header()}
			<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">使用者成長趨勢</h2>
		{/snippet}
		{#snippet children()}
			<SimpleChart data={mockUserGrowthData} type="line" height={220} color="var(--color-primary-500)" />
		{/snippet}
	</Card>

	<Card variant="bordered">
		{#snippet header()}
			<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">每週頁面瀏覽</h2>
		{/snippet}
		{#snippet children()}
			<SimpleChart data={mockPageViewsData} type="bar" height={220} color="#10b981" />
		{/snippet}
	</Card>
</div>
