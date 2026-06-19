<script lang="ts">
	import { Sidebar, Header } from '$lib/components/layout';
	import { Toast, ReauthModal } from '$lib/components/ui';
	import { AuthGuard, WebSocketProvider, NotificationProvider } from '$lib/components/providers';
	import { moduleRegistry } from '$lib/modules';

	let { children: page } = $props();

	// Navigation config from module system
	const navItems = moduleRegistry.getNavigation();
</script>

<AuthGuard>
	{#snippet children()}
		<WebSocketProvider>
			{#snippet children()}
				<NotificationProvider>
					{#snippet children()}
						<div class="h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 flex flex-col">
							<Sidebar items={navItems} />
							<Header />

							<main class="lg:ml-64 pt-16 flex-1 overflow-hidden flex flex-col">
								<div class="flex-1 overflow-auto min-h-0">
									{@render page()}
								</div>
							</main>

							<ReauthModal />
							<Toast />
						</div>
					{/snippet}
				</NotificationProvider>
			{/snippet}
		</WebSocketProvider>
	{/snippet}
</AuthGuard>
