<script lang="ts">
	import { Card } from '$lib/components/ui';

	interface QuickAction {
		href: string;
		icon: string;
		iconBgClass: string;
		iconColorClass: string;
		title: string;
		description: string;
	}

	const actions: QuickAction[] = [
		{
			href: '/settings/users/new',
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>`,
			iconBgClass: 'bg-[var(--color-primary-100)]',
			iconColorClass: 'text-[var(--color-primary-600)]',
			title: '新增使用者',
			description: '建立新帳號'
		},
		{
			href: '/settings/users',
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
			iconBgClass: 'bg-green-100',
			iconColorClass: 'text-green-600',
			title: '使用者列表',
			description: '管理帳號'
		},
		{
			href: '/settings',
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
			iconBgClass: 'bg-yellow-100',
			iconColorClass: 'text-yellow-600',
			title: '系統設定',
			description: '調整設定'
		},
		{
			href: '/settings/logs',
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`,
			iconBgClass: 'bg-purple-100',
			iconColorClass: 'text-purple-600',
			title: '稽核日誌',
			description: '查看記錄'
		}
	];
</script>

<Card variant="bordered">
	{#snippet header()}
		<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">快速操作</h2>
	{/snippet}
	{#snippet children()}
		<div class="grid grid-cols-2 gap-4">
			{#each actions as action}
				<a
					href={action.href}
					class="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				>
					<div
						class="w-10 h-10 rounded-lg {action.iconBgClass} {action.iconColorClass} flex items-center justify-center"
					>
						{@html action.icon}
					</div>
					<div>
						<p class="font-medium text-gray-900 dark:text-gray-100">{action.title}</p>
						<p class="text-sm text-gray-500">{action.description}</p>
					</div>
				</a>
			{/each}
		</div>
	{/snippet}
</Card>
