<script lang="ts">
	import { goto, afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Sidebar, Header } from '$lib/components/layout';
	import { Toast, Spinner } from '$lib/components/ui';
	import { auth, isAuthenticated, isAuthInitialized, hasAnyPermission, currentUser } from '$lib/stores/auth';
	import { getRoutePermissions } from '$lib/permissions';
	import { toast } from '$lib/stores/toast';
	import { notificationSettings } from '$lib/stores/notification-settings';
	import { websocket, initWebSocket, closeWebSocket, notificationApi, pushNotificationService, sessionTimeout } from '$lib/services';
	import { notifications } from '$lib/stores/notifications';
	import type { Notification } from '$lib/stores/notifications';
	import { moduleRegistry } from '$lib/modules';

	let { children } = $props();

	// 從模組系統取得導航配置
	const navItems = moduleRegistry.getNavigation();

	// 使用 $derived 響應式追蹤 store 值（Svelte 5 正確方式）
	let authenticated = $derived($isAuthenticated);
	let initialized = $derived($isAuthInitialized);

	// websocket.status 是嵌套 store，需要用 $effect 訂閱
	let wsStatus = $state<string>('disconnected');
	$effect(() => {
		const unsubscribe = websocket.status.subscribe((value) => {
			wsStatus = value;
		});
		return unsubscribe;
	});

	// Route permission guard: 在導航完成後檢查權限
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

	// Route guard: redirect to login if not authenticated
	$effect(() => {
		if (browser && initialized && !authenticated) {
			goto('/login');
		}
	});

	// Initialize auth on mount
	$effect(() => {
		if (browser && !initialized) {
			auth.initialize();
		}
	});

	// Session timeout 管理
	$effect(() => {
		if (!browser || !initialized) return;

		if (authenticated) {
			// 已認證：啟動 session timeout 監控
			sessionTimeout.start();
			return () => {
				sessionTimeout.stop();
			};
		} else {
			// 未認證：停止監控
			sessionTimeout.stop();
		}
	});

	// 載入通知設定
	$effect(() => {
		if (!browser || !initialized || !authenticated) return;

		const user = $currentUser;
		if (!user) return;

		// 從 API 載入使用者通知設定並同步到 store
		notificationApi.getSettings(user.id).then((settings) => {
			notificationSettings.set(settings);
			// 預載音效資源
			pushNotificationService.preloadSounds();
		});
	});

	// WebSocket 連線管理
	$effect(() => {
		if (!browser || !initialized) return;

		if (authenticated) {
			// 已認證：建立 WebSocket 連線
			const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
			initWebSocket(wsUrl);

			// 訂閱 WebSocket 事件
			const unsubscribeConnected = websocket.on('connected', () => {
				console.log('[App] WebSocket connected');
				// 連線成功後可請求歷史通知
				websocket.send({
					type: 'notifications:fetch',
					payload: { limit: 50 }
				});
			});

			const unsubscribeDisconnected = websocket.on('disconnected', (payload) => {
				console.log('[App] WebSocket disconnected:', payload);
			});

			// 處理從伺服器取得的歷史通知
			const unsubscribeNotificationsList = websocket.on<{ items: Notification[] }>(
				'notifications:list',
				(payload) => {
					notifications.setItems(payload.items);
				}
			);

			// 處理通知已讀同步
			const unsubscribeNotificationRead = websocket.on<{ id: string }>(
				'notification:read',
				(payload) => {
					notifications.markAsRead(payload.id);
				}
			);

			// Cleanup：取消訂閱並關閉連線
			return () => {
				unsubscribeConnected();
				unsubscribeDisconnected();
				unsubscribeNotificationsList();
				unsubscribeNotificationRead();
				closeWebSocket();
			};
		} else {
			// 未認證：確保關閉連線並重設設定
			closeWebSocket();
			notifications.reset();
			notificationSettings.reset();
		}
	});

</script>

{#if !initialized}
	<!-- Loading state while checking auth -->
	<div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
		<div class="flex flex-col items-center gap-3">
			<Spinner size="lg" />
			<p class="text-gray-500 dark:text-gray-400">載入中...</p>
		</div>
	</div>
{:else if authenticated}
	<div class="h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 flex flex-col">
		<Sidebar items={navItems} />
		<Header />

		<main class="lg:ml-64 pt-16 flex-1 overflow-hidden flex flex-col">
			<div class="flex-1 overflow-auto min-h-0">
				{@render children()}
			</div>
		</main>

		<Toast />

		<!-- WebSocket 連線狀態指示器 (僅開發環境顯示) -->
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
	</div>
{/if}
