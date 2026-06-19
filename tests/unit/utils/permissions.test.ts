import { describe, it, expect } from 'vitest';
import {
	checkPermissionInList,
	checkAnyPermissionInList,
	checkAllPermissionsInList,
	getRoutePermissions,
	getPermissionLabel,
	checkRole,
	type Permission
} from '$lib/permissions';

describe('Permissions', () => {
	describe('checkPermissionInList', () => {
		it('should return true when permission exists in list', () => {
			const permissions = ['users:read', 'users:create'];
			expect(checkPermissionInList(permissions, 'users:read')).toBe(true);
		});

		it('should return false when permission does not exist in list', () => {
			const permissions = ['users:read'];
			expect(checkPermissionInList(permissions, 'users:delete')).toBe(false);
		});

		it('should return false when permissions is undefined', () => {
			expect(checkPermissionInList(undefined, 'users:read')).toBe(false);
		});

		it('should return false for empty permissions list', () => {
			expect(checkPermissionInList([], 'users:read')).toBe(false);
		});

		it('should return true for wildcard permission', () => {
			const permissions = ['*'];
			expect(checkPermissionInList(permissions, 'users:read')).toBe(true);
			expect(checkPermissionInList(permissions, 'roles:delete')).toBe(true);
			expect(checkPermissionInList(permissions, 'settings:update')).toBe(true);
		});

		it('should handle wildcard mixed with other permissions', () => {
			const permissions = ['users:read', '*'];
			expect(checkPermissionInList(permissions, 'logs:read')).toBe(true);
		});
	});

	describe('checkAnyPermissionInList', () => {
		it('should return true when at least one permission matches', () => {
			const permissions = ['users:read', 'users:create'];
			expect(checkAnyPermissionInList(permissions, ['users:read', 'users:delete'])).toBe(true);
		});

		it('should return false when no permissions match', () => {
			const permissions = ['users:read'];
			expect(checkAnyPermissionInList(permissions, ['users:delete', 'roles:read'])).toBe(false);
		});

		it('should return false when permissions is undefined', () => {
			expect(checkAnyPermissionInList(undefined, ['users:read'])).toBe(false);
		});

		it('should return true with wildcard permission', () => {
			const permissions = ['*'];
			expect(checkAnyPermissionInList(permissions, ['users:delete', 'roles:read'])).toBe(true);
		});

		it('should handle empty required permissions list', () => {
			const permissions = ['users:read'];
			expect(checkAnyPermissionInList(permissions, [])).toBe(false);
		});
	});

	describe('checkAllPermissionsInList', () => {
		it('should return true when all permissions match', () => {
			const permissions = ['users:read', 'users:create', 'users:update'];
			expect(checkAllPermissionsInList(permissions, ['users:read', 'users:create'])).toBe(true);
		});

		it('should return false when not all permissions match', () => {
			const permissions = ['users:read'];
			expect(checkAllPermissionsInList(permissions, ['users:read', 'users:delete'])).toBe(false);
		});

		it('should return false when permissions is undefined', () => {
			expect(checkAllPermissionsInList(undefined, ['users:read'])).toBe(false);
		});

		it('should return true with wildcard for any required permissions', () => {
			const permissions = ['*'];
			expect(
				checkAllPermissionsInList(permissions, ['users:read', 'roles:delete', 'settings:update'])
			).toBe(true);
		});

		it('should return true for empty required permissions list', () => {
			const permissions = ['users:read'];
			expect(checkAllPermissionsInList(permissions, [])).toBe(true);
		});
	});

	describe('getRoutePermissions', () => {
		it('should return permissions for exact route match', () => {
			expect(getRoutePermissions('/settings/users')).toEqual(['users:read']);
		});

		it('should return permissions for /settings/users/new', () => {
			expect(getRoutePermissions('/settings/users/new')).toEqual(['users:create']);
		});

		it('should return permissions for /settings/roles', () => {
			expect(getRoutePermissions('/settings/roles')).toEqual(['roles:read']);
		});

		it('should return permissions for /settings/logs', () => {
			expect(getRoutePermissions('/settings/logs')).toEqual(['logs:read']);
		});

		it('should match dynamic user route with numeric ID', () => {
			expect(getRoutePermissions('/settings/users/123')).toEqual(['users:update']);
		});

		it('should match dynamic user route with UUID', () => {
			expect(getRoutePermissions('/settings/users/abc-def-123')).toEqual(['users:update']);
		});

		it('should match dynamic roles route with ID', () => {
			expect(getRoutePermissions('/settings/roles/456')).toEqual(['roles:read']);
		});

		it('should return empty array for unknown route', () => {
			expect(getRoutePermissions('/dashboard')).toEqual([]);
		});

		it('should return empty array for root route', () => {
			expect(getRoutePermissions('/')).toEqual([]);
		});

		it('should not match /settings/users/new as dynamic route', () => {
			// /settings/users/new should match the exact "new" route, not [id]
			expect(getRoutePermissions('/settings/users/new')).toEqual(['users:create']);
		});

		it('should not match /settings/roles/new as dynamic route', () => {
			expect(getRoutePermissions('/settings/roles/new')).toEqual(['roles:create']);
		});
	});

	describe('getPermissionLabel', () => {
		it('should return label for known permission', () => {
			expect(getPermissionLabel('users:read')).toBe('查看使用者');
		});

		it('should return label for logs:read', () => {
			expect(getPermissionLabel('logs:read')).toBe('查看日誌');
		});

		it('should return the permission string itself for unknown permission', () => {
			expect(getPermissionLabel('unknown:permission')).toBe('unknown:permission');
		});
	});

	describe('checkRole', () => {
		it('should return true when role matches single allowed role', () => {
			expect(checkRole('admin', 'admin')).toBe(true);
		});

		it('should return false when role does not match', () => {
			expect(checkRole('user', 'admin')).toBe(false);
		});

		it('should return true when role is in allowed roles array', () => {
			expect(checkRole('admin', ['admin', 'manager'])).toBe(true);
		});

		it('should return false when role is not in allowed roles array', () => {
			expect(checkRole('user', ['admin', 'manager'])).toBe(false);
		});

		it('should return false when current role is undefined', () => {
			expect(checkRole(undefined, 'admin')).toBe(false);
		});
	});
});
