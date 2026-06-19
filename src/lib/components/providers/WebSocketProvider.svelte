<script lang="ts">
	import { browser } from '$app/environment';
	import { isAuthenticated, isAuthInitialized, currentUser } from '$lib/stores/auth';
	import { websocket, initWebSocket, closeWebSocket } from '$lib/services';
	import { notifications } from '$lib/stores/notifications';
	import { notificationSettings } from '$lib/stores/notification-settings';
	import type { Notification } from '$lib/stores/notifications';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let authenticated = $derived($isAuthenticated);
	let initialized = $derived($isAuthInitialized);

	// WebSocket status tracking (nested store requires manual subscription)
	let wsStatus = $state<string>('disconnected');
	$effect(() => {
		const unsubscribe = websocket.status.subscribe((value) => {
			wsStatus = value;
		});
		return unsubscribe;
	});

	// WebSocket connection management
	$effect(() => {
		if (!browser || !initialized) return;

		if (authenticated) {
			initWebSocket();

			const unsubscribeConnected = websocket.on('connected', () => {
				console.log('[App] WebSocket connected');
				const user = $currentUser;
				if (user) {
					websocket.send({
						type: 'Subscribe',
						payload: { channels: [`user:${user.id}`, 'broadcast'] }
					});
				}
			});

			const unsubscribeDisconnected = websocket.on('disconnected', (payload) => {
				console.log('[App] WebSocket disconnected:', payload);
			});

			const unsubscribeNotificationsList = websocket.on<{ items: Notification[] }>(
				'notifications:list',
				(payload) => {
					notifications.setItems(payload.items);
				}
			);

			const unsubscribeNotificationRead = websocket.on<{ id: string }>(
				'notification:read',
				(payload) => {
					notifications.markAsRead(payload.id);
				}
			);

			return () => {
				unsubscribeConnected();
				unsubscribeDisconnected();
				unsubscribeNotificationsList();
				unsubscribeNotificationRead();
				closeWebSocket();
			};
		} else {
			closeWebSocket();
			notifications.reset();
			notificationSettings.reset();
		}
	});
</script>

{@render children()}

<!-- WebSocket connection status indicator (dev only) -->
{#if import.meta.env.DEV}
	<div
		class="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg transition-colors duration-200"
		class:bg-green-100={wsStatus === 'connected'}
		class:text-green-800={wsStatus === 'connected'}
		class:dark:bg-green-900={wsStatus === 'connected'}
		class:dark:text-green-200={wsStatus === 'connected'}
		class:bg-yellow-100={wsStatus === 'connecting' || wsStatus === 'reconnecting'}
		class:text-yellow-800={wsStatus === 'connecting' || wsStatus === 'reconnecting'}
		class:dark:bg-yellow-900={wsStatus === 'connecting' || wsStatus === 'reconnecting'}
		class:dark:text-yellow-200={wsStatus === 'connecting' || wsStatus === 'reconnecting'}
		class:bg-red-100={wsStatus === 'disconnected' || wsStatus === 'error'}
		class:text-red-800={wsStatus === 'disconnected' || wsStatus === 'error'}
		class:dark:bg-red-900={wsStatus === 'disconnected' || wsStatus === 'error'}
		class:dark:text-red-200={wsStatus === 'disconnected' || wsStatus === 'error'}
	>
		<span
			class="w-2 h-2 rounded-full"
			class:bg-green-500={wsStatus === 'connected'}
			class:bg-yellow-500={wsStatus === 'connecting' || wsStatus === 'reconnecting'}
			class:bg-red-500={wsStatus === 'disconnected' || wsStatus === 'error'}
			class:animate-pulse={wsStatus === 'connecting' || wsStatus === 'reconnecting'}
		></span>
		<span>
			{#if wsStatus === 'connected'}
				WS 已連線
			{:else if wsStatus === 'connecting'}
				WS 連線中...
			{:else if wsStatus === 'reconnecting'}
				WS 重連中...
			{:else if wsStatus === 'error'}
				WS 錯誤
			{:else}
				WS 離線
			{/if}
		</span>
	</div>
{/if}
