<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { config } from '$lib/constants';
	import { rolesApi } from '$lib/services';
	import type { Role } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { auth, userPermissions, checkPermissionInList } from '$lib/stores/auth';
	import { PageContainer } from '$lib/components/layout';
	import { Button } from '$lib/components/ui';
	import { RoleDetailContent, type RoleFormData, type RoleFormErrors } from '$lib/modules/roles';

	let role = $state<Role | null>(null);
	let loading = $state(true);
	let saving = $state(false);

	let formData = $state<RoleFormData>({
		key: '',
		label: '',
		description: '',
		color: 'gray',
		permissions: []
	});
	let formErrors = $state<RoleFormErrors>({});
	let selectedPermissions = $state<Set<string>>(new Set());
	let hasChanges = $state(false);

	// Reactive permissions
	let permissions = $state<readonly string[]>([]);
	$effect(() => {
		const unsubscribe = userPermissions.subscribe((p) => {
			permissions = p;
		});
		return unsubscribe;
	});

	const roleId = $derived($page.params.id);
	const canEdit = $derived(checkPermissionInList(permissions, 'roles:update') && role && !(role.isSystem && role.key === 'admin') ? true : undefined);
	const isAdminRole = $derived(role?.isSystem && role?.key === 'admin');

	async function loadRole() {
		if (!roleId) {
			goto('/settings/roles');
			return;
		}

		loading = true;
		try {
			role = await rolesApi.getRole(roleId);
			formData = {
				key: role.key,
				label: role.label,
				description: role.description,
				color: role.color,
				permissions: role.permissions
			};
			selectedPermissions = new Set(role.permissions);
		} catch (error) {
			toast.error('載入角色失敗');
			goto('/settings/roles');
		} finally {
			loading = false;
		}
	}

	function handleFormChange() {
		hasChanges = true;
	}

	function handlePermissionsChange(permissions: Set<string>) {
		selectedPermissions = permissions;
		hasChanges = true;
	}

	async function handleSave() {
		if (!role || !canEdit) return;

		saving = true;
		try {
			await rolesApi.updateRole(role.id, {
				label: formData.label,
				description: formData.description,
				color: formData.color,
				permissions: Array.from(selectedPermissions)
			});
			toast.success('角色已更新');
			hasChanges = false;
			auth.refreshPermissions();
			await loadRole();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '更新角色失敗');
		} finally {
			saving = false;
		}
	}

	function handleReset() {
		if (role) {
			formData = {
				key: role.key,
				label: role.label,
				description: role.description,
				color: role.color,
				permissions: role.permissions
			};
			selectedPermissions = new Set(role.permissions);
			hasChanges = false;
		}
	}

	$effect(() => {
		if (roleId) {
			loadRole();
		}
	});
</script>

<svelte:head>
	<title>{role?.label || '角色'} - 角色設定 - {config.appName}</title>
</svelte:head>

<PageContainer
	title={role?.label || '載入中...'}
	description={role?.description || ''}
	backLink="/settings/roles"
	backLabel="返回角色列表"
>
	{#snippet actions()}
		{#if canEdit && hasChanges}
			<Button variant="outline" onclick={handleReset}>
				{#snippet children()}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					重設
				{/snippet}
			</Button>
			<Button loading={saving} onclick={handleSave}>
				{#snippet children()}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					儲存變更
				{/snippet}
			</Button>
		{/if}
	{/snippet}

	<div class="space-y-6" data-testid="role-edit-page">
		<RoleDetailContent
			{role}
			{loading}
			{canEdit}
			{isAdminRole}
			bind:formData
			{formErrors}
			{selectedPermissions}
			{hasChanges}
			disabled={saving}
			onFormChange={handleFormChange}
			onPermissionsChange={handlePermissionsChange}
		/>
	</div>
</PageContainer>
