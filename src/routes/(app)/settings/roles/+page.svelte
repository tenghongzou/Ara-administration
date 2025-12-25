<script lang="ts">
	import { config } from '$lib/constants';
	import { rolesApi } from '$lib/services';
	import type { Role } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Button } from '$lib/components/ui';
	import { PermissionGuard } from '$lib/components/auth';
	import { RolesContent, RolesDeleteModal } from '$lib/modules/roles';

	let roles = $state<Role[]>([]);
	let loading = $state(true);

	let showDeleteModal = $state(false);
	let roleToDelete = $state<Role | null>(null);
	let deleting = $state(false);

	async function loadRoles() {
		loading = true;
		try {
			const response = await rolesApi.getRoles();
			roles = response.data;
		} catch (error) {
			toast.error('載入角色失敗');
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadRoles();
	});

	function confirmDelete(role: Role) {
		roleToDelete = role;
		showDeleteModal = true;
	}

	async function handleDelete() {
		if (!roleToDelete) return;

		deleting = true;
		try {
			await rolesApi.deleteRole(roleToDelete.id);
			toast.success('角色已刪除');
			showDeleteModal = false;
			roleToDelete = null;
			loadRoles();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '刪除角色失敗');
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>角色管理 - {config.appName}</title>
</svelte:head>

<PageContainer
	title="角色管理"
	description="管理系統角色與權限設定"
	backLink="/settings"
	backLabel="返回設定"
>
	{#snippet actions()}
		<PermissionGuard permission="roles:create">
			{#snippet children()}
				<Button href="/settings/roles/new">
					{#snippet children()}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						新增角色
					{/snippet}
				</Button>
			{/snippet}
		</PermissionGuard>
	{/snippet}

	<RolesContent {roles} {loading} onRefresh={loadRoles} onDelete={confirmDelete} />
</PageContainer>

<RolesDeleteModal
	bind:open={showDeleteModal}
	role={roleToDelete}
	{deleting}
	onConfirm={handleDelete}
	onCancel={() => (showDeleteModal = false)}
/>
