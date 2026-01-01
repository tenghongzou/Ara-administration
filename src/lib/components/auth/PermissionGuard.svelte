<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { UserRole } from '$lib/types';
	import type { Permission } from '$lib/permissions';
	import {
		userRole,
		userPermissions,
		checkPermissionInList,
		checkAnyPermissionInList,
		checkAllPermissionsInList,
		checkRole
	} from '$lib/stores/auth';

	interface Props {
		/** 單一權限檢查 */
		permission?: Permission;
		/** 多權限檢查 */
		permissions?: Permission[];
		/** 角色檢查 */
		role?: UserRole | UserRole[];
		/** 多權限檢查模式: 'any' = 任一符合, 'all' = 全部符合 */
		mode?: 'any' | 'all';
		/** 無權限時顯示的內容 */
		fallback?: Snippet;
		/** 有權限時顯示的內容 */
		children: Snippet;
	}

	let {
		permission,
		permissions,
		role,
		mode = 'any',
		fallback,
		children
	}: Props = $props();

	// 響應式權限和角色檢查
	let allowed = $derived.by(() => {
		// 使用 $ 前綴訂閱 stores 以確保響應式
		const currentRole = $userRole;
		const currentPermissions = $userPermissions;

		// 角色檢查
		if (role) {
			return checkRole(currentRole, role);
		}

		// 單一權限檢查
		if (permission) {
			return checkPermissionInList(currentPermissions, permission);
		}

		// 多權限檢查
		if (permissions && permissions.length > 0) {
			if (mode === 'all') {
				return checkAllPermissionsInList(currentPermissions, permissions);
			}
			return checkAnyPermissionInList(currentPermissions, permissions);
		}

		// 未指定任何權限條件，預設允許
		return true;
	});
</script>

{#if allowed}
	{@render children()}
{:else if fallback}
	{@render fallback()}
{/if}
