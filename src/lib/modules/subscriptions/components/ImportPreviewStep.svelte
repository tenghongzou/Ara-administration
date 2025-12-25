<script lang="ts">
	import { Button, Spinner } from '$lib/components/ui';
	import { ImportPreview } from '$lib/components/subscriptions';
	import { ArrowLeft } from 'lucide-svelte';
	import type { MappedSubscription } from '$lib/utils/csv-parser';

	interface Props {
		subscriptions: MappedSubscription[];
		duplicateRows: Set<number>;
		selectedRows: Set<number>;
		importing?: boolean;
		onSelectionChange: (selected: Set<number>) => void;
		onBack: () => void;
		onImport: () => void;
	}

	let {
		subscriptions,
		duplicateRows,
		selectedRows,
		importing = false,
		onSelectionChange,
		onBack,
		onImport
	}: Props = $props();
</script>

<div class="space-y-6">
	<ImportPreview
		{subscriptions}
		{duplicateRows}
		{selectedRows}
		onSelectionChange={onSelectionChange}
	/>

	<div class="flex items-center justify-between">
		<Button variant="outline" onclick={onBack}>
			<ArrowLeft class="w-4 h-4 mr-2" />
			上一步
		</Button>
		<Button onclick={onImport} disabled={selectedRows.size === 0 || importing}>
			{#if importing}
				<Spinner size="sm" class="mr-2" />
				匯入中...
			{:else}
				匯入 {selectedRows.size} 筆資料
			{/if}
		</Button>
	</div>
</div>
