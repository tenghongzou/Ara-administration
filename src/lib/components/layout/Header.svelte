<script lang="ts">
	import { cn } from '$lib/utils';
	import { ui } from '$lib/stores/ui';
	import NotificationDropdown from '$lib/components/ui/NotificationDropdown.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<header
	class={cn(
		'fixed top-0 right-0 z-30 h-16',
		'bg-white dark:bg-gray-900',
		'border-b border-gray-200 dark:border-gray-700',
		'lg:left-64 left-0',
		className
	)}
>
	<div class="flex items-center justify-between h-full px-4 lg:px-6">
		<div class="flex items-center gap-4">
			<button
				type="button"
				class="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
				onclick={() => ui.toggleSidebar()}
				aria-label="切換選單"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>
		</div>

		<div class="flex items-center gap-2">
			<ThemeToggle />
			<NotificationDropdown />
		</div>
	</div>
</header>
