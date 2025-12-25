<script lang="ts">
	import { Card, Button, Badge } from '$lib/components/ui';
	import { Toggle } from '$lib/components/forms';
	import { Bell } from 'lucide-svelte';
	import NotificationToggleGroup from './NotificationToggleGroup.svelte';
	import type { PushNotificationSettings } from '../types';

	interface Props {
		settings: PushNotificationSettings;
		permission: NotificationPermission;
		onToggleEnabled: () => void;
		onToggle: (key: string, value: boolean) => void;
		onRequestPermission: () => void;
		onTestPush: () => void;
	}

	let { settings, permission, onToggleEnabled, onToggle, onRequestPermission, onTestPush }: Props = $props();

	let toggleItems = $derived([
		{ key: 'securityAlerts', label: '安全性警報', description: '帳號安全相關即時通知', checked: settings.securityAlerts },
		{ key: 'loginNotifications', label: '新裝置登入', description: '當您的帳號在新裝置登入時通知', checked: settings.loginNotifications },
		{ key: 'systemAlerts', label: '系統警報', description: '緊急系統問題通知', checked: settings.systemAlerts },
		{ key: 'mentions', label: '提及通知', description: '當有人提及您時通知', checked: settings.mentions },
		{ key: 'subscriptionReminders', label: '訂閱提醒', description: '訂閱到期提醒推播', checked: settings.subscriptionReminders }
	]);
</script>

<Card variant="bordered">
	{#snippet header()}
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
					<Bell class="w-5 h-5 text-green-600 dark:text-green-400" />
				</div>
				<div>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">推播通知</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400">在瀏覽器接收即時通知</p>
				</div>
			</div>
			<div class="flex items-center gap-3">
				{#if permission === 'denied'}
					<Badge variant="error">權限被拒絕</Badge>
				{:else if permission === 'granted'}
					<Toggle checked={settings.enabled} onchange={onToggleEnabled} />
				{:else}
					<Button variant="outline" size="sm" onclick={onRequestPermission}>
						{#snippet children()}啟用推播{/snippet}
					</Button>
				{/if}
			</div>
		</div>
	{/snippet}
	{#snippet children()}
		{#if permission === 'denied'}
			<div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
				<p class="text-sm text-yellow-700 dark:text-yellow-300">
					推播權限已被拒絕。請在瀏覽器設定中重新啟用此網站的通知權限。
				</p>
			</div>
		{:else if permission === 'granted' && settings.enabled}
			<div class="space-y-4">
				<NotificationToggleGroup items={toggleItems} {onToggle} />
				<div class="pt-2 border-t border-gray-200 dark:border-gray-700">
					<Button variant="outline" size="sm" onclick={onTestPush}>
						{#snippet children()}
							<Bell class="w-4 h-4 mr-1.5" />
							發送測試通知
						{/snippet}
					</Button>
				</div>
			</div>
		{:else}
			<div class="text-center py-4">
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{#if permission === 'granted'}
						推播通知已停用
					{:else}
						推播通知尚未啟用。點擊上方按鈕以允許瀏覽器發送通知。
					{/if}
				</p>
			</div>
		{/if}
	{/snippet}
</Card>
