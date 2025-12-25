<script lang="ts">
	import type { Role } from '$lib/types';
	import { Modal, Button } from '$lib/components/ui';

	interface Props {
		open?: boolean;
		role: Role | null;
		deleting?: boolean;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		open = $bindable(false),
		role,
		deleting = false,
		onConfirm,
		onCancel
	}: Props = $props();
</script>

<Modal bind:open title="確認刪除" size="sm">
	{#snippet children()}
		<p class="text-gray-600 dark:text-gray-400">
			確定要刪除角色「<span class="font-medium text-gray-900 dark:text-gray-100">{role?.label}</span>」嗎？此操作無法復原。
		</p>
	{/snippet}
	{#snippet footer()}
		<Button variant="outline" onclick={onCancel}>
			{#snippet children()}取消{/snippet}
		</Button>
		<Button variant="danger" loading={deleting} onclick={onConfirm}>
			{#snippet children()}刪除{/snippet}
		</Button>
	{/snippet}
</Modal>
