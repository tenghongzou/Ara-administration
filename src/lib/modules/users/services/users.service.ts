/**
 * Users 模組服務層
 * 提供使用者管理的業務邏輯
 */

import type { User } from '$lib/types';
import type { UserFilters, UserFormData, UserFormErrors } from '../types';
import { roleLabels, statusLabels, statusColors } from '../types';

class UsersService {
	// ==================== 格式化方法 ====================

	/**
	 * 格式化日期
	 */
	formatDate(dateString?: string): string {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}

	/**
	 * 格式化日期時間
	 */
	formatDateTime(dateString?: string): string {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	/**
	 * 取得角色標籤
	 */
	getRoleLabel(role: string): string {
		return roleLabels[role] || role;
	}

	/**
	 * 取得狀態標籤
	 */
	getStatusLabel(status: string): string {
		return statusLabels[status] || status;
	}

	/**
	 * 取得狀態顏色
	 */
	getStatusColor(status: string): 'success' | 'error' | 'warning' | 'info' {
		return statusColors[status] || 'info';
	}

	/**
	 * 取得使用者頭像字母
	 */
	getAvatarLetter(name: string): string {
		return name.charAt(0).toUpperCase();
	}

	// ==================== 驗證方法 ====================

	/**
	 * 驗證使用者表單
	 */
	validateForm(form: UserFormData): UserFormErrors {
		const errors: UserFormErrors = {};

		if (!form.name.trim()) {
			errors.name = '請輸入姓名';
		}

		if (!form.email.trim()) {
			errors.email = '請輸入電子郵件';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
			errors.email = '請輸入有效的電子郵件格式';
		}

		if (!form.username.trim()) {
			errors.username = '請輸入使用者名稱';
		} else if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) {
			errors.username = '使用者名稱只能包含英文、數字、底線和連字號';
		}

		if (!form.role) {
			errors.role = '請選擇角色';
		}

		return errors;
	}

	/**
	 * 檢查表單是否有效
	 */
	isFormValid(errors: UserFormErrors): boolean {
		return Object.keys(errors).length === 0;
	}

	// ==================== 篩選方法 ====================

	/**
	 * 過濾使用者列表
	 */
	filterUsers(users: User[], filters: UserFilters): User[] {
		let result = [...users];

		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			result = result.filter(
				(user) =>
					user.name.toLowerCase().includes(searchLower) ||
					user.email.toLowerCase().includes(searchLower) ||
					user.username?.toLowerCase().includes(searchLower)
			);
		}

		if (filters.role) {
			result = result.filter((user) => user.role === filters.role);
		}

		if (filters.status) {
			result = result.filter((user) => user.status === filters.status);
		}

		return result;
	}

	/**
	 * 檢查篩選器是否有任何值
	 */
	hasActiveFilters(filters: UserFilters): boolean {
		return !!(filters.search || filters.role || filters.status);
	}

	/**
	 * 清空篩選器
	 */
	clearFilters(): UserFilters {
		return {
			search: '',
			role: '',
			status: ''
		};
	}

	// ==================== 初始化方法 ====================

	/**
	 * 建立空白表單數據
	 */
	createEmptyFormData(): UserFormData {
		return {
			name: '',
			email: '',
			username: '',
			role: 'viewer',
			status: 'pending'
		};
	}

	/**
	 * 從使用者數據建立表單數據
	 */
	userToFormData(user: User): UserFormData {
		return {
			name: user.name,
			email: user.email,
			username: user.username || '',
			role: user.role,
			status: user.status,
			avatar: user.avatar
		};
	}

	/**
	 * 將表單數據轉換為 API 請求數據
	 */
	formDataToApiData(form: UserFormData): Partial<User> {
		return {
			name: form.name.trim(),
			email: form.email.trim(),
			username: form.username.trim(),
			role: form.role,
			status: form.status as User['status'],
			avatar: form.avatar
		};
	}

	// ==================== 匯出相關 ====================

	/**
	 * 準備匯出數據
	 */
	prepareExportData(users: User[]) {
		return users.map((u) => ({
			name: u.name,
			email: u.email,
			role: this.getRoleLabel(u.role),
			status: this.getStatusLabel(u.status),
			createdAt: u.createdAt,
			lastLoginAt: u.lastLoginAt || ''
		}));
	}

	/**
	 * 取得匯出欄位配置
	 */
	getExportColumns() {
		return [
			{ key: 'name' as const, label: '姓名' },
			{ key: 'email' as const, label: '電子郵件' },
			{ key: 'role' as const, label: '角色' },
			{ key: 'status' as const, label: '狀態' },
			{ key: 'createdAt' as const, label: '建立時間' },
			{ key: 'lastLoginAt' as const, label: '最後登入' }
		];
	}
}

export const usersService = new UsersService();
