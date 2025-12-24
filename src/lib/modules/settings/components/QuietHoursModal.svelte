<script lang="ts">
	import { Modal, Button } from '$lib/components/ui';
	import { Toggle } from '$lib/components/forms';
	import type { QuietHoursSettings } from '../types';

	interface Props {
		open: boolean;
		settings: QuietHoursSettings;
		onClose: () => void;
		onSave: (settings: QuietHoursSettings) => void;
	}

	let { open = $bindable(), settings, onClose, onSave }: Props = $props();

	let form = $state<QuietHoursSettings>({
		enabled: false,
		startTime: '22:00',
		endTime: '08:00',
		allowUrgent: true
	});

	$effect(() => {
		if (open) {
			form = { ...settings };
		}
	});

	function handleSave() {
		onSave(form);
		open = false;
	}
</script>

<Modal {open} onClose={onClose} title="靜音時段設定">
	{#snippet children()}
		<div class="space-y-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-900 dark:text-gray-100">啟用靜音時段</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">在指定時間內暫停通知</p>
				</div>
				<Toggle
					checked={form.enabled}
					onchange={() => form.enabled = !form.enabled}
				/>
			</div>

			{#if form.enabled}
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="start-time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
								開始時間
							</label>
							<input
								id="start-time"
								type="time"
								bind:value={form.startTime}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
							/>
						</div>
						<div>
							<label for="end-time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
								結束時間
							</label>
							<input
								id="end-time"
								type="time"
								bind:value={form.endTime}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
							/>
						</div>
					</div>

					<div class="flex items-center justify-between py-2">
						<div>
							<p class="text-sm font-medium text-gray-900 dark:text-gray-100">允許緊急通知</p>
							<p class="text-sm text-gray-500 dark:text-gray-400">安全性警報等緊急通知不受限制</p>
						</div>
						<Toggle
							checked={form.allowUrgent}
							onchange={() => form.allowUrgent = !form.allowUrgent}
						/>
					</div>

					<div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
						<p class="text-sm text-gray-600 dark:text-gray-400">
							在 <span class="font-medium">{form.startTime}</span> 到
							<span class="font-medium">{form.endTime}</span> 期間，
							{#if form.allowUrgent}
								只有緊急通知會發送。
							{:else}
								所有通知都會暫停。
							{/if}
						</p>
					</div>
				</div>
			{/if}

			<div class="flex justify-end gap-3 pt-2">
				<Button variant="ghost" onclick={onClose}>
					{#snippet children()}取消{/snippet}
				</Button>
				<Button onclick={handleSave}>
					{#snippet children()}確定{/snippet}
				</Button>
			</div>
		</div>
	{/snippet}
</Modal>
