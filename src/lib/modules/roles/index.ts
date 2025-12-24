/**
 * Roles 模組
 * 角色權限管理功能模組
 */

// Types
export type {
	RoleFilters,
	RoleFormData,
	RoleFormErrors,
	SelectOption,
	ColorOption,
	BadgeVariant
} from './types';

export { roleTypeOptions, colorToBadgeVariant } from './types';

// Services
export { rolesService } from './services/roles.service';

// Components
export { default as RoleCard } from './components/RoleCard.svelte';
export { default as PermissionSelector } from './components/PermissionSelector.svelte';
export { default as RoleForm } from './components/RoleForm.svelte';

// Module config for registration
import type { ModuleConfig } from '../types';

export const rolesModuleConfig: ModuleConfig = {
	id: 'roles',
	name: '角色管理',
	description: '管理系統角色與權限設定',
	basePath: '/settings/roles',
	// 導航由 core 模組處理，見 navigation/config.ts
	navigation: [],
	enabled: true
};
