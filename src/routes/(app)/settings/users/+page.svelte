<script lang="ts">
	import { config, roleOptions, userStatusOptions } from '$lib/constants';
	import { usersApi, roleLabels, statusLabels, statusColors } from '$lib/services';
	import type { User } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Button, Badge, Input, Select, ConfirmModal } from '$lib/components/ui';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import { DataGrid, Pagination } from '$lib/components/data-display';
	import { PermissionGuard } from '$lib/components/auth';
	import type { DataGridColumn } from '$lib/types';
	import { exportToCSV, getExportFilename } from '$lib/utils';
	import { hasPermission } from '$lib/stores/auth';

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

	// 使用從 constants 匯入的選項
	const statusOptions = userStatusOptions;

	const columns: DataGridColumn<User>[] = [
		{
			key: 'name',
			header: '使用者',
			minWidth: '200px',
			sortable: true,
			render: nameCell
		},
		{
			key: 'role',
			header: '角色',
			width: '120px',
			sortable: true,
			align: 'center',
			render: roleCell
		},
		{
			key: 'status',
			header: '狀態',
			width: '100px',
			sortable: true,
			align: 'center',
			render: statusCell
		},
		{
			key: 'createdAt',
			header: '建立時間',
			width: '150px',
			sortable: true,
			render: createdAtCell
		},
		{
			key: 'lastLoginAt',
			header: '最後登入',
			width: '150px',
			sortable: true,
			render: lastLoginCell
		},
		{
			key: 'actions',
			header: '操作',
			width: '120px',
			align: 'center',
			render: actionsCell
		}
	];

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

	function formatDate(dateString?: string): string {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}

	function formatDateTime(dateString?: string): string {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

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
		<PermissionGuard permission="users:delete">
			{#snippet children()}
				{#if selectedUsers.length > 0}
					<Button variant="danger" onclick={() => (showBatchDeleteModal = true)}>
						{#snippet children()}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							刪除選中 ({selectedUsers.length})
						{/snippet}
					</Button>
				{/if}
			{/snippet}
		</PermissionGuard>
		<PermissionGuard permission="export:data">
			{#snippet children()}
				<Button variant="outline" onclick={handleExport}>
					{#snippet children()}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
							/>
						</svg>
						{selectedUsers.length > 0 ? `匯出選中 (${selectedUsers.length})` : '匯出'}
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
	{/snippet}

	<div class="space-y-4" data-testid="users-page">
		<!-- Filters -->
		<div
			class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
			data-testid="users-filters"
		>
			<div class="flex flex-col lg:flex-row gap-4">
				<div class="flex-1">
					<Input
						bind:value={search}
						placeholder="搜尋使用者名稱或電子郵件..."
						onchange={handleSearch}
						id="user-search"
					>
					</Input>
				</div>
				<div class="flex flex-wrap gap-2">
					<div class="w-36">
						<Select
							bind:value={roleFilter}
							options={roleOptions}
							placeholder="角色"
							onchange={handleSearch}
						/>
					</div>
					<div class="w-36">
						<Select
							bind:value={statusFilter}
							options={statusOptions}
							placeholder="狀態"
							onchange={handleSearch}
						/>
					</div>
					<Button variant="outline" onclick={handleSearch}>
						{#snippet children()}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							搜尋
						{/snippet}
					</Button>
				</div>
			</div>
		</div>

		<!-- DataGrid -->
		<div data-testid="users-table">
			<DataGrid
				data={users}
				{columns}
				{loading}
				rowKey="id"
				selectable
				selectedRows={selectedUsers}
				onSelectionChange={handleSelectionChange}
				{sortColumn}
				{sortDirection}
				onSort={handleSort}
				onRefresh={loadUsers}
				striped
				hoverable
				responsiveMode="card"
				cardTitle="name"
				cardSubtitle="email"
				cardBadge="status"
			/>
		</div>

		<!-- Pagination -->
		{#if total > 0}
			<div
				class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
			>
				<Pagination
					{page}
					{pageSize}
					{total}
					onPageChange={handlePageChange}
					onPageSizeChange={handlePageSizeChange}
				/>
			</div>
		{/if}
	</div>
</PageContainer>

<!-- Delete Single User Modal -->
<ConfirmModal
	bind:open={showDeleteModal}
	title="確認刪除"
	confirmText="刪除"
	variant="danger"
	loading={deleting}
	onConfirm={handleDelete}
>
	{#snippet children()}
		<p class="text-gray-600 dark:text-gray-400">
			確定要刪除使用者「<span class="font-medium text-gray-900 dark:text-gray-100"
				>{userToDelete?.name}</span
			>」嗎？此操作無法復原。
		</p>
	{/snippet}
</ConfirmModal>

<!-- Batch Delete Modal -->
<ConfirmModal
	bind:open={showBatchDeleteModal}
	title="確認批次刪除"
	confirmText="刪除全部"
	variant="danger"
	loading={batchDeleting}
	onConfirm={handleBatchDelete}
>
	{#snippet children()}
		<p class="text-gray-600 dark:text-gray-400">
			確定要刪除選中的
			<span class="font-medium text-gray-900 dark:text-gray-100">{selectedUsers.length}</span>
			位使用者嗎？此操作無法復原。
		</p>
	{/snippet}
</ConfirmModal>

{#snippet nameCell(user: User)}
	<div class="flex items-center gap-3">
		<div
			class="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center flex-shrink-0"
		>
			{#if user.avatar}
				<img src={user.avatar} alt={user.name} class="w-9 h-9 rounded-full object-cover" />
			{:else}
				<span class="text-sm font-medium text-white">
					{user.name.charAt(0).toUpperCase()}
				</span>
			{/if}
		</div>
		<div class="min-w-0">
			<p class="font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
			<p class="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
		</div>
	</div>
{/snippet}

{#snippet roleCell(user: User)}
	<span class="text-gray-700 dark:text-gray-300">{roleLabels[user.role]}</span>
{/snippet}

{#snippet statusCell(user: User)}
	<Badge variant={statusColors[user.status]} size="sm">
		{#snippet children()}{statusLabels[user.status]}{/snippet}
	</Badge>
{/snippet}

{#snippet createdAtCell(user: User)}
	<span class="text-gray-600 dark:text-gray-400 text-xs">{formatDate(user.createdAt)}</span>
{/snippet}

{#snippet lastLoginCell(user: User)}
	<span class="text-gray-600 dark:text-gray-400 text-xs">{formatDateTime(user.lastLoginAt)}</span>
{/snippet}

{#snippet actionsCell(user: User)}
	<div class="flex items-center justify-center gap-1">
		{#if hasPermission('users:update')}
			<Button variant="ghost" size="icon" href="/settings/users/{user.id}">
				{#snippet children()}
					<Pencil class="w-4 h-4" />
				{/snippet}
			</Button>
		{/if}
		{#if hasPermission('users:delete')}
			<Button variant="ghost" size="icon" onclick={() => confirmDelete(user)}>
				{#snippet children()}
					<Trash2 class="w-4 h-4 text-red-500" />
				{/snippet}
			</Button>
		{/if}
	</div>
{/snippet}
