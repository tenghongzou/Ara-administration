<script lang="ts">
	import { Card, Button, Badge } from '$lib/components/ui';

	interface Props {
		enabled: boolean;
		onEnable: () => void;
		onDisable: () => void;
		onViewBackupCodes: () => void;
	}

	let { enabled, onEnable, onDisable, onViewBackupCodes }: Props = $props();
</script>

<Card variant="bordered">
	{#snippet header()}
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
				<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">兩步驟驗證</h2>
			</div>
			{#if enabled}
				<Badge variant="success">已啟用</Badge>
			{:else}
				<Badge variant="warning">未啟用</Badge>
			{/if}
		</div>
	{/snippet}
	{#snippet children()}
		<div class="space-y-4">
			<p class="text-sm text-gray-600 dark:text-gray-400">
				兩步驟驗證可為您的帳號增加額外的安全保護。啟用後，登入時除了密碼外，還需要輸入驗證器 App
				產生的驗證碼。
			</p>
			{#if enabled}
				<div class="flex flex-wrap gap-3">
					<Button variant="outline" onclick={onViewBackupCodes}>
						{#snippet children()}
							<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							查看備份碼
						{/snippet}
					</Button>
					<Button variant="ghost" onclick={onDisable}>
						{#snippet children()}停用兩步驟驗證{/snippet}
					</Button>
				</div>
			{:else}
				<Button onclick={onEnable}>
					{#snippet children()}
						<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
						啟用兩步驟驗證
					{/snippet}
				</Button>
			{/if}
		</div>
	{/snippet}
</Card>
