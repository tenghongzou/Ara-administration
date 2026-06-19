<script lang="ts">
	import { goto, afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Spinner } from '$lib/components/ui';
	import { auth, isAuthenticated, isAuthInitialized, hasAnyPermission } from '$lib/stores/auth';
	import { getRoutePermissions } from '$lib/permissions';
	import { toast } from '$lib/stores/toast';
	import { sessionTimeout } from '$lib/services';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let authenticated = $derived($isAuthenticated);
	let initialized = $derived($isAuthInitialized);

	// Initialize auth on mount
	$effect(() => {
		if (browser && !initialized) {
			auth.initialize();
		}
	});

	// Route guard: redirect to login if not authenticated
	$effect(() => {
		if (browser && initialized && !authenticated) {
			goto('/login');
		}
	});

	// Route permission guard: check permissions after navigation
	afterNavigate((navigation) => {
		if (!browser || !initialized || !authenticated) return;

		const pathname = navigation.to?.url.pathname;
		if (!pathname) return;

		const requiredPermissions = getRoutePermissions(pathname);
		if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
			toast.error('您沒有權限訪問此頁面');
			goto('/dashboard');
		}
	});

	// Session timeout management
	$effect(() => {
		if (!browser || !initialized) return;

		if (authenticated) {
			sessionTimeout.start();
			return () => {
				sessionTimeout.stop();
			};
		} else {
			sessionTimeout.stop();
		}
	});
</script>

{#if !initialized}
	<div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
		<div class="flex flex-col items-center gap-3">
			<Spinner size="lg" />
			<p class="text-gray-500 dark:text-gray-400">載入中...</p>
		</div>
	</div>
{:else if authenticated}
	{@render children()}
{/if}
