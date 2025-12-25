/**
 * Users 模組
 * 使用者管理功能模組
 */

// Types
export type {
	UserFilters,
	UserSortOptions,
	UserFormData,
	UserFormErrors,
	SelectOption
} from './types';

export {
	roleFilterOptions,
	statusFilterOptions,
	roleFormOptions,
	statusFormOptions,
	roleLabels,
	statusLabels,
	statusColors
} from './types';

// Services
export { usersService } from './services/users.service';

// Components
export { default as UserFiltersPanel } from './components/UserFiltersPanel.svelte';
export { default as UserCard } from './components/UserCard.svelte';
export { default as UserForm } from './components/UserForm.svelte';
export { default as UsersActions } from './components/UsersActions.svelte';
export { default as UsersDataGrid } from './components/UsersDataGrid.svelte';
export { default as UsersContent } from './components/UsersContent.svelte';
export { default as UsersDeleteModals } from './components/UsersDeleteModals.svelte';
export { default as UserDetailContent } from './components/UserDetailContent.svelte';

// Module config for registration
import type { ModuleConfig } from '../types';

export const usersModuleConfig: ModuleConfig = {
	id: 'users',
	name: '使用者管理',
	description: '管理系統使用者帳號與權限',
	basePath: '/settings/users',
	// 導航由 core 模組處理，見 navigation/config.ts
	navigation: [],
	enabled: true
};
