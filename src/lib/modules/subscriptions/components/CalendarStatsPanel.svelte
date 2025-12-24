<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { CreditCard, Calendar } from 'lucide-svelte';
	import type { CalendarStats as CalendarStatsType } from '../types';
	import { subscriptionsService } from '../services/subscriptions.service';

	interface Props {
		stats: CalendarStatsType;
	}

	let { stats }: Props = $props();
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	<Card variant="bordered" class="p-4">
		<div class="flex items-center gap-3">
			<div
				class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
			>
				<CreditCard class="w-5 h-5 text-blue-600 dark:text-blue-400" />
			</div>
			<div>
				<p class="text-sm text-gray-500 dark:text-gray-400">本月預估支出</p>
				<p class="text-xl font-semibold text-gray-900 dark:text-gray-100">
					{subscriptionsService.formatCurrency(stats.monthlyTotal)}
				</p>
			</div>
		</div>
	</Card>

	<Card variant="bordered" class="p-4">
		<div class="flex items-center gap-3">
			<div
				class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
			>
				<Calendar class="w-5 h-5 text-green-600 dark:text-green-400" />
			</div>
			<div>
				<p class="text-sm text-gray-500 dark:text-gray-400">扣款次數</p>
				<p class="text-xl font-semibold text-gray-900 dark:text-gray-100">
					{stats.monthlyCount} 次
				</p>
			</div>
		</div>
	</Card>

	<Card variant="bordered" class="p-4">
		<div class="flex items-center gap-3">
			<div
				class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"
			>
				<Calendar class="w-5 h-5 text-purple-600 dark:text-purple-400" />
			</div>
			<div>
				<p class="text-sm text-gray-500 dark:text-gray-400">有扣款日期</p>
				<p class="text-xl font-semibold text-gray-900 dark:text-gray-100">
					{stats.daysWithPayments} 天
				</p>
			</div>
		</div>
	</Card>
</div>
