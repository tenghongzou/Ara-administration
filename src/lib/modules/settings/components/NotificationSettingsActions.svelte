<script lang="ts">
	import { Button } from '$lib/components/ui';

	interface Props {
		saving?: boolean;
		hasChanges?: boolean;
		cancelHref?: string;
		onSave: () => void;
	}

	let { saving = false, hasChanges = false, cancelHref = '/settings', onSave }: Props = $props();
</script>

<div class="flex items-center justify-between">
	<div>
		{#if hasChanges}
			<p class="text-sm text-orange-600 dark:text-orange-400">
				有未儲存的變更
			</p>
		{/if}
	</div>
	<div class="flex gap-3">
		<Button variant="outline" href={cancelHref}>
			{#snippet children()}取消{/snippet}
		</Button>
		<Button loading={saving} disabled={!hasChanges} onclick={onSave}>
			{#snippet children()}儲存設定{/snippet}
		</Button>
	</div>
</div>
