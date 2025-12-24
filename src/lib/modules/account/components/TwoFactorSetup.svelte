<script lang="ts">
	import { Modal, Button } from '$lib/components/ui';
	import { twoFactorService } from '../services/two-factor.service';
	import { toast } from '$lib/stores/toast';
	import type { TwoFactorSetup as TwoFactorSetupType } from '$lib/types';
	import type { TwoFactorStep } from '../types';

	interface Props {
		open: boolean;
		userId: string;
		onClose: () => void;
		onComplete: () => void;
	}

	let { open = $bindable(false), userId, onClose, onComplete }: Props = $props();

	let step = $state<TwoFactorStep>('setup');
	let setup = $state<TwoFactorSetupType | null>(null);
	let verificationCode = $state('');
	let loading = $state(false);
	let backupCodes = $state<string[]>([]);

	$effect(() => {
		if (open && !setup) {
			loadSetup();
		}
	});

	async function loadSetup() {
		try {
			setup = await twoFactorService.setup(userId);
		} catch (error) {
			toast.error('設定失敗，請稍後再試');
			handleClose();
		}
	}

	function handleClose() {
		open = false;
		step = 'setup';
		verificationCode = '';
		setup = null;
		backupCodes = [];
		onClose();
	}

	async function handleNext() {
		if (step === 'setup') {
			step = 'verify';
			return;
		}

		if (step === 'verify') {
			if (!setup) return;

			loading = true;
			try {
				await twoFactorService.verify(userId, verificationCode, setup.secret);
				backupCodes = setup.backupCodes;
				step = 'backup';
			} catch (error) {
				toast.error(error instanceof Error ? error.message : '驗證失敗');
			} finally {
				loading = false;
			}
			return;
		}

		if (step === 'backup') {
			toast.success('兩步驟驗證已啟用');
			onComplete();
			handleClose();
		}
	}

	async function copyBackupCodes() {
		await twoFactorService.copyBackupCodes(backupCodes);
		toast.success('已複製到剪貼簿');
	}

	function downloadBackupCodes() {
		twoFactorService.downloadBackupCodes(backupCodes);
	}

	const stepIndex = $derived(['setup', 'verify', 'backup'].indexOf(step));
</script>

<Modal {open} onClose={handleClose} title="設定兩步驟驗證" size="lg">
	{#snippet children()}
		<div class="space-y-6">
			<!-- 步驟指示器 -->
			<div class="flex items-center justify-center gap-2">
				{#each ['setup', 'verify', 'backup'] as s, i}
					<div class="flex items-center">
						<div
							class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium {stepIndex ===
							i
								? 'bg-[var(--color-primary-500)] text-white'
								: stepIndex > i
									? 'bg-green-500 text-white'
									: 'bg-gray-200 dark:bg-gray-700 text-gray-500'}"
						>
							{#if stepIndex > i}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							{:else}
								{i + 1}
							{/if}
						</div>
						{#if i < 2}
							<div
								class="w-12 h-0.5 mx-1 {stepIndex > i ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}"
							></div>
						{/if}
					</div>
				{/each}
			</div>

			{#if step === 'setup'}
				<div class="text-center space-y-4">
					<p class="text-sm text-gray-600 dark:text-gray-400">
						使用驗證器 App（如 Google Authenticator、Authy）掃描以下 QR Code
					</p>
					<div
						class="w-48 h-48 mx-auto bg-white dark:bg-gray-100 rounded-lg flex items-center justify-center p-4"
					>
						{#if setup}
							<div
								class="w-full h-full bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center"
							>
								<svg class="w-32 h-32 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
									<path
										d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v3h-3v-3zm-5 0h3v3h-3v-3zm5 5h3v3h-3v-3zm-5 0h3v3h-3v-3z"
									/>
								</svg>
							</div>
						{:else}
							<svg class="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								></path>
							</svg>
						{/if}
					</div>
					{#if setup}
						<p class="text-xs text-gray-500 dark:text-gray-400">
							無法掃描？手動輸入金鑰：
							<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded select-all"
								>{setup.secret}</code
							>
						</p>
					{/if}
				</div>
			{:else if step === 'verify'}
				<div class="space-y-4">
					<p class="text-sm text-gray-600 dark:text-gray-400 text-center">
						請輸入驗證器 App 顯示的 6 位數驗證碼
					</p>
					<div class="max-w-xs mx-auto">
						<label
							for="verification-code"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 text-center"
						>
							驗證碼
						</label>
						<input
							id="verification-code"
							type="text"
							inputmode="numeric"
							bind:value={verificationCode}
							placeholder="000000"
							maxlength={6}
							class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-xl text-center tracking-[0.5em] text-gray-900 dark:text-gray-100 dark:bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
						/>
					</div>
				</div>
			{:else if step === 'backup'}
				<div class="space-y-4">
					<div
						class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
					>
						<div class="flex gap-3">
							<svg
								class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
							<div>
								<p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">請保存您的備份碼</p>
								<p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
									這些備份碼可在您無法使用驗證器 App 時使用。每個備份碼只能使用一次。
								</p>
							</div>
						</div>
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
				</div>
			{/if}

			<div class="flex justify-end gap-3 pt-2">
				{#if step !== 'backup'}
					<Button type="button" variant="ghost" onclick={handleClose}>
						{#snippet children()}取消{/snippet}
					</Button>
				{/if}
				<Button onclick={handleNext} {loading}>
					{#snippet children()}
						{#if step === 'setup'}
							下一步
						{:else if step === 'verify'}
							驗證並啟用
						{:else}
							完成設定
						{/if}
					{/snippet}
				</Button>
			</div>
		</div>
	{/snippet}
</Modal>
