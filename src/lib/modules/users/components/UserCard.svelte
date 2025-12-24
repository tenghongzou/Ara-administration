<script lang="ts">
	import type { User } from '$lib/types';
	import { Card, Badge } from '$lib/components/ui';
	import { usersService } from '../services/users.service';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	const statusVariant = $derived(usersService.getStatusColor(user.status));
</script>

<Card variant="bordered">
	{#snippet children()}
		<div class="flex flex-col items-center text-center">
			<div
				class="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center mb-4"
			>
				{#if user.avatar}
					<img
						src={user.avatar}
						alt={user.name}
						class="w-24 h-24 rounded-full object-cover"
					/>
				{:else}
					<span class="text-3xl font-bold text-white">
						{usersService.getAvatarLetter(user.name)}
					</span>
				{/if}
			</div>
			<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.name}</h3>
			<p class="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
			<div class="mt-3">
				<Badge variant={statusVariant}>
					{#snippet children()}{usersService.getStatusLabel(user.status)}{/snippet}
				</Badge>
			</div>
		</div>

		<div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
			<div class="flex justify-between text-sm">
				<span class="text-gray-500 dark:text-gray-400">ID</span>
				<span class="text-gray-900 dark:text-gray-100 font-mono">{user.id}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-gray-500 dark:text-gray-400">角色</span>
				<span class="text-gray-900 dark:text-gray-100">{usersService.getRoleLabel(user.role)}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-gray-500 dark:text-gray-400">建立時間</span>
				<span class="text-gray-900 dark:text-gray-100">{usersService.formatDateTime(user.createdAt)}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-gray-500 dark:text-gray-400">最後登入</span>
				<span class="text-gray-900 dark:text-gray-100">{usersService.formatDateTime(user.lastLoginAt)}</span>
			</div>
		</div>
	{/snippet}
</Card>
