<script lang="ts">
	import { config } from '$lib/constants';
	import { rolesApi } from '$lib/services';
	import type { Role } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Button, Badge, Modal } from '$lib/components/ui';
	import { DataGrid } from '$lib/components/data-display';
	import { PermissionGuard } from '$lib/components/auth';
	import { getPermissionLabel, getRoleColorClass } from '$lib/permissions';
	import { hasPermission } from '$lib/stores/auth';
	import type { DataGridColumn } from '$lib/types';

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

	type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';

	function getRoleBadgeVariant(colorValue: string): BadgeVariant {
		const colorMap: Record<string, BadgeVariant> = {
			red: 'error',
			orange: 'warning',
			amber: 'warning',
			yellow: 'warning',
			green: 'success',
			emerald: 'success',
			teal: 'info',
			cyan: 'info',
			sky: 'info',
			blue: 'info',
			indigo: 'info',
			violet: 'info',
			purple: 'info',
			pink: 'error',
			rose: 'error',
			gray: 'default'
		};
		return colorMap[colorValue] || 'default';
	}

	function getPermissionCount(role: Role): string {
		if (role.permissions.includes('*')) return '全部權限';
		return `${role.permissions.length} 項`;
	}

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

	const columns: DataGridColumn<Role>[] = [
		{
			key: 'label',
			header: '角色名稱',
			minWidth: '200px',
			render: labelCell
		},
		{
			key: 'key',
			header: '識別碼',
			width: '120px',
			render: keyCell
		},
		{
			key: 'permissions',
			header: '權限',
			minWidth: '200px',
			render: permissionsCell
		},
		{
			key: 'userCount',
			header: '使用者',
			width: '100px',
			align: 'center',
			render: userCountCell
		},
		{
			key: 'isSystem',
			header: '類型',
			width: '80px',
			align: 'center',
			render: typeCell
		},
		{
			key: 'actions',
			header: '操作',
			width: '120px',
			align: 'center',
			render: actionsCell
		}
	];
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

	<div class="space-y-4" data-testid="roles-page">
		<DataGrid
			data={roles}
			{columns}
			{loading}
			rowKey="id"
			onRefresh={loadRoles}
			striped
			hoverable
			responsiveMode="card"
			cardTitle="label"
			cardSubtitle="description"
			cardBadge="key"
		/>
	</div>
</PageContainer>

<!-- Delete Role Modal -->
<Modal bind:open={showDeleteModal} title="確認刪除" size="sm">
	{#snippet children()}
		<p class="text-gray-600 dark:text-gray-400">
			確定要刪除角色「<span class="font-medium text-gray-900 dark:text-gray-100">{roleToDelete?.label}</span>」嗎？此操作無法復原。
		</p>
	{/snippet}
	{#snippet footer()}
		<Button variant="outline" onclick={() => (showDeleteModal = false)}>
			{#snippet children()}取消{/snippet}
		</Button>
		<Button variant="danger" loading={deleting} onclick={handleDelete}>
			{#snippet children()}刪除{/snippet}
		</Button>
	{/snippet}
</Modal>

{#snippet labelCell(role: Role)}
	<div class="flex items-center gap-3">
		<div class={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getRoleColorClass(role.color)}`}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
			</svg>
		</div>
		<div class="min-w-0">
			<p class="font-medium text-gray-900 dark:text-gray-100 truncate">{role.label}</p>
			<p class="text-xs text-gray-500 dark:text-gray-400 truncate">{role.description}</p>
		</div>
	</div>
{/snippet}

{#snippet keyCell(role: Role)}
	<code class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-300">
		{role.key}
	</code>
{/snippet}

{#snippet permissionsCell(role: Role)}
	{#if role.permissions.includes('*')}
		<Badge variant="error" size="sm">
			{#snippet children()}全部權限{/snippet}
		</Badge>
	{:else}
		<div class="flex flex-wrap gap-1">
			{#each role.permissions.slice(0, 3) as permission}
				<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
					{getPermissionLabel(permission)}
				</span>
			{/each}
			{#if role.permissions.length > 3}
				<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
					+{role.permissions.length - 3}
				</span>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet userCountCell(role: Role)}
	<span class="text-gray-700 dark:text-gray-300">{role.userCount ?? 0}</span>
{/snippet}

{#snippet typeCell(role: Role)}
	{#if role.isSystem}
		<Badge variant="default" size="sm">
			{#snippet children()}系統{/snippet}
		</Badge>
	{:else}
		<Badge variant="info" size="sm">
			{#snippet children()}自訂{/snippet}
		</Badge>
	{/if}
{/snippet}

{#snippet actionsCell(role: Role)}
	<div class="flex items-center justify-center gap-1">
		{#if hasPermission('roles:update') && !(role.isSystem && role.key === 'admin')}
			<Button variant="ghost" size="icon" href="/settings/roles/{role.id}">
				{#snippet children()}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
					</svg>
				{/snippet}
			</Button>
		{:else if !hasPermission('roles:update')}
			<Button variant="ghost" size="icon" href="/settings/roles/{role.id}">
				{#snippet children()}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
					</svg>
				{/snippet}
			</Button>
		{/if}
		{#if hasPermission('roles:delete') && !role.isSystem}
			<Button variant="ghost" size="icon" onclick={() => confirmDelete(role)}>
				{#snippet children()}
					<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
				{/snippet}
			</Button>
		{/if}
	</div>
{/snippet}
