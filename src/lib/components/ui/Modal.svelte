<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		open: boolean;
		title?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		closable?: boolean;
		class?: string;
		header?: Snippet;
		footer?: Snippet;
		children: Snippet;
		onClose?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		size = 'md',
		closable = true,
		class: className = '',
		header,
		footer,
		children,
		onClose
	}: Props = $props();

	const sizes = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		full: 'max-w-4xl'
	};

	let dialogEl: HTMLDivElement | undefined;
	let previousActiveElement: HTMLElement | null = null;

	function handleClose() {
		if (closable) {
			open = false;
			onClose?.();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!open) return;

		if (event.key === 'Escape' && closable) {
			handleClose();
			return;
		}

		// Focus trap: Tab cycles within the modal
		if (event.key === 'Tab' && dialogEl) {
			const focusable = dialogEl.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (event.shiftKey) {
				if (document.activeElement === first) {
					event.preventDefault();
					last.focus();
				}
			} else {
				if (document.activeElement === last) {
					event.preventDefault();
					first.focus();
				}
			}
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	// Focus management: trap focus on open, restore on close
	$effect(() => {
		if (open) {
			previousActiveElement = document.activeElement as HTMLElement;
			// Focus the first focusable element after transition
			requestAnimationFrame(() => {
				if (dialogEl) {
					const focusable = dialogEl.querySelector<HTMLElement>(
						'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
					);
					focusable?.focus();
				}
			});
		} else if (previousActiveElement) {
			previousActiveElement.focus();
			previousActiveElement = null;
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
		transition:fade={{ duration: 200 }}
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'modal-title' : undefined}
		tabindex="-1"
		bind:this={dialogEl}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class={cn('w-full bg-white dark:bg-gray-900 rounded-lg shadow-xl', sizes[size], className)}
			transition:scale={{ duration: 200, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
			role="document"
		>
			{#if header || title}
				<div
					class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
				>
					{#if header}
						{@render header()}
					{:else if title}
						<h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
							{title}
						</h2>
					{/if}

					{#if closable}
						<button
							type="button"
							class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
							onclick={handleClose}
							aria-label="關閉"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					{/if}
				</div>
			{/if}

			<div class="px-6 py-4">
				{@render children()}
			</div>

			{#if footer}
				<div
					class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700"
				>
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
