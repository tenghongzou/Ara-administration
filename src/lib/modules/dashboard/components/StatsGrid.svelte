<script lang="ts">
	import { StatCard } from '$lib/components/data-display';
	import type { DashboardStats } from '../types';
	import { dashboardService } from '../services/dashboard.service';

	interface Props {
		stats: DashboardStats | null;
	}

	let { stats }: Props = $props();
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<StatCard
		title="總使用者"
		value={stats ? dashboardService.formatNumber(stats.totalUsers) : '-'}
		variant="primary"
	>
		{#snippet icon()}
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
				/>
			</svg>
		{/snippet}
	</StatCard>

	<StatCard
		title="活躍用戶"
		value={stats ? dashboardService.formatNumber(stats.activeUsers) : '-'}
		change={stats?.activeUsersChange}
		variant="success"
	>
		{#snippet icon()}
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
				/>
			</svg>
		{/snippet}
	</StatCard>

	<StatCard
		title="本月新增"
		value={stats ? dashboardService.formatNumber(stats.newUsersThisMonth) : '-'}
		change={stats?.newUsersChange}
		variant="warning"
	>
		{#snippet icon()}
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
				/>
			</svg>
		{/snippet}
	</StatCard>

	<StatCard
		title="頁面瀏覽"
		value={stats ? dashboardService.formatNumber(stats.pageViews) : '-'}
		change={stats?.pageViewsChange}
		variant="default"
	>
		{#snippet icon()}
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
				/>
			</svg>
		{/snippet}
	</StatCard>
</div>
