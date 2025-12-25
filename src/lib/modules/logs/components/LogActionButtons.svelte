<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { BarChart3, Upload } from 'lucide-svelte';

	interface Props {
		showStats?: boolean;
		exportDisabled?: boolean;
		onToggleStats: () => void;
		onExport: () => void;
	}

	let { showStats = false, exportDisabled = false, onToggleStats, onExport }: Props = $props();
</script>

<div class="flex gap-2">
	<Button variant="outline" onclick={onToggleStats}>
		{#snippet children()}
			<BarChart3 class="w-4 h-4" />
			{showStats ? '隱藏統計' : '顯示統計'}
		{/snippet}
	</Button>
	<Button variant="outline" onclick={onExport} disabled={exportDisabled}>
		{#snippet children()}
			<Upload class="w-4 h-4" />
			匯出日誌
		{/snippet}
	</Button>
</div>
