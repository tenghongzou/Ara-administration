<script lang="ts">
	import { Button, Badge, Spinner } from '$lib/components/ui';
	import { sessionService } from '../services/session.service';
	import type { LoginSession } from '$lib/types';

	interface Props {
		sessions: LoginSession[];
		loading?: boolean;
		revokingId?: string | null;
		onRevoke: (sessionId: string) => void;
		onRevokeAll: () => void;
	}

	let {
		sessions,
		loading = false,
		revokingId = null,
		onRevoke,
		onRevokeAll
	}: Props = $props();

	const hasOtherSessions = $derived(sessions.filter((s) => !s.isCurrent).length > 0);
</script>

<div class="space-y-4">
	{#if hasOtherSessions}
		<div class="flex justify-end">
			<Button variant="ghost" size="sm" onclick={onRevokeAll}>
				{#snippet children()}登出所有其他裝置{/snippet}
			</Button>
		</div>
	{/if}

	{#if loading}
		<div class="flex justify-center py-8">
			<Spinner size="md" />
		</div>
	{:else if sessions.length === 0}
		<p class="text-center text-gray-500 dark:text-gray-400 py-4">沒有登入活動記錄</p>
	{:else}
		<div class="divide-y divide-gray-200 dark:divide-gray-700">
			{#each sessions as session}
				{@const deviceInfo = sessionService.getDeviceInfo(session.device)}
				<div class="flex items-center justify-between py-4 first:pt-0 last:pb-0">
					<div class="flex items-center gap-4">
						<div
							class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
						>
							<svg
								class="w-5 h-5 text-gray-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								{@html deviceInfo.icon}
							</svg>
						</div>
						<div>
							<p
								class="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2"
							>
								{session.device} - {session.browser}
								{#if session.isCurrent}
									<Badge variant="info" size="sm">目前</Badge>
								{/if}
							</p>
							<p class="text-sm text-gray-500 dark:text-gray-400">
								{sessionService.getLocationDescription(session)}
							</p>
						</div>
					</div>
					{#if !session.isCurrent}
						<Button
							variant="ghost"
							size="sm"
							loading={revokingId === session.id}
							onclick={() => onRevoke(session.id)}
						>
							{#snippet children()}登出{/snippet}
						</Button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
