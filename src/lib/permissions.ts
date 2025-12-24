import type { UserRole } from '$lib/types';

/**
 * 權限定義
 * 格式: resource:action
 * CRUD 層級: D > U > C > R (有高級權限自動包含低級權限)
 */
export type Permission =
	// 使用者管理
	| 'users:read'
	| 'users:create'
	| 'users:update'
	| 'users:delete'
	// 角色管理
	| 'roles:read'
	| 'roles:create'
	| 'roles:update'
	| 'roles:delete'
	// 訂閱管理
	| 'subscriptions:read'
	| 'subscriptions:create'
	| 'subscriptions:update'
	| 'subscriptions:delete'
	// 設定
	| 'settings:read'
	| 'settings:update'
	// 日誌
	| 'logs:read'
	// 匯出
	| 'export:data';

/**
 * 權限分組與標籤
 */
export interface PermissionGroup {
	key: string;
	label: string;
	permissions: { key: Permission; label: string }[];
}

export const permissionGroups: PermissionGroup[] = [
	{
		key: 'users',
		label: '使用者管理',
		permissions: [
			{ key: 'users:read', label: '查看使用者' },
			{ key: 'users:create', label: '新增使用者' },
			{ key: 'users:update', label: '編輯使用者' },
			{ key: 'users:delete', label: '刪除使用者' }
		]
	},
	{
		key: 'roles',
		label: '角色管理',
		permissions: [
			{ key: 'roles:read', label: '查看角色' },
			{ key: 'roles:create', label: '新增角色' },
			{ key: 'roles:update', label: '編輯角色' },
			{ key: 'roles:delete', label: '刪除角色' }
		]
	},
	{
		key: 'subscriptions',
		label: '訂閱管理',
		permissions: [
			{ key: 'subscriptions:read', label: '查看訂閱' },
			{ key: 'subscriptions:create', label: '新增訂閱' },
			{ key: 'subscriptions:update', label: '編輯訂閱' },
			{ key: 'subscriptions:delete', label: '刪除訂閱' }
		]
	},
	{
		key: 'settings',
		label: '系統設定',
		permissions: [
			{ key: 'settings:read', label: '查看設定' },
			{ key: 'settings:update', label: '修改設定' }
		]
	},
	{
		key: 'logs',
		label: '審計日誌',
		permissions: [{ key: 'logs:read', label: '查看日誌' }]
	},
	{
		key: 'export',
		label: '資料匯出',
		permissions: [{ key: 'export:data', label: '匯出資料' }]
	}
];

/**
 * 所有權限列表
 */
export const allPermissions: Permission[] = permissionGroups.flatMap((g) =>
	g.permissions.map((p) => p.key)
);

/**
 * 取得權限標籤
 */
export function getPermissionLabel(permission: Permission | string): string {
	for (const group of permissionGroups) {
		const found = group.permissions.find((p) => p.key === permission);
		if (found) return found.label;
	}
	return permission;
}

/**
 * 預設角色顏色選項
 */
export const roleColorOptions = [
	{ value: 'red', label: '紅色', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
	{ value: 'orange', label: '橙色', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
	{ value: 'amber', label: '琥珀色', class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
	{ value: 'yellow', label: '黃色', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
	{ value: 'lime', label: '青檸色', class: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400' },
	{ value: 'green', label: '綠色', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
	{ value: 'emerald', label: '翡翠色', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
	{ value: 'teal', label: '藍綠色', class: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' },
	{ value: 'cyan', label: '青色', class: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' },
	{ value: 'sky', label: '天空藍', class: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400' },
	{ value: 'blue', label: '藍色', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
	{ value: 'indigo', label: '靛藍色', class: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
	{ value: 'violet', label: '紫羅蘭色', class: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400' },
	{ value: 'purple', label: '紫色', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
	{ value: 'fuchsia', label: '桃紅色', class: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
	{ value: 'pink', label: '粉紅色', class: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400' },
	{ value: 'rose', label: '玫瑰色', class: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' },
	{ value: 'gray', label: '灰色', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
];

/**
 * 根據顏色值取得 CSS 類別
 */
export function getRoleColorClass(colorValue: string): string {
	const found = roleColorOptions.find((c) => c.value === colorValue);
	return found?.class || roleColorOptions[roleColorOptions.length - 1].class;
}

/**
 * 路由權限映射
 * 定義每個路由需要的權限
 */
export const routePermissions: Record<string, Permission[]> = {
	'/settings/users': ['users:read'],
	'/settings/users/new': ['users:create'],
	'/settings/users/[id]': ['users:update'],
	'/settings/roles': ['roles:read'],
	'/settings/roles/new': ['roles:create'],
	'/settings/roles/[id]': ['roles:read'],
	'/settings/logs': ['logs:read']
};

/**
 * 取得路由所需權限
 * 支援動態路由 (e.g., /settings/users/123)
 */
export function getRoutePermissions(pathname: string): Permission[] {
	// 直接匹配
	if (routePermissions[pathname]) {
		return routePermissions[pathname];
	}

	// 動態路由匹配
	const segments = pathname.split('/').filter(Boolean);
	if (segments.length >= 3 && segments[0] === 'settings') {
		// /settings/users/123 -> /settings/users/[id]
		if (segments[1] === 'users' && segments[2] !== 'new') {
			const dynamicPath = '/settings/users/[id]';
			if (routePermissions[dynamicPath]) {
				return routePermissions[dynamicPath];
			}
		}
		// /settings/roles/xxx -> /settings/roles/[id]
		if (segments[1] === 'roles' && segments[2] !== 'new') {
			const dynamicPath = '/settings/roles/[id]';
			if (routePermissions[dynamicPath]) {
				return routePermissions[dynamicPath];
			}
		}
	}

	return [];
}

/**
 * 檢查權限列表是否包含指定權限
 */
export function checkPermissionInList(
	permissions: readonly string[] | undefined,
	permission: Permission
): boolean {
	if (!permissions) return false;
	// 如果有 '*' 權限，則擁有所有權限
	if (permissions.includes('*')) return true;
	return permissions.includes(permission);
}

/**
 * 檢查權限列表是否包含任一指定權限
 */
export function checkAnyPermissionInList(
	permissions: readonly string[] | undefined,
	requiredPermissions: Permission[]
): boolean {
	if (!permissions) return false;
	return requiredPermissions.some((p) => checkPermissionInList(permissions, p));
}

/**
 * 檢查權限列表是否包含所有指定權限
 */
export function checkAllPermissionsInList(
	permissions: readonly string[] | undefined,
	requiredPermissions: Permission[]
): boolean {
	if (!permissions) return false;
	return requiredPermissions.every((p) => checkPermissionInList(permissions, p));
}

/**
 * 檢查是否為指定角色
 */
export function checkRole(
	currentRole: UserRole | undefined,
	allowedRoles: UserRole | UserRole[]
): boolean {
	if (!currentRole) return false;
	const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
	return roles.includes(currentRole);
}
