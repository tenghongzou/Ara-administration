<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { passwordService } from '../services/password.service';

	interface Props {
		passwordChangedAt?: string;
		onChangePassword: () => void;
	}

	let { passwordChangedAt, onChangePassword }: Props = $props();

	const description = $derived(passwordService.getPasswordChangeDescription(passwordChangedAt));
</script>

<Card variant="bordered">
	{#snippet header()}
		<div class="flex items-center gap-2">
			<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
				/>
			</svg>
			<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">密碼</h2>
		</div>
	{/snippet}
	{#snippet children()}
		<div class="flex items-center justify-between">
			<div>
				<p class="text-sm text-gray-900 dark:text-gray-100">登入密碼</p>
				<p class="text-sm text-gray-500 dark:text-gray-400">{description}</p>
			</div>
			<Button variant="outline" onclick={onChangePassword}>
				{#snippet children()}變更密碼{/snippet}
			</Button>
		</div>
	{/snippet}
</Card>
