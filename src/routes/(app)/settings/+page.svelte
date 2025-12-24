<script lang="ts">
	import { config } from '$lib/constants';
	import { PageContainer } from '$lib/components/layout';
	import { hasPermission } from '$lib/stores/auth';
	import { defaultSettingsModules } from '$lib/modules/settings';

	// Filter modules based on user permissions
	let modules = $derived(
		defaultSettingsModules.filter((m) => !m.permission || hasPermission(m.permission))
	);
</script>

<svelte:head>
	<title>設定 - {config.appName}</title>
</svelte:head>

<PageContainer title="設定" description="管理您的帳號設定和偏好">
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="settings-modules">
		{#each modules as module}
			<a
				href={module.href}
				class="group block p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[var(--color-primary-300)] dark:hover:border-[var(--color-primary-700)] hover:shadow-lg transition-all duration-200"
				data-testid="settings-module-{module.href.split('/').pop()}"
			>
				<div class="flex items-start gap-4">
					<div class={`w-12 h-12 rounded-xl ${module.iconBgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
						<svg class={`w-6 h-6 ${module.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{@html module.icon}
						</svg>
					</div>
					<div class="flex-1 min-w-0">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[var(--color-primary-600)] dark:group-hover:text-[var(--color-primary-400)] transition-colors">
							{module.title}
						</h3>
						<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{module.description}
						</p>
					</div>
					<div class="flex-shrink-0 text-gray-400 group-hover:text-[var(--color-primary-500)] group-hover:translate-x-1 transition-all duration-200">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</div>
			</a>
		{/each}
	</div>
</PageContainer>
