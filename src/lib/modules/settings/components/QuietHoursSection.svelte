<script lang="ts">
	import { Card, Button, Badge } from '$lib/components/ui';
	import { Moon } from 'lucide-svelte';
	import type { QuietHoursSettings } from '../types';

	interface Props {
		settings: QuietHoursSettings;
		onEdit: () => void;
	}

	let { settings, onEdit }: Props = $props();

	let displayText = $derived(settings.enabled ? `${settings.startTime} - ${settings.endTime}` : '未啟用');
</script>

<Card variant="bordered">
	{#snippet header()}
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
					<Moon class="w-5 h-5 text-orange-600 dark:text-orange-400" />
				</div>
				<div>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">靜音時段</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400">在指定時間內暫停通知</p>
				</div>
			</div>
			{#if settings.enabled}
				<Badge variant="info">{displayText}</Badge>
			{:else}
				<Badge variant="default">未啟用</Badge>
			{/if}
		</div>
	{/snippet}
	{#snippet children()}
		<div class="flex items-center justify-between">
			<div>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					{#if settings.enabled}
						在 {settings.startTime} 至 {settings.endTime} 期間暫停非緊急通知
						{#if settings.allowUrgent}
							<span class="text-gray-500">（緊急通知除外）</span>
						{/if}
					{:else}
						設定特定時間段內暫停接收通知
					{/if}
				</p>
			</div>
			<Button variant="outline" onclick={onEdit}>
				{#snippet children()}
					{settings.enabled ? '編輯' : '設定'}
				{/snippet}
			</Button>
		</div>
	{/snippet}
</Card>
