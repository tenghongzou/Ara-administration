<script lang="ts">
	import { Spinner } from '$lib/components/ui';
	import type { NotificationSettings } from '$lib/types';
	import EmailNotificationSection from './EmailNotificationSection.svelte';
	import PushNotificationSection from './PushNotificationSection.svelte';
	import InAppNotificationSection from './InAppNotificationSection.svelte';
	import QuietHoursSection from './QuietHoursSection.svelte';
	import NotificationQuickLinks from './NotificationQuickLinks.svelte';
	import NotificationSettingsActions from './NotificationSettingsActions.svelte';

	interface Props {
		settings: NotificationSettings | null;
		loading?: boolean;
		saving?: boolean;
		hasChanges?: boolean;
		pushPermission?: NotificationPermission;
		onEmailToggleEnabled: () => void;
		onEmailToggle: (key: string, value: boolean) => void;
		onPushToggleEnabled: () => void;
		onPushToggle: (key: string, value: boolean) => void;
		onPushRequestPermission: () => void;
		onPushTest: () => void;
		onInAppToggleEnabled: () => void;
		onInAppToggle: (key: string, value: boolean) => void;
		onQuietHoursEdit: () => void;
		onSave: () => void;
	}

	let {
		settings,
		loading = false,
		saving = false,
		hasChanges = false,
		pushPermission = 'default',
		onEmailToggleEnabled,
		onEmailToggle,
		onPushToggleEnabled,
		onPushToggle,
		onPushRequestPermission,
		onPushTest,
		onInAppToggleEnabled,
		onInAppToggle,
		onQuietHoursEdit,
		onSave
	}: Props = $props();

	let s = $derived(settings as NotificationSettings);
</script>

{#if loading}
	<div class="flex justify-center py-12">
		<Spinner size="lg" />
	</div>
{:else if settings}
	<div class="max-w-3xl mx-auto space-y-6">
		<EmailNotificationSection
			settings={s.email}
			onToggleEnabled={onEmailToggleEnabled}
			onToggle={onEmailToggle}
		/>

		<PushNotificationSection
			settings={s.push}
			permission={pushPermission}
			onToggleEnabled={onPushToggleEnabled}
			onToggle={onPushToggle}
			onRequestPermission={onPushRequestPermission}
			onTestPush={onPushTest}
		/>

		<InAppNotificationSection
			settings={s.inApp}
			onToggleEnabled={onInAppToggleEnabled}
			onToggle={onInAppToggle}
		/>

		<QuietHoursSection settings={s.quietHours} onEdit={onQuietHoursEdit} />

		<NotificationQuickLinks />

		<NotificationSettingsActions {saving} {hasChanges} onSave={onSave} />
	</div>
{/if}
