<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { Toggle } from '$lib/components/forms';
	import { Monitor } from 'lucide-svelte';
	import NotificationToggleGroup from './NotificationToggleGroup.svelte';
	import type { InAppNotificationSettings } from '../types';

	interface Props {
		settings: InAppNotificationSettings;
		onToggleEnabled: () => void;
		onToggle: (key: string, value: boolean) => void;
	}

	let { settings, onToggleEnabled, onToggle }: Props = $props();

	let toggleItems = $derived([
		{ key: 'showBadge', label: '顯示通知標記', description: '在選單上顯示未讀通知數量', checked: settings.showBadge },
		{ key: 'playSound', label: '播放提示音', description: '收到新通知時播放提示音', checked: settings.playSound },
		{ key: 'desktopPopup', label: '彈出通知', description: '在螢幕角落顯示通知訊息', checked: settings.desktopPopup },
		{ key: 'autoMarkRead', label: '自動標記已讀', description: '開啟通知列表時自動標記所有通知為已讀', checked: settings.autoMarkRead }
	]);
</script>

<Card variant="bordered">
	{#snippet header()}
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
					<Monitor class="w-5 h-5 text-purple-600 dark:text-purple-400" />
				</div>
				<div>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">應用程式內通知</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400">系統內通知顯示方式</p>
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
				<p class="text-sm text-gray-500 dark:text-gray-400">應用程式內通知已停用</p>
			</div>
		{/if}
	{/snippet}
</Card>
