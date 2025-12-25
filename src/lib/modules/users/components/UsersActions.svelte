<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { PermissionGuard } from '$lib/components/auth';

	interface Props {
		selectedCount: number;
		onBatchDelete: () => void;
		onExport: () => void;
	}

	let { selectedCount, onBatchDelete, onExport }: Props = $props();
</script>

<div class="flex items-center gap-2">
	<PermissionGuard permission="users:delete">
		{#snippet children()}
			{#if selectedCount > 0}
				<Button variant="danger" onclick={onBatchDelete}>
					{#snippet children()}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
						刪除選中 ({selectedCount})
					{/snippet}
				</Button>
			{/if}
		{/snippet}
	</PermissionGuard>
	<PermissionGuard permission="export:data">
		{#snippet children()}
			<Button variant="outline" onclick={onExport}>
				{#snippet children()}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
						/>
					</svg>
					{selectedCount > 0 ? `匯出選中 (${selectedCount})` : '匯出'}
				{/snippet}
			</Button>
		{/snippet}
	</PermissionGuard>
	<PermissionGuard permission="users:create">
		{#snippet children()}
			<div data-testid="add-user-button">
				<Button href="/settings/users/new">
					{#snippet children()}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						新增使用者
					{/snippet}
				</Button>
			</div>
		{/snippet}
	</PermissionGuard>
</div>
