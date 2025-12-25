<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { Toggle } from '$lib/components/forms';
	import { Mail } from 'lucide-svelte';
	import NotificationToggleGroup from './NotificationToggleGroup.svelte';
	import type { EmailNotificationSettings } from '../types';

	interface Props {
		settings: EmailNotificationSettings;
		onToggleEnabled: () => void;
		onToggle: (key: string, value: boolean) => void;
	}

	let { settings, onToggleEnabled, onToggle }: Props = $props();

	let toggleItems = $derived([
		{ key: 'securityAlerts', label: '安全性警報', description: '帳號安全相關通知（建議保持開啟）', checked: settings.securityAlerts },
		{ key: 'loginNotifications', label: '登入通知', description: '當您的帳號在新裝置登入時通知', checked: settings.loginNotifications },
		{ key: 'systemUpdates', label: '系統更新', description: '系統維護、功能更新等重要公告', checked: settings.systemUpdates },
		{ key: 'subscriptionReminders', label: '訂閱提醒', description: '訂閱到期、續約提醒', checked: settings.subscriptionReminders },
		{ key: 'weeklyReport', label: '週報', description: '每週系統使用報告摘要', checked: settings.weeklyReport },
		{ key: 'marketing', label: '產品資訊', description: '新功能介紹、使用技巧等', checked: settings.marketing }
	]);
</script>

<Card variant="bordered">
	{#snippet header()}
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
					<Mail class="w-5 h-5 text-blue-600 dark:text-blue-400" />
				</div>
				<div>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">電子郵件通知</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400">選擇要透過電子郵件接收的通知</p>
				</div>
			</div>
			<Toggle checked={settings.enabled} onchange={onToggleEnabled} />
		</div>
	{/snippet}
	{#snippet children()}
		{#if settings.enabled}
			<NotificationToggleGroup items={toggleItems} {onToggle} />
		{:else}
			<div class="text-center py-4">
				<p class="text-sm text-gray-500 dark:text-gray-400">電子郵件通知已停用</p>
			</div>
		{/if}
	{/snippet}
</Card>
