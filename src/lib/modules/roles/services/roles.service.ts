/**
 * Roles 模組服務層
 * 提供角色管理的業務邏輯
 */

import type { Role } from '$lib/types';
import type { RoleFormData, RoleFormErrors, BadgeVariant } from '../types';
import { colorToBadgeVariant } from '../types';

class RolesService {
	// ==================== 格式化方法 ====================

	/**
	 * 取得權限數量顯示文字
	 */
	getPermissionCountText(role: Role): string {
		if (role.permissions.includes('*')) return '全部權限';
		return `${role.permissions.length} 項`;
	}

	/**
	 * 根據顏色取得 Badge 變體
	 */
	getBadgeVariant(color: string): BadgeVariant {
		return colorToBadgeVariant[color] || 'default';
	}

	/**
	 * 檢查是否為管理員角色
	 */
	isAdminRole(role: Role): boolean {
		return role.isSystem && role.key === 'admin';
	}

	/**
	 * 檢查角色是否可編輯
	 */
	canEditRole(role: Role): boolean {
		return !this.isAdminRole(role);
	}

	/**
	 * 檢查角色是否可刪除
	 */
	canDeleteRole(role: Role): boolean {
		return !role.isSystem;
	}

	// ==================== 驗證方法 ====================

	/**
	 * 驗證角色識別碼
	 */
	validateKey(key: string): string {
		if (!key) return '請輸入角色識別碼';
		if (!/^[a-z][a-z0-9_-]*$/.test(key)) {
			return '識別碼只能包含小寫英文、數字、底線和連字號，且必須以英文開頭';
		}
		if (key.length < 2) return '識別碼至少需要 2 個字元';
		if (key.length > 32) return '識別碼最多 32 個字元';
		return '';
	}

	/**
	 * 驗證角色表單
	 */
	validateForm(form: RoleFormData): RoleFormErrors {
		const errors: RoleFormErrors = {};

		const keyError = this.validateKey(form.key);
		if (keyError) {
			errors.key = keyError;
		}

		if (!form.label.trim()) {
			errors.label = '請輸入角色名稱';
		}

		return errors;
	}

	/**
	 * 檢查表單是否有效
	 */
	isFormValid(errors: RoleFormErrors): boolean {
		return Object.keys(errors).length === 0;
	}

	// ==================== 權限處理方法 ====================

	/**
	 * 切換單一權限
	 */
	togglePermission(permissions: Set<string>, permission: string): Set<string> {
		const newSet = new Set(permissions);
		if (newSet.has(permission)) {
			newSet.delete(permission);
		} else {
			newSet.add(permission);
		}
		return newSet;
	}

	/**
	 * 切換群組內所有權限
	 */
	toggleGroupPermissions(
		permissions: Set<string>,
		groupPermissions: string[],
		isFullySelected: boolean
	): Set<string> {
		const newSet = new Set(permissions);
		if (isFullySelected) {
			groupPermissions.forEach((p) => newSet.delete(p));
		} else {
			groupPermissions.forEach((p) => newSet.add(p));
		}
		return newSet;
	}

	/**
	 * 檢查群組是否全部選中
	 */
	isGroupFullySelected(permissions: Set<string>, groupPermissions: string[]): boolean {
		return groupPermissions.every((p) => permissions.has(p));
	}

	// ==================== 初始化方法 ====================

	/**
	 * 建立空白表單數據
	 */
	createEmptyFormData(): RoleFormData {
		return {
			key: '',
			label: '',
			description: '',
			color: 'gray',
			permissions: []
		};
	}

	/**
	 * 從角色數據建立表單數據
	 */
	roleToFormData(role: Role): RoleFormData {
		return {
			key: role.key,
			label: role.label,
			description: role.description,
			color: role.color,
			permissions: [...role.permissions]
		};
	}

	/**
	 * 將表單數據轉換為 API 請求數據
	 */
	formDataToApiData(form: RoleFormData): Partial<Role> {
		return {
			key: form.key,
			label: form.label.trim(),
			description: form.description.trim(),
			color: form.color,
			permissions: form.permissions
		};
	}

	// ==================== 篩選方法 ====================

	/**
	 * 過濾角色列表
	 */
	filterRoles(roles: Role[], filters: { search?: string; isSystem?: boolean }): Role[] {
		let result = [...roles];

		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			result = result.filter(
				(role) =>
					role.label.toLowerCase().includes(searchLower) ||
					role.key.toLowerCase().includes(searchLower) ||
					role.description.toLowerCase().includes(searchLower)
			);
		}

		if (filters.isSystem !== undefined) {
			result = result.filter((role) => role.isSystem === filters.isSystem);
		}

		return result;
	}
}

export const rolesService = new RolesService();
