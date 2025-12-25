<script lang="ts">
	import { Button } from '$lib/components/ui';

	interface Props {
		saving?: boolean;
		cancelHref?: string;
		onSave: () => void;
	}

	let { saving = false, cancelHref = '/settings', onSave }: Props = $props();
</script>

<div class="flex justify-end gap-3">
	<Button variant="outline" href={cancelHref}>
		{#snippet children()}取消{/snippet}
	</Button>
	<Button loading={saving} onclick={onSave}>
		{#snippet children()}儲存設定{/snippet}
	</Button>
</div>
