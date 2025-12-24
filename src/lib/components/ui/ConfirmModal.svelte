<script lang="ts">
	import type { Snippet } from 'svelte';
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';

	interface Props {
		/** 是否顯示 */
		open: boolean;
		/** 標題 */
		title?: string;
		/** 確認訊息 */
		message?: string;
		/** 確認按鈕文字 */
		confirmText?: string;
		/** 取消按鈕文字 */
		cancelText?: string;
		/** 變體樣式 */
		variant?: 'danger' | 'warning' | 'info';
		/** 是否載入中 */
		loading?: boolean;
		/** 確認回呼 */
		onConfirm: () => void;
		/** 取消回呼 */
		onCancel?: () => void;
		/** 自訂內容 */
		children?: Snippet;
	}

	let {
		open = $bindable(false),
		title = '確認操作',
		message = '確定要執行此操作嗎？',
		confirmText = '確認',
		cancelText = '取消',
		variant = 'danger',
		loading = false,
		onConfirm,
		onCancel,
		children
	}: Props = $props();

	function handleCancel() {
		open = false;
		onCancel?.();
	}

	function handleConfirm() {
		onConfirm();
	}

	const variantConfig = {
		danger: {
			icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
			iconBg: 'bg-red-100 dark:bg-red-900/30',
			iconColor: 'text-red-600 dark:text-red-400',
			buttonVariant: 'danger' as const
		},
		warning: {
			icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
			iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
			iconColor: 'text-yellow-600 dark:text-yellow-400',
			buttonVariant: 'primary' as const
		},
		info: {
			icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
			iconBg: 'bg-blue-100 dark:bg-blue-900/30',
			iconColor: 'text-blue-600 dark:text-blue-400',
			buttonVariant: 'primary' as const
		}
	};

	const config = $derived(variantConfig[variant]);
</script>

<Modal bind:open {title} size="sm">
	{#snippet children()}
		<div class="flex gap-4">
			<div
				class="flex-shrink-0 w-10 h-10 rounded-full {config.iconBg} flex items-center justify-center"
			>
				<svg class="w-5 h-5 {config.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={config.icon} />
				</svg>
			</div>
			<div class="flex-1">
				{#if children}
					{@render children()}
				{:else}
					<p class="text-gray-600 dark:text-gray-400">{message}</p>
				{/if}
			</div>
		</div>
	{/snippet}
	{#snippet footer()}
		<Button variant="outline" onclick={handleCancel} disabled={loading}>
			{#snippet children()}{cancelText}{/snippet}
		</Button>
		<Button variant={config.buttonVariant} {loading} onclick={handleConfirm}>
			{#snippet children()}{confirmText}{/snippet}
		</Button>
	{/snippet}
</Modal>
