<script lang="ts">
	import { config } from '$lib/constants';
	import { toast } from '$lib/stores/toast';
	import { currentUser } from '$lib/stores/auth';
	import { notificationApi } from '$lib/services';
	import { PageContainer } from '$lib/components/layout';
	import { Button, Card, Badge, Modal } from '$lib/components/ui';
	import { Toggle } from '$lib/components/forms';
	import type { NotificationSettings } from '$lib/types';

	let user = $derived($currentUser);

	// 設定狀態
	let settings = $state<NotificationSettings | null>(null);
	// Type-safe accessor for use in snippets (only used when settings is loaded)
	let s = $derived(settings as NotificationSettings);
	let loading = $state(true);
	let saving = $state(false);
	let hasChanges = $state(false);

	// 推播權限狀態
	let pushPermission = $state<NotificationPermission>('default');

	// 靜音時段 Modal
	let showQuietHoursModal = $state(false);
	let quietHoursForm = $state({
		enabled: false,
		startTime: '22:00',
		endTime: '08:00',
		allowUrgent: true
	});

	// 載入設定
	$effect(() => {
		if (user) {
			loadSettings();
			checkPushPermission();
		}
	});

	async function loadSettings() {
		if (!user) return;
		loading = true;
		try {
			settings = await notificationApi.getSettings(user.id);
			quietHoursForm = {
				enabled: s.quietHours.enabled,
				startTime: s.quietHours.startTime,
				endTime: s.quietHours.endTime,
				allowUrgent: s.quietHours.allowUrgent
			};
		} catch (error) {
			toast.error('載入設定失敗');
		} finally {
			loading = false;
		}
	}

	function checkPushPermission() {
		if ('Notification' in window) {
			pushPermission = Notification.permission;
		}
	}

	// 標記有變更
	function markChanged() {
		hasChanges = true;
	}

	// 儲存設定
	async function handleSave() {
		if (!user || !settings) return;

		saving = true;
		try {
			await notificationApi.updateSettings(user.id, settings);
			hasChanges = false;
			toast.success('通知設定已儲存');
		} catch (error) {
			toast.error('儲存失敗');
		} finally {
			saving = false;
		}
	}

	// 請求推播權限
	async function requestPushPermission() {
		if (!('Notification' in window)) {
			toast.error('此瀏覽器不支援推播通知');
			return;
		}

		try {
			const permission = await Notification.requestPermission();
			pushPermission = permission;

			if (permission === 'granted') {
				if (settings) {
					s.push.enabled = true;
					settings.push.permission = 'granted';
					markChanged();
				}
				toast.success('推播通知已啟用');
			} else if (permission === 'denied') {
				toast.error('推播權限被拒絕，請在瀏覽器設定中開啟');
			}
		} catch (error) {
			toast.error('無法取得推播權限');
		}
	}

	// 測試推播
	async function testPushNotification() {
		try {
			await notificationApi.testPushNotification();
			toast.success('測試通知已發送');
		} catch (error) {
			toast.error('發送失敗');
		}
	}

	// 開啟靜音時段設定
	function openQuietHoursModal() {
		if (settings) {
			quietHoursForm = {
				enabled: s.quietHours.enabled,
				startTime: s.quietHours.startTime,
				endTime: s.quietHours.endTime,
				allowUrgent: s.quietHours.allowUrgent
			};
		}
		showQuietHoursModal = true;
	}

	// 儲存靜音時段設定
	function saveQuietHours() {
		if (settings) {
			settings.quietHours = {
				...settings.quietHours,
				...quietHoursForm
			};
			markChanged();
		}
		showQuietHoursModal = false;
		toast.success('靜音時段已更新');
	}

	// 切換主開關
	function toggleEmailEnabled() {
		if (settings) {
			settings.email.enabled = !settings.email.enabled;
			markChanged();
		}
	}

	function togglePushEnabled() {
		if (settings && pushPermission === 'granted') {
			s.push.enabled = !s.push.enabled;
			markChanged();
		} else if (pushPermission !== 'granted') {
			requestPushPermission();
		}
	}

	function toggleInAppEnabled() {
		if (settings) {
			s.inApp.enabled = !s.inApp.enabled;
			markChanged();
		}
	}

	// 格式化靜音時段顯示
	let quietHoursDisplay = $derived(() => {
		if (!settings?.quietHours.enabled) return '未啟用';
		return `${s.quietHours.startTime} - ${s.quietHours.endTime}`;
	});
