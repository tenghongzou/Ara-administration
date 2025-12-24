import type { Permission } from '$lib/permissions';

/**
 * 導航項目類型
 */
export interface NavItem {
	id: string;
	label: string;
	href: string;
	icon?: string;
	badge?: string | number;
	permission?: Permission;
	children?: NavItem[];
	order?: number;
}

/**
 * 模組配置類型
 */
export interface ModuleConfig {
	id: string;
	name: string;
	description?: string;
	basePath: string;
	navigation?: NavItem[];
	permissions?: Permission[];
	enabled?: boolean;
}

/**
 * 模組註冊中心介面
 */
export interface ModuleRegistry {
	modules: Map<string, ModuleConfig>;
	register(module: ModuleConfig): void;
	unregister(moduleId: string): void;
	getNavigation(): NavItem[];
	getModule(id: string): ModuleConfig | undefined;
	isEnabled(id: string): boolean;
}
