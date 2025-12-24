<script lang="ts">
	import { cn } from '$lib/utils';
	import Button from './Button.svelte';

	interface Props {
		class?: string;
		onRetry?: () => void;
		children?: import('svelte').Snippet;
	}

	let { class: className = '', onRetry, children }: Props = $props();

	let hasError = $state(false);
	let errorMessage = $state('');

	export function reset() {
		hasError = false;
		errorMessage = '';
	}

	export function setError(error: Error | string) {
		hasError = true;
		errorMessage = typeof error === 'string' ? error : error.message;
	}

	function handleRetry() {
		reset();
		onRetry?.();
	}
</script>

{#if hasError}
	<div
		class={cn(
			'flex flex-col items-center justify-center py-12 px-4',
			className
		)}
		role="alert"
		aria-live="assertive"
	>
		<div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
			<svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>
		</div>
		<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
			發生錯誤
		</h3>
		<p class="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
			{errorMessage || '載入時發生錯誤，請稍後再試'}
		</p>
		{#if onRetry}
			<Button onclick={handleRetry}>
				{#snippet children()}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
					重試
				{/snippet}
			</Button>
		{/if}
	</div>
{:else}
	{@render children?.()}
{/if}
