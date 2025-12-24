import type { NavItem } from '../types';

/**
 * 導航圖標 SVG
 */
export const navIcons = {
	dashboard: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
	subscriptions: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>`,
	notifications: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>`,
	settings: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
	logs: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`
};

/**
 * 主導航配置
 * 從原本硬編碼在 (app)/+layout.svelte 中提取出來
 */
export const navigationConfig: NavItem[] = [
	{
		id: 'dashboard',
		label: '儀表板',
		href: '/dashboard',
		icon: navIcons.dashboard,
		order: 0
	},
	{
		id: 'subscriptions',
		label: '訂閱管理',
		href: '/subscriptions',
		icon: navIcons.subscriptions,
		order: 10,
		children: [
			{ id: 'subscriptions-list', label: '訂閱列表', href: '/subscriptions', order: 0 },
			{ id: 'subscriptions-analytics', label: '分析報表', href: '/subscriptions/analytics', order: 1 },
			{ id: 'subscriptions-calendar', label: '日曆視圖', href: '/subscriptions/calendar', order: 2 },
			{ id: 'subscriptions-import', label: '匯入資料', href: '/subscriptions/import', order: 3 }
		]
	},
	{
		id: 'notifications',
		label: '通知中心',
		href: '/notifications',
		icon: navIcons.notifications,
		order: 20
	},
	{
		id: 'settings',
		label: '設定',
		href: '/settings',
		icon: navIcons.settings,
		order: 100
	}
];

/**
 * 根據權限過濾導航項目
 */
export function filterNavigationByPermission(
	items: NavItem[],
	hasPermission: (permission: string) => boolean
): NavItem[] {
	return items
		.filter((item) => {
			if (!item.permission) return true;
			return hasPermission(item.permission);
		})
		.map((item) => ({
			...item,
			children: item.children
				? filterNavigationByPermission(item.children, hasPermission)
				: undefined
		}))
		.filter((item) => !item.children || item.children.length > 0);
}

/**
 * 排序導航項目
 */
export function sortNavigation(items: NavItem[]): NavItem[] {
	return [...items]
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
		.map((item) => ({
			...item,
			children: item.children ? sortNavigation(item.children) : undefined
		}));
}
