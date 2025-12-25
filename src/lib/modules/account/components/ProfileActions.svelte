<script lang="ts">
	import { Button } from '$lib/components/ui';

	interface Props {
		saving?: boolean;
		onCancel: () => void;
	}

	let { saving = false, onCancel }: Props = $props();
</script>

<div class="flex justify-end gap-3">
	<Button type="button" variant="outline" onclick={onCancel}>
		{#snippet children()}取消{/snippet}
	</Button>
	<Button type="submit" loading={saving}>
		{#snippet children()}儲存變更{/snippet}
	</Button>
</div>
