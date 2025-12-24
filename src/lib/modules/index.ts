import type { ModuleConfig, ModuleRegistry, NavItem } from './types';
import { navigationConfig, sortNavigation } from './navigation';
import { subscriptionsModuleConfig } from './subscriptions';
import { usersModuleConfig } from './users';
import { rolesModuleConfig } from './roles';
import { settingsModuleConfig } from './settings';

/**
 * 模組註冊中心實作
 */
class ModuleRegistryImpl implements ModuleRegistry {
	modules = new Map<string, ModuleConfig>();

	/**
	 * 註冊模組
	 */
	register(module: ModuleConfig): void {
		if (this.modules.has(module.id)) {
			console.warn(`[ModuleRegistry] Module "${module.id}" is already registered. Overwriting.`);
		}
		this.modules.set(module.id, module);
	}

	/**
	 * 取消註冊模組
	 */
	unregister(moduleId: string): void {
		this.modules.delete(moduleId);
	}

	/**
	 * 取得所有啟用模組的導航項目
	 */
	getNavigation(): NavItem[] {
		const navItems: NavItem[] = [];

		this.modules.forEach((module) => {
			if (module.enabled !== false && module.navigation) {
				navItems.push(...module.navigation);
			}
		});

		return sortNavigation(navItems);
	}

	/**
	 * 取得特定模組配置
	 */
	getModule(id: string): ModuleConfig | undefined {
		return this.modules.get(id);
	}

	/**
	 * 檢查模組是否啟用
	 */
	isEnabled(id: string): boolean {
		const module = this.modules.get(id);
		return module?.enabled !== false;
	}
}

// 建立單例
export const moduleRegistry = new ModuleRegistryImpl();

// 註冊預設模組（使用從 layout 提取出來的導航配置）
moduleRegistry.register({
	id: 'core',
	name: '核心功能',
	description: '系統核心功能模組',
	basePath: '/',
	navigation: navigationConfig,
	enabled: true
});

// 註冊訂閱模組
moduleRegistry.register(subscriptionsModuleConfig);

// 註冊使用者模組
moduleRegistry.register(usersModuleConfig);

// 註冊角色模組
moduleRegistry.register(rolesModuleConfig);

// 註冊設定模組
moduleRegistry.register(settingsModuleConfig);

// 匯出類型和工具
export type { ModuleConfig, ModuleRegistry, NavItem } from './types';
export { navigationConfig, navIcons, filterNavigationByPermission, sortNavigation } from './navigation';
