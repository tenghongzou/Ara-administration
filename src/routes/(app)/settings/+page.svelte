<script lang="ts">
	import { config } from '$lib/constants';
	import { PageContainer } from '$lib/components/layout';
	import type { Permission } from '$lib/permissions';
	import { hasPermission } from '$lib/stores/auth';

	interface SettingsModule {
		title: string;
		description: string;
		href: string;
		icon: string;
		iconBgColor: string;
		iconColor: string;
		permission?: Permission;
	}

	const allModules: SettingsModule[] = [
		{
			title: '一般設定',
			description: '主題模式、外觀偏好設定',
			href: '/settings/general',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />',
			iconBgColor: 'bg-blue-100 dark:bg-blue-900/30',
			iconColor: 'text-blue-600 dark:text-blue-400'
		},
		{
			title: '個人資料',
			description: '姓名、頭像、聯絡資訊',
			href: '/settings/profile',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />',
			iconBgColor: 'bg-green-100 dark:bg-green-900/30',
			iconColor: 'text-green-600 dark:text-green-400'
		},
		{
			title: '安全設定',
			description: '密碼、兩步驟驗證、登入活動',
			href: '/settings/security',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />',
			iconBgColor: 'bg-orange-100 dark:bg-orange-900/30',
			iconColor: 'text-orange-600 dark:text-orange-400'
		},
		{
			title: '通知設定',
			description: '電子郵件、推播、通知偏好',
			href: '/settings/notifications',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />',
			iconBgColor: 'bg-purple-100 dark:bg-purple-900/30',
			iconColor: 'text-purple-600 dark:text-purple-400'
		},
		{
			title: '稽核日誌',
			description: '系統操作紀錄、活動追蹤',
			href: '/settings/logs',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />',
			iconBgColor: 'bg-gray-100 dark:bg-gray-800',
			iconColor: 'text-gray-600 dark:text-gray-400',
			permission: 'logs:read'
		},
		{
			title: '使用者管理',
			description: '帳號管理、權限設定',
			href: '/settings/users',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />',
			iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
			iconColor: 'text-indigo-600 dark:text-indigo-400',
			permission: 'users:read'
		},
		{
			title: '角色管理',
			description: '管理角色與權限分配',
			href: '/settings/roles',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />',
			iconBgColor: 'bg-rose-100 dark:bg-rose-900/30',
			iconColor: 'text-rose-600 dark:text-rose-400',
			permission: 'roles:read'
		}
	];

	// Filter modules based on user permissions
	let modules = $derived(
		allModules.filter((m) => !m.permission || hasPermission(m.permission))
	);
</script>

<svelte:head>
	<title>設定 - {config.appName}</title>
</svelte:head>

<PageContainer title="設定" description="管理您的帳號設定和偏好">
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="settings-modules">
		{#each modules as module}
			<a
				href={module.href}
				class="group block p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[var(--color-primary-300)] dark:hover:border-[var(--color-primary-700)] hover:shadow-lg transition-all duration-200"
				data-testid="settings-module-{module.href.split('/').pop()}"
			>
				<div class="flex items-start gap-4">
					<div class={`w-12 h-12 rounded-xl ${module.iconBgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
						<svg class={`w-6 h-6 ${module.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{@html module.icon}
						</svg>
					</div>
					<div class="flex-1 min-w-0">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[var(--color-primary-600)] dark:group-hover:text-[var(--color-primary-400)] transition-colors">
							{module.title}
						</h3>
						<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{module.description}
						</p>
					</div>
					<div class="flex-shrink-0 text-gray-400 group-hover:text-[var(--color-primary-500)] group-hover:translate-x-1 transition-all duration-200">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</div>
			</a>
		{/each}
	</div>
</PageContainer>
