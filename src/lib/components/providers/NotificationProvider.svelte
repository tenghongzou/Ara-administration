<script lang="ts">
	import { browser } from '$app/environment';
	import { isAuthenticated, isAuthInitialized, currentUser } from '$lib/stores/auth';
	import { notificationSettings } from '$lib/stores/notification-settings';
	import { notificationApi, pushNotificationService } from '$lib/services';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let authenticated = $derived($isAuthenticated);
	let initialized = $derived($isAuthInitialized);

	// Load notification settings
	$effect(() => {
		if (!browser || !initialized || !authenticated) return;

		const user = $currentUser;
		if (!user) return;

		// Check localStorage first; if present, use cached settings
		const storedSettings = localStorage.getItem('notification-settings');
		if (storedSettings) {
			pushNotificationService.preloadSounds();
		} else {
			// No localStorage settings; load defaults from API
			notificationApi.getSettings().then((settings) => {
				notificationSettings.set(settings);
				pushNotificationService.preloadSounds();
			});
		}
	});
</script>

{@render children()}
