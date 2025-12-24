<script lang="ts">
	import { Card, Badge } from '$lib/components/ui';
	import { Bell, AlertTriangle, Clock, CreditCard } from 'lucide-svelte';
	import type { UpcomingReminder } from '$lib/services';
	import { dashboardService } from '../services/dashboard.service';

	interface Props {
		reminders: UpcomingReminder[];
		maxDisplay?: number;
	}

	let { reminders, maxDisplay = 5 }: Props = $props();

	const displayReminders = $derived(reminders.slice(0, maxDisplay));
	const remainingCount = $derived(reminders.length - maxDisplay);
</script>

{#if reminders.length > 0}
	<Card variant="bordered">
		{#snippet header()}
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Bell class="w-5 h-5 text-orange-500" />
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">訂閱到期提醒</h2>
					<Badge variant="warning">{reminders.length}</Badge>
				</div>
				<a
					href="/subscriptions"
					class="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]"
				>
					查看全部
				</a>
			</div>
		{/snippet}
		{#snippet children()}
			<div class="divide-y divide-gray-100 dark:divide-gray-800">
				{#each displayReminders as reminder}
					{@const badgeInfo = dashboardService.getReminderBadge(reminder.reminderType)}
					<a
						href="/subscriptions/{reminder.subscription.id}"
						class="flex items-center justify-between py-3 px-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-1 rounded-lg transition-colors"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
							>
								<CreditCard class="w-5 h-5 text-gray-500 dark:text-gray-400" />
							</div>
							<div>
								<p class="font-medium text-gray-900 dark:text-gray-100">
									{reminder.subscription.name}
								</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">
									{dashboardService.formatCurrency(reminder.subscription.cost, reminder.subscription.currency)}
									· {dashboardService.getDaysLabel(reminder.daysUntilBilling)}
								</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
							{#if reminder.reminderType === 'overdue'}
								<AlertTriangle class="w-4 h-4 text-red-500" />
							{:else if reminder.reminderType === 'due_today'}
								<Clock class="w-4 h-4 text-yellow-500" />
							{/if}
						</div>
					</a>
				{/each}
			</div>
			{#if remainingCount > 0}
				<div class="pt-3 text-center">
					<a
						href="/subscriptions"
						class="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]"
					>
						還有 {remainingCount} 個訂閱即將到期
					</a>
				</div>
			{/if}
		{/snippet}
	</Card>
{/if}
