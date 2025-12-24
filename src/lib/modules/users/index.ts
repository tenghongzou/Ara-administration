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
