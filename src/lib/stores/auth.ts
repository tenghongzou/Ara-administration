import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, UserRole } from '$lib/types';
import {
	type Permission,
	checkPermissionInList,
	checkAnyPermissionInList,
	checkAllPermissionsInList,
	checkRole
} from '$lib/permissions';
import { mockRoles } from '$lib/services/mock-data';
import { sessionTimeout } from '$lib/services/auth/session-timeout';

interface AuthState {
	user: User | null;
	token: string | null;
	userPermissions: string[]; // 快取使用者權限
	isLoading: boolean;
	isInitialized: boolean;
	error: string | null;
}

const STORAGE_KEY = 'auth_state';

/**
 * 根據角色 key 取得權限列表
 */
function getPermissionsForRole(roleKey: string): string[] {
	const role = mockRoles.find((r) => r.key === roleKey);
	if (!role) return [];
	return [...role.permissions];
}

function getInitialState(): AuthState {
	const defaultState: AuthState = {
		user: null,
		token: null,
		userPermissions: [],
		isLoading: false,
		isInitialized: false,
		error: null
	};

	if (browser) {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				const user = parsed.user || null;
				return {
					...defaultState,
					user,
					token: parsed.token || null,
					userPermissions: user ? getPermissionsForRole(user.role) : [],
					isInitialized: true
				};
			}
		} catch {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	return defaultState;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(getInitialState());

	function persistState(state: AuthState) {
		if (browser) {
			if (state.token && state.user) {
				localStorage.setItem(STORAGE_KEY, JSON.stringify({
					user: state.user,
					token: state.token
				}));
			} else {
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	}

	return {
		subscribe,

		initialize: () => {
			update((state) => ({ ...state, isInitialized: true }));
		},

		setUser: (user: User, token: string) => {
			update((state) => {
				const userPermissions = getPermissionsForRole(user.role);
				const newState = {
					...state,
					user,
					token,
					userPermissions,
					error: null,
					isInitialized: true
				};
				persistState(newState);
				// 記錄登入時間
				sessionTimeout.recordLogin();
				return newState;
			});
		},

		/**
		 * 更新當前使用者資料（不影響登入狀態）
		 */
		updateUser: (userData: Partial<User>) => {
			update((state) => {
				if (!state.user) return state;
				const updatedUser = { ...state.user, ...userData };
				const userPermissions = getPermissionsForRole(updatedUser.role);
				const newState = {
					...state,
					user: updatedUser,
					userPermissions
				};
				persistState(newState);
				return newState;
			});
		},

		/**
		 * 重新載入當前使用者的權限（當角色權限被修改時呼叫）
		 */
		refreshPermissions: () => {
			update((state) => {
				if (!state.user) return state;
				const userPermissions = getPermissionsForRole(state.user.role);
				return { ...state, userPermissions };
			});
		},

		logout: () => {
			const newState: AuthState = {
				user: null,
				token: null,
				userPermissions: [],
				isLoading: false,
				isInitialized: true,
				error: null
			};
			persistState(newState);
			// 清除 session 時間戳記
			sessionTimeout.clearTimestamps();
			set(newState);
		},

		setLoading: (isLoading: boolean) => {
			update((state) => ({ ...state, isLoading }));
		},

		setError: (error: string) => {
			update((state) => ({ ...state, error, isLoading: false }));
		},

		getState: () => get({ subscribe })
	};
}

export const auth = createAuthStore();

// 衍生狀態
export const isAuthenticated = derived(auth, ($auth) => !!$auth.token);
export const currentUser = derived(auth, ($auth) => $auth.user);
export const isAuthInitialized = derived(auth, ($auth) => $auth.isInitialized);

// 權限相關衍生狀態
export const userRole = derived(auth, ($auth) => $auth.user?.role);
export const userPermissions = derived(auth, ($auth) => $auth.userPermissions);

// 權限檢查函數 (使用當前用戶)
export function hasPermission(permission: Permission): boolean {
	const state = auth.getState();
	return checkPermissionInList(state.userPermissions, permission);
}

export function hasAnyPermission(permissions: Permission[]): boolean {
	const state = auth.getState();
	return checkAnyPermissionInList(state.userPermissions, permissions);
}

export function hasAllPermissions(permissions: Permission[]): boolean {
	const state = auth.getState();
	return checkAllPermissionsInList(state.userPermissions, permissions);
}

export function hasRole(allowedRoles: UserRole | UserRole[]): boolean {
	const state = auth.getState();
	return checkRole(state.user?.role, allowedRoles);
}

// 重新導出權限類型與函數
export type { Permission };
export { checkPermissionInList, checkAnyPermissionInList, checkAllPermissionsInList, checkRole };
