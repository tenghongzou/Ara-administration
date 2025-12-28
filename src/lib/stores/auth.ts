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
import { sessionTimeout } from '$lib/services/auth/session-timeout';
import { authApi } from '$lib/services/auth/api';

interface AuthState {
	user: User | null;
	token: string | null;
	userPermissions: string[]; // 快取使用者權限
	isLoading: boolean;
	isInitialized: boolean;
	error: string | null;
}

const STORAGE_KEY = 'auth_state';

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
				const permissions = parsed.permissions || [];
				return {
					...defaultState,
					user,
					token: parsed.token || null,
					userPermissions: permissions,
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
					token: state.token,
					permissions: state.userPermissions
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

		setUser: (user: User, token: string, permissions?: string[]) => {
			update((state) => {
				const userPermissions = permissions || state.userPermissions || [];
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
		 * 設置使用者權限
		 */
		setPermissions: (permissions: string[]) => {
			update((state) => {
				const newState = {
					...state,
					userPermissions: permissions
				};
				persistState(newState);
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
				const newState = {
					...state,
					user: updatedUser
				};
				persistState(newState);
				return newState;
			});
		},

		/**
		 * 從後端重新載入當前使用者的權限
		 */
		refreshPermissions: async () => {
			try {
				const permissions = await authApi.getPermissions();
				update((state) => {
					const newState = { ...state, userPermissions: permissions };
					persistState(newState);
					return newState;
				});
			} catch (error) {
				console.error('Failed to refresh permissions:', error);
			}
		},

		/**
		 * 驗證並刷新當前用戶狀態
		 */
		validateSession: async () => {
			const state = get({ subscribe });
			if (!state.token) return false;

			try {
				const { user } = await authApi.getCurrentUser();
				const permissions = await authApi.getPermissions();
				update((s) => {
					const newState = {
						...s,
						user,
						userPermissions: permissions,
						isInitialized: true
					};
					persistState(newState);
					return newState;
				});
				return true;
			} catch {
				// Token is invalid, clear auth state
				const newState: AuthState = {
					user: null,
					token: null,
					userPermissions: [],
					isLoading: false,
					isInitialized: true,
					error: null
				};
				persistState(newState);
				set(newState);
				return false;
			}
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
