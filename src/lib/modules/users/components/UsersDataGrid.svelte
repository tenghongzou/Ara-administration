<script lang="ts">
	import type { User } from '$lib/types';
	import type { DataGridColumn } from '$lib/types';
	import { DataGrid } from '$lib/components/data-display';
	import { Button, Badge } from '$lib/components/ui';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import { userPermissions, checkPermissionInList } from '$lib/stores/auth';
	import { roleLabels, statusLabels, statusColors } from '../types';

	interface Props {
		users: User[];
		loading?: boolean;
		selectedRows?: User[];
		sortColumn?: string;
		sortDirection?: 'asc' | 'desc';
		onSelectionChange?: (rows: User[]) => void;
		onSort?: (column: string, direction: 'asc' | 'desc') => void;
		onRefresh?: () => void;
		onDelete?: (user: User) => void;
	}

	let {
		users,
		loading = false,
		selectedRows = [],
		sortColumn = '',
		sortDirection = 'asc',
		onSelectionChange,
		onSort,
		onRefresh,
		onDelete
	}: Props = $props();

	// 響應式權限
	let permissions = $state<readonly string[]>([]);
	$effect(() => {
		const unsubscribe = userPermissions.subscribe((p) => {
			permissions = p;
		});
		return unsubscribe;
	});

	const canUpdate = $derived(checkPermissionInList(permissions, 'users:update'));
	const canDelete = $derived(checkPermissionInList(permissions, 'users:delete'));

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
</script>

<div data-testid="users-table">
	<DataGrid
		data={users}
		{columns}
		{loading}
		rowKey="id"
		selectable
		{selectedRows}
		{onSelectionChange}
		{sortColumn}
		{sortDirection}
		{onSort}
		{onRefresh}
		striped
		hoverable
		responsiveMode="card"
		cardTitle="name"
		cardSubtitle="email"
		cardBadge="status"
	/>
</div>

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
		{#if canUpdate}
			<Button variant="ghost" size="icon" href="/settings/users/{user.id}">
				{#snippet children()}
					<Pencil class="w-4 h-4" />
				{/snippet}
			</Button>
		{/if}
		{#if canDelete}
			<Button variant="ghost" size="icon" onclick={() => onDelete?.(user)}>
				{#snippet children()}
					<Trash2 class="w-4 h-4 text-red-500" />
				{/snippet}
			</Button>
		{/if}
	</div>
{/snippet}
