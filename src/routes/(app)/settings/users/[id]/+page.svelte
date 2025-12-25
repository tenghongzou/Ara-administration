<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { config } from '$lib/constants';
	import { usersApi } from '$lib/services';
	import type { User, UserRole, UserStatus } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { UserDetailContent } from '$lib/modules/users';

	let user = $state<User | null>(null);
	let loading = $state(true);
	let saving = $state(false);
	let errors = $state<Record<string, string>>({});

	let name = $state('');
	let email = $state('');
	let role = $state<UserRole>('viewer');
	let status = $state<UserStatus>('active');

	async function loadUser() {
		const userId = $page.params.id;
		if (!userId) {
			goto('/settings/users');
			return;
		}
		loading = true;
		try {
			user = await usersApi.getUser(userId);
			name = user.name;
			email = user.email;
			role = user.role;
			status = user.status;
		} catch (error) {
			toast.error('載入使用者失敗');
			goto('/settings/users');
		} finally {
			loading = false;
		}
	}

	function validate(): boolean {
		const newErrors: Record<string, string> = {};

		if (!name.trim()) {
			newErrors.name = '請輸入姓名';
		}

		if (!email.trim()) {
			newErrors.email = '請輸入電子郵件';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = '請輸入有效的電子郵件格式';
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!validate() || !user) return;

		saving = true;
		try {
			await usersApi.updateUser(user.id, {
				name: name.trim(),
				email: email.trim(),
				role,
				status
			});
			toast.success('使用者已更新');
			goto('/settings/users');
		} catch (error) {
			toast.error('更新使用者失敗');
		} finally {
			saving = false;
		}
	}

	function handleCancel() {
		goto('/settings/users');
	}

	$effect(() => {
		loadUser();
	});
</script>

<svelte:head>
	<title>{user ? `編輯 ${user.name}` : '載入中...'} - {config.appName}</title>
</svelte:head>

{#if !loading && user}
	<PageContainer title="編輯使用者" description="修改使用者帳號資訊" backLink="/settings/users" backLabel="返回列表">
		<UserDetailContent
			{user}
			{loading}
			{saving}
			{name}
			{email}
			{role}
			{status}
			{errors}
			onNameChange={(v) => name = v}
			onEmailChange={(v) => email = v}
			onRoleChange={(v) => role = v}
			onStatusChange={(v) => status = v}
			onSubmit={handleSubmit}
			onCancel={handleCancel}
		/>
	</PageContainer>
{:else}
	<UserDetailContent
		{user}
		{loading}
		{saving}
		{name}
		{email}
		{role}
		{status}
		{errors}
		onNameChange={(v) => name = v}
		onEmailChange={(v) => email = v}
		onRoleChange={(v) => role = v}
		onStatusChange={(v) => status = v}
		onSubmit={handleSubmit}
		onCancel={handleCancel}
	/>
{/if}
