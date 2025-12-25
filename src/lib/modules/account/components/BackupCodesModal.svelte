<script lang="ts">
	import { Modal, Button, PasswordInput } from '$lib/components/ui';
	import { twoFactorService } from '../services/two-factor.service';
	import { toast } from '$lib/stores/toast';

	interface Props {
		open: boolean;
		userId: string;
		onClose: () => void;
	}

	let { open = $bindable(false), userId, onClose }: Props = $props();

	let password = $state('');
	let backupCodes = $state<string[]>([]);
	let loading = $state(false);

	function handleClose() {
		password = '';
		backupCodes = [];
		onClose();
	}

	async function handleRegenerate() {
		if (!password) {
			toast.error('請輸入密碼');
			return;
		}

		loading = true;
		try {
			backupCodes = await twoFactorService.regenerateBackupCodes(userId, password);
			toast.success('已產生新的備份碼');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '產生失敗');
		} finally {
			loading = false;
		}
	}

	async function copyBackupCodes() {
		await twoFactorService.copyBackupCodes(backupCodes);
		toast.success('已複製到剪貼簿');
	}

	function downloadBackupCodes() {
		twoFactorService.downloadBackupCodes(backupCodes);
	}
</script>

<Modal {open} onClose={handleClose} title="備份碼">
	{#snippet children()}
		<div class="space-y-4">
			{#if backupCodes.length === 0}
				<p class="text-sm text-gray-600 dark:text-gray-400">
					輸入密碼以查看或重新產生備份碼。
				</p>

				<PasswordInput
					label="確認密碼"
					placeholder="請輸入密碼"
					bind:value={password}
					autocomplete="current-password"
					required
				/>

				<div class="flex justify-end gap-3 pt-2">
					<Button type="button" variant="ghost" onclick={handleClose}>
						{#snippet children()}取消{/snippet}
					</Button>
					<Button {loading} onclick={handleRegenerate}>
						{#snippet children()}產生新備份碼{/snippet}
					</Button>
				</div>
			{:else}
				<div
					class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
				>
					<p class="text-sm text-yellow-700 dark:text-yellow-300">
						這些是新產生的備份碼，之前的備份碼已失效。請妥善保管。
					</p>
				</div>

				<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
					<div class="grid grid-cols-2 gap-2">
						{#each backupCodes as code}
							<code
								class="text-sm font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-center"
							>
								{code}
							</code>
						{/each}
					</div>
				</div>

				<div class="flex justify-center gap-3">
					<Button variant="outline" onclick={copyBackupCodes}>
						{#snippet children()}
							<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								/>
							</svg>
							複製
						{/snippet}
					</Button>
					<Button variant="outline" onclick={downloadBackupCodes}>
						{#snippet children()}
							<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
								/>
							</svg>
							下載
						{/snippet}
					</Button>
				</div>

				<div class="flex justify-end pt-2">
					<Button onclick={handleClose}>
						{#snippet children()}完成{/snippet}
					</Button>
				</div>
			{/if}
		</div>
	{/snippet}
</Modal>
