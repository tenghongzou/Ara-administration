<script lang="ts">
	import { config } from '$lib/constants';
	import { usersApi, roleLabels, statusLabels } from '$lib/services';
	import type { User } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { exportToCSV, getExportFilename } from '$lib/utils';
	import {
		UsersActions,
		UsersContent,
		UsersDeleteModals
	} from '$lib/modules/users';

	let users = $state<User[]>([]);
	let loading = $state(true);
	let page = $state(1);
	let pageSize = $state(10);
	let total = $state(0);
	let search = $state('');
	let roleFilter = $state('');
	let statusFilter = $state('');
	let sortColumn = $state('');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let selectedUsers = $state<User[]>([]);

	let showDeleteModal = $state(false);
	let userToDelete = $state<User | null>(null);
	let deleting = $state(false);

	let showBatchDeleteModal = $state(false);
	let batchDeleting = $state(false);

	async function loadUsers() {
		loading = true;
		try {
			const response = await usersApi.getUsers({
				page,
				pageSize,
				search,
				role: roleFilter,
				status: statusFilter,
				sortBy: sortColumn,
				sortDirection
			});
			users = response.data;
			total = response.pagination.total;
		} catch (error) {
			toast.error('載入使用者失敗');
		} finally {
			loading = false;
		}
	}

	function handleSort(column: string, direction: 'asc' | 'desc') {
		sortColumn = column;
		sortDirection = direction;
		loadUsers();
	}

	function handlePageChange(newPage: number) {
		page = newPage;
		selectedUsers = [];
		loadUsers();
	}

	function handlePageSizeChange(newPageSize: number) {
		pageSize = newPageSize;
		page = 1;
		selectedUsers = [];
		loadUsers();
	}

	function handleSearch() {
		page = 1;
		selectedUsers = [];
		loadUsers();
	}

	function handleSelectionChange(rows: User[]) {
		selectedUsers = rows;
	}

	function confirmDelete(user: User) {
		userToDelete = user;
		showDeleteModal = true;
	}

	async function handleDelete() {
		if (!userToDelete) return;

		deleting = true;
		try {
			await usersApi.deleteUser(userToDelete.id);
			toast.success('使用者已刪除');
			showDeleteModal = false;
			userToDelete = null;
			loadUsers();
		} catch (error) {
			toast.error('刪除使用者失敗');
		} finally {
			deleting = false;
		}
	}

	async function handleBatchDelete() {
		if (selectedUsers.length === 0) return;

		batchDeleting = true;
		try {
			await Promise.all(selectedUsers.map((user) => usersApi.deleteUser(user.id)));
			toast.success(`已刪除 ${selectedUsers.length} 位使用者`);
			showBatchDeleteModal = false;
			selectedUsers = [];
			loadUsers();
		} catch (error) {
			toast.error('批次刪除失敗');
		} finally {
			batchDeleting = false;
		}
	}

	$effect(() => {
		loadUsers();
	});

	function handleExport() {
		const dataToExport = selectedUsers.length > 0 ? selectedUsers : users;
		if (dataToExport.length === 0) {
			toast.error('沒有可匯出的資料');
			return;
		}

		const columns = [
			{ key: 'name' as const, label: '姓名' },
			{ key: 'email' as const, label: '電子郵件' },
			{ key: 'role' as const, label: '角色' },
			{ key: 'status' as const, label: '狀態' },
			{ key: 'createdAt' as const, label: '建立時間' },
			{ key: 'lastLoginAt' as const, label: '最後登入' }
		];

		exportToCSV(
			dataToExport.map((u) => ({
				...u,
				role: roleLabels[u.role],
				status: statusLabels[u.status]
			})),
			getExportFilename('users'),
			columns
		);
		toast.success(`已匯出 ${dataToExport.length} 筆使用者資料`);
	}
</script>

<svelte:head>
	<title>使用者管理 - {config.appName}</title>
</svelte:head>

<PageContainer title="使用者管理" description="管理系統使用者帳號與權限" backLink="/settings" backLabel="返回設定">
	{#snippet actions()}
		<UsersActions
			selectedCount={selectedUsers.length}
			onBatchDelete={() => (showBatchDeleteModal = true)}
			onExport={handleExport}
		/>
	{/snippet}

	<UsersContent
		{users}
		{loading}
		bind:search
		bind:roleFilter
		bind:statusFilter
		selectedRows={selectedUsers}
		{sortColumn}
		{sortDirection}
		{page}
		{pageSize}
		{total}
		onSearch={handleSearch}
		onSelectionChange={handleSelectionChange}
		onSort={handleSort}
		onRefresh={loadUsers}
		onDelete={confirmDelete}
		onPageChange={handlePageChange}
		onPageSizeChange={handlePageSizeChange}
	/>
</PageContainer>

<UsersDeleteModals
	bind:showDeleteModal
	{userToDelete}
	{deleting}
	onDeleteConfirm={handleDelete}
	onDeleteCancel={() => (showDeleteModal = false)}
	bind:showBatchDeleteModal
	selectedCount={selectedUsers.length}
	{batchDeleting}
	onBatchDeleteConfirm={handleBatchDelete}
	onBatchDeleteCancel={() => (showBatchDeleteModal = false)}
/>
