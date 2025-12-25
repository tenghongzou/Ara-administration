<script lang="ts">
	import type { LoginSession } from '$lib/types';
	import { Card } from '$lib/components/ui';
	import { Monitor } from 'lucide-svelte';
	import SessionList from './SessionList.svelte';

	interface Props {
		sessions: LoginSession[];
		loading?: boolean;
		revokingId?: string | null;
		onRevoke: (sessionId: string) => void;
		onRevokeAll: () => void;
	}

	let { sessions, loading = false, revokingId = null, onRevoke, onRevokeAll }: Props = $props();
</script>

<Card variant="bordered">
	{#snippet header()}
		<div class="flex items-center gap-2">
			<Monitor class="w-5 h-5 text-gray-500" />
			<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">登入活動</h2>
		</div>
	{/snippet}
	{#snippet children()}
		<SessionList {sessions} {loading} {revokingId} {onRevoke} {onRevokeAll} />
	{/snippet}
</Card>
