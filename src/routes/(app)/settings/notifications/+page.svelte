<script lang="ts">
	import { config } from '$lib/constants';
	import { toast } from '$lib/stores/toast';
	import { currentUser } from '$lib/stores/auth';
	import { notificationSettings } from '$lib/stores/notification-settings';
	import { notificationApi, pushNotificationService } from '$lib/services';
	import { PageContainer } from '$lib/components/layout';
	import type { NotificationSettings } from '$lib/types';
	import {
		NotificationSettingsContent,
		QuietHoursModal,
		type QuietHoursSettings
	} from '$lib/modules/settings';

	let user = $derived($currentUser);

	// 設定狀態
	let settings = $state<NotificationSettings | null>(null);
	let s = $derived(settings as NotificationSettings);
	let loading = $state(true);
	let saving = $state(false);
	let hasChanges = $state(false);

	// 推播權限狀態
	let pushPermission = $state<NotificationPermission>('default');

	// 靜音時段 Modal
	let showQuietHoursModal = $state(false);

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
			settings = await notificationApi.getSettings();
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

	function markChanged() {
		hasChanges = true;
	}

	async function handleSave() {
		if (!user || !settings) return;

		saving = true;
		try {
			const updatedSettings = await notificationApi.updateSettings(settings);
			// 同步到客戶端 store，讓即時推送服務使用最新設定
			notificationSettings.set(updatedSettings);
			hasChanges = false;
			toast.success('通知設定已儲存');
		} catch (error) {
			toast.error('儲存失敗');
		} finally {
			saving = false;
		}
	}

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

	async function testPushNotification() {
		try {
			// 使用即時推送服務發送測試通知
			pushNotificationService.push({
				type: 'info',
				title: '測試通知',
				message: '這是一則測試推播通知，用於確認通知功能正常運作。',
				urgent: false
			});
			toast.success('測試通知已發送');
		} catch (error) {
			toast.error('發送失敗');
		}
	}

	// Toggle handlers
	function toggleEmailEnabled() {
		if (settings) {
			settings.email.enabled = !settings.email.enabled;
			markChanged();
		}
	}

	function handleEmailToggle(key: string, value: boolean) {
		if (settings) {
			(settings.email as unknown as Record<string, unknown>)[key] = value;
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

	function handlePushToggle(key: string, value: boolean) {
		if (settings) {
			(settings.push as unknown as Record<string, unknown>)[key] = value;
			markChanged();
		}
	}

	function toggleInAppEnabled() {
		if (settings) {
			s.inApp.enabled = !s.inApp.enabled;
			markChanged();
		}
	}

	function handleInAppToggle(key: string, value: boolean) {
		if (settings) {
			(settings.inApp as unknown as Record<string, unknown>)[key] = value;
			markChanged();
		}
	}

	function handleQuietHoursSave(newSettings: QuietHoursSettings) {
		if (settings) {
			settings.quietHours = { ...settings.quietHours, ...newSettings };
			markChanged();
		}
		showQuietHoursModal = false;
		toast.success('靜音時段已更新');
	}
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
	<NotificationSettingsContent
		{settings}
		{loading}
		{saving}
		{hasChanges}
		{pushPermission}
		onEmailToggleEnabled={toggleEmailEnabled}
		onEmailToggle={handleEmailToggle}
		onPushToggleEnabled={togglePushEnabled}
		onPushToggle={handlePushToggle}
		onPushRequestPermission={requestPushPermission}
		onPushTest={testPushNotification}
		onInAppToggleEnabled={toggleInAppEnabled}
		onInAppToggle={handleInAppToggle}
		onQuietHoursEdit={() => (showQuietHoursModal = true)}
		onSave={handleSave}
	/>
</PageContainer>

<QuietHoursModal
	bind:open={showQuietHoursModal}
	settings={settings?.quietHours ?? { enabled: false, startTime: '22:00', endTime: '08:00', allowUrgent: true }}
	onClose={() => (showQuietHoursModal = false)}
	onSave={handleQuietHoursSave}
/>
