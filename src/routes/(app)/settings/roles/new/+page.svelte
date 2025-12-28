<script lang="ts">
	import { goto } from '$app/navigation';
	import { config } from '$lib/constants';
	import { rolesApi } from '$lib/services';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Button } from '$lib/components/ui';
	import { RoleForm, PermissionSelector, rolesService, type RoleFormData, type RoleFormErrors } from '$lib/modules/roles';

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

	function handleFormChange() {
		// Clear errors when form changes
		if (formErrors.key && formData.key) {
			formErrors = { ...formErrors, key: undefined };
		}
	}

	function handlePermissionsChange(permissions: Set<string>) {
		selectedPermissions = permissions;
	}

	async function handleSave() {
		// Validate
		formErrors = rolesService.validateForm(formData);
		if (!rolesService.isFormValid(formErrors)) {
			return;
		}

		if (!formData.label.trim()) {
			toast.error('請輸入角色名稱');
			return;
		}

		saving = true;
		try {
			const newRole = await rolesApi.createRole({
				key: formData.key,
				label: formData.label,
				description: formData.description,
				color: formData.color,
				permissions: Array.from(selectedPermissions)
			});
			toast.success('角色已建立');
			goto(`/settings/roles/${newRole.id}`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '建立角色失敗');
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>新增角色 - {config.appName}</title>
</svelte:head>

<PageContainer
	title="新增角色"
	description="建立新的系統角色並設定權限"
	backLink="/settings/roles"
	backLabel="返回角色列表"
>
	{#snippet actions()}
		<Button loading={saving} onclick={handleSave}>
			{#snippet children()}
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
				建立角色
			{/snippet}
		</Button>
	{/snippet}

	<div class="space-y-6" data-testid="role-new-page">
		<RoleForm
			bind:form={formData}
			errors={formErrors}
			disabled={saving}
			isEdit={false}
			onChange={handleFormChange}
		/>

		<PermissionSelector
			{selectedPermissions}
			disabled={saving}
			onChange={handlePermissionsChange}
		/>
	</div>
</PageContainer>