</script>

<svelte:head>
	<title>通知設定 - {config.appName}</title>
</svelte:head>

<PageContainer
	title="通知設定"
	description="管理您的通知偏好設定"
	backLink="/settings"
	backLabel="返回設定"
>
	{#if loading}
		<div class="flex justify-center py-12">
			<svg class="w-8 h-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		</div>
	{:else if settings}
		<div class="max-w-3xl mx-auto space-y-6">
			<!-- 電子郵件通知 -->
			<Card variant="bordered">
				{#snippet header()}
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
								<svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
							</div>
							<div>
								<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">電子郵件通知</h2>
								<p class="text-sm text-gray-500 dark:text-gray-400">選擇要透過電子郵件接收的通知</p>
							</div>
						</div>
						<Toggle
							checked={s.email.enabled}
							onchange={toggleEmailEnabled}
						/>
					</div>
				{/snippet}
				{#snippet children()}
					{#if s.email.enabled}
						<div class="space-y-4">
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">安全性警報</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">帳號安全相關通知（建議保持開啟）</p>
								</div>
								<Toggle
									checked={s.email.securityAlerts}
									onchange={() => { s.email.securityAlerts = !s.email.securityAlerts; markChanged(); }}
								/>
							</div>
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">登入通知</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">當您的帳號在新裝置登入時通知</p>
								</div>
								<Toggle
									checked={s.email.loginNotifications}
									onchange={() => { s.email.loginNotifications = !s.email.loginNotifications; markChanged(); }}
								/>
							</div>
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">系統更新</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">系統維護、功能更新等重要公告</p>
								</div>
								<Toggle
									checked={s.email.systemUpdates}
									onchange={() => { s.email.systemUpdates = !s.email.systemUpdates; markChanged(); }}
								/>
							</div>
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">訂閱提醒</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">訂閱到期、續約提醒</p>
								</div>
								<Toggle
									checked={s.email.subscriptionReminders}
									onchange={() => { s.email.subscriptionReminders = !s.email.subscriptionReminders; markChanged(); }}
								/>
							</div>
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">週報</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">每週系統使用報告摘要</p>
								</div>
								<Toggle
									checked={s.email.weeklyReport}
									onchange={() => { s.email.weeklyReport = !s.email.weeklyReport; markChanged(); }}
								/>
							</div>
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">產品資訊</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">新功能介紹、使用技巧等</p>
								</div>
								<Toggle
									checked={s.email.marketing}
									onchange={() => { s.email.marketing = !s.email.marketing; markChanged(); }}
								/>
							</div>
						</div>
					{:else}
						<div class="text-center py-4">
							<p class="text-sm text-gray-500 dark:text-gray-400">電子郵件通知已停用</p>
						</div>
					{/if}
				{/snippet}
			</Card>

			<!-- 推播通知 -->
			<Card variant="bordered">
				{#snippet header()}
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
								<svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
								</svg>
							</div>
							<div>
								<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">推播通知</h2>
								<p class="text-sm text-gray-500 dark:text-gray-400">在瀏覽器接收即時通知</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							{#if pushPermission === 'denied'}
								<Badge variant="error">權限被拒絕</Badge>
							{:else if pushPermission === 'granted'}
								<Toggle
									checked={s.push.enabled}
									onchange={togglePushEnabled}
								/>
							{:else}
								<Button variant="outline" size="sm" onclick={requestPushPermission}>
									{#snippet children()}啟用推播{/snippet}
								</Button>
							{/if}
						</div>
					</div>
				{/snippet}
				{#snippet children()}
					{#if pushPermission === 'denied'}
						<div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
							<p class="text-sm text-yellow-700 dark:text-yellow-300">
								推播權限已被拒絕。請在瀏覽器設定中重新啟用此網站的通知權限。
							</p>
						</div>
					{:else if pushPermission === 'granted' && s.push.enabled}
						<div class="space-y-4">
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">安全性警報</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">帳號安全相關即時通知</p>
								</div>
								<Toggle
									checked={s.push.securityAlerts}
									onchange={() => { s.push.securityAlerts = !s.push.securityAlerts; markChanged(); }}
								/>
							</div>
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">新裝置登入</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">當您的帳號在新裝置登入時通知</p>
								</div>
								<Toggle
									checked={s.push.loginNotifications}
									onchange={() => { s.push.loginNotifications = !s.push.loginNotifications; markChanged(); }}
								/>
							</div>
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">系統警報</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">緊急系統問題通知</p>
								</div>
								<Toggle
									checked={s.push.systemAlerts}
									onchange={() => { s.push.systemAlerts = !s.push.systemAlerts; markChanged(); }}
								/>
							</div>
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">提及通知</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">當有人提及您時通知</p>
								</div>
								<Toggle
									checked={s.push.mentions}
									onchange={() => { s.push.mentions = !s.push.mentions; markChanged(); }}
								/>
							</div>
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">訂閱提醒</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">訂閱到期提醒推播</p>
								</div>
								<Toggle
									checked={s.push.subscriptionReminders}
									onchange={() => { s.push.subscriptionReminders = !s.push.subscriptionReminders; markChanged(); }}
								/>
							</div>
							<div class="pt-2 border-t border-gray-200 dark:border-gray-700">
								<Button variant="outline" size="sm" onclick={testPushNotification}>
									{#snippet children()}
										<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
										</svg>
										發送測試通知
									{/snippet}
								</Button>
							</div>
						</div>
					{:else}
						<div class="text-center py-4">
							<p class="text-sm text-gray-500 dark:text-gray-400">
								{#if pushPermission === 'granted'}
									推播通知已停用
								{:else}
									推播通知尚未啟用。點擊上方按鈕以允許瀏覽器發送通知。
								{/if}
							</p>
						</div>
					{/if}
				{/snippet}
			</Card>

			<!-- 應用程式內通知 -->
			<Card variant="bordered">
				{#snippet header()}
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
								<svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
							</div>
							<div>
								<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">應用程式內通知</h2>
								<p class="text-sm text-gray-500 dark:text-gray-400">系統內通知顯示方式</p>
							</div>
						</div>
						<Toggle
							checked={s.inApp.enabled}
							onchange={toggleInAppEnabled}
						/>
					</div>
				{/snippet}
				{#snippet children()}
					{#if s.inApp.enabled}
						<div class="space-y-4">
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">顯示通知標記</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">在選單上顯示未讀通知數量</p>
								</div>
								<Toggle
									checked={s.inApp.showBadge}
									onchange={() => { s.inApp.showBadge = !s.inApp.showBadge; markChanged(); }}
								/>
							</div>
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">播放提示音</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">收到新通知時播放提示音</p>
								</div>
								<Toggle
									checked={s.inApp.playSound}
									onchange={() => { s.inApp.playSound = !s.inApp.playSound; markChanged(); }}
								/>
							</div>
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">彈出通知</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">在螢幕角落顯示通知訊息</p>
								</div>
								<Toggle
									checked={s.inApp.desktopPopup}
									onchange={() => { s.inApp.desktopPopup = !s.inApp.desktopPopup; markChanged(); }}
								/>
							</div>
							<div class="flex items-center justify-between py-2">
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">自動標記已讀</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">開啟通知列表時自動標記所有通知為已讀</p>
								</div>
								<Toggle
									checked={s.inApp.autoMarkRead}
									onchange={() => { s.inApp.autoMarkRead = !s.inApp.autoMarkRead; markChanged(); }}
								/>
							</div>
						</div>
					{:else}
						<div class="text-center py-4">
							<p class="text-sm text-gray-500 dark:text-gray-400">應用程式內通知已停用</p>
						</div>
					{/if}
				{/snippet}
			</Card>

			<!-- 靜音時段 -->
			<Card variant="bordered">
				{#snippet header()}
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
								<svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
								</svg>
							</div>
							<div>
								<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">靜音時段</h2>
								<p class="text-sm text-gray-500 dark:text-gray-400">在指定時間內暫停通知</p>
							</div>
						</div>
						{#if s.quietHours.enabled}
							<Badge variant="info">{quietHoursDisplay()}</Badge>
						{:else}
							<Badge variant="default">未啟用</Badge>
						{/if}
					</div>
				{/snippet}
				{#snippet children()}
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								{#if s.quietHours.enabled}
									在 {s.quietHours.startTime} 至 {s.quietHours.endTime} 期間暫停非緊急通知
									{#if s.quietHours.allowUrgent}
										<span class="text-gray-500">（緊急通知除外）</span>
									{/if}
								{:else}
									設定特定時間段內暫停接收通知
								{/if}
							</p>
						</div>
						<Button variant="outline" onclick={openQuietHoursModal}>
							{#snippet children()}
								{s.quietHours.enabled ? '編輯' : '設定'}
							{/snippet}
						</Button>
					</div>
				{/snippet}
			</Card>

			<!-- 快速連結 -->
			<Card variant="bordered">
				{#snippet children()}
					<div class="flex items-center justify-between">
						<div>
							<p class="font-medium text-gray-900 dark:text-gray-100">通知中心</p>
							<p class="text-sm text-gray-500 dark:text-gray-400">查看所有通知訊息</p>
						</div>
						<Button variant="outline" href="/notifications">
							{#snippet children()}
								前往通知中心
								<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							{/snippet}
						</Button>
					</div>
				{/snippet}
			</Card>

			<!-- 儲存按鈕 -->
			<div class="flex items-center justify-between">
				<div>
					{#if hasChanges}
						<p class="text-sm text-orange-600 dark:text-orange-400">
							有未儲存的變更
						</p>
					{/if}
				</div>
				<div class="flex gap-3">
					<Button variant="outline" href="/settings">
						{#snippet children()}取消{/snippet}
					</Button>
					<Button loading={saving} disabled={!hasChanges} onclick={handleSave}>
						{#snippet children()}儲存設定{/snippet}
					</Button>
				</div>
			</div>
		</div>
	{/if}
</PageContainer>

<!-- 靜音時段設定 Modal -->
<Modal open={showQuietHoursModal} onClose={() => showQuietHoursModal = false} title="靜音時段設定">
	{#snippet children()}
		<div class="space-y-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-900 dark:text-gray-100">啟用靜音時段</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">在指定時間內暫停通知</p>
				</div>
				<Toggle
					checked={quietHoursForm.enabled}
					onchange={() => quietHoursForm.enabled = !quietHoursForm.enabled}
				/>
			</div>

			{#if quietHoursForm.enabled}
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="start-time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
								開始時間
							</label>
							<input
								id="start-time"
								type="time"
								bind:value={quietHoursForm.startTime}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
							/>
						</div>
						<div>
							<label for="end-time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
								結束時間
							</label>
							<input
								id="end-time"
								type="time"
								bind:value={quietHoursForm.endTime}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
							/>
						</div>
					</div>

					<div class="flex items-center justify-between py-2">
						<div>
							<p class="text-sm font-medium text-gray-900 dark:text-gray-100">允許緊急通知</p>
							<p class="text-sm text-gray-500 dark:text-gray-400">安全性警報等緊急通知不受限制</p>
						</div>
						<Toggle
							checked={quietHoursForm.allowUrgent}
							onchange={() => quietHoursForm.allowUrgent = !quietHoursForm.allowUrgent}
						/>
					</div>

					<div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
						<p class="text-sm text-gray-600 dark:text-gray-400">
							在 <span class="font-medium">{quietHoursForm.startTime}</span> 到
							<span class="font-medium">{quietHoursForm.endTime}</span> 期間，
							{#if quietHoursForm.allowUrgent}
								只有緊急通知會發送。
							{:else}
								所有通知都會暫停。
							{/if}
						</p>
					</div>
				</div>
			{/if}

			<div class="flex justify-end gap-3 pt-2">
				<Button variant="ghost" onclick={() => showQuietHoursModal = false}>
					{#snippet children()}取消{/snippet}
				</Button>
				<Button onclick={saveQuietHours}>
					{#snippet children()}確定{/snippet}
				</Button>
			</div>
		</div>
	{/snippet}
</Modal>
