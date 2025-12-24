<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { ui } from '$lib/stores/ui';
	import { auth, currentUser, hasPermission } from '$lib/stores/auth';
	import { authApi } from '$lib/services';
	import { config } from '$lib/constants';
	import type { Permission } from '$lib/permissions';

	interface NavItem {
		label: string;
		href: string;
		icon?: string;
		badge?: string | number;
		permission?: Permission;
		children?: NavItem[];
	}

	interface Props {
		items: NavItem[];
		class?: string;
	}

	let { items, class: className = '' }: Props = $props();

	// Filter items based on permissions
	function filterByPermission(navItems: NavItem[]): NavItem[] {
		return navItems
			.filter((item) => !item.permission || hasPermission(item.permission))
			.map((item) => ({
				...item,
				children: item.children ? filterByPermission(item.children) : undefined
			}))
			.filter((item) => !item.children || item.children.length > 0);
	}

	let visibleItems = $derived(filterByPermission(items));

	let sidebarOpen = $state(true);
	let isMobile = $state(false);
	let user = $state<{ name: string; email: string; avatar?: string } | null>(null);
	let expandedMenus = $state<Set<string>>(new Set());
	let manuallyCollapsed = $state<Set<string>>(new Set());
	let lastPathname = $state('');

	ui.subscribe((state) => {
		sidebarOpen = state.sidebarOpen;
		isMobile = state.isMobile;
	});

	currentUser.subscribe((u) => (user = u));

	// Auto-expand menus with active children (only on route change, respect manual collapse)
	$effect(() => {
		const pathname = $page.url.pathname;
		// Only auto-expand when navigating to a new route
		if (pathname !== lastPathname) {
			lastPathname = pathname;
			let needsUpdate = false;
			visibleItems.forEach((item) => {
				if (item.children && hasActiveChild(item) && !expandedMenus.has(item.href) && !manuallyCollapsed.has(item.href)) {
					expandedMenus.add(item.href);
					needsUpdate = true;
				}
			});
			if (needsUpdate) {
				expandedMenus = new Set(expandedMenus);
			}
		}
	});

	async function handleLogout() {
		try {
			await authApi.logout();
		} catch {
			// Ignore logout errors
		}
		auth.logout();
		goto('/login');
	}

	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}

	function hasActiveChild(item: NavItem): boolean {
		if (!item.children) return false;
		return item.children.some((child) => isActive(child.href));
	}

	function isExpanded(href: string): boolean {
		return expandedMenus.has(href);
	}

	function toggleMenu(href: string) {
		if (expandedMenus.has(href)) {
			expandedMenus.delete(href);
			manuallyCollapsed.add(href);
			manuallyCollapsed = new Set(manuallyCollapsed);
		} else {
			expandedMenus.add(href);
			manuallyCollapsed.delete(href);
			manuallyCollapsed = new Set(manuallyCollapsed);
		}
		expandedMenus = new Set(expandedMenus);
	}

	function handleNavClick() {
		// Close sidebar on mobile after navigation
		if (isMobile) {
			ui.closeSidebar();
		}
	}

	function handleOverlayClick() {
		ui.closeSidebar();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && sidebarOpen && isMobile) {
			ui.closeSidebar();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Mobile overlay -->
{#if isMobile && sidebarOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-30 bg-black/50 lg:hidden transition-opacity duration-300"
		onclick={handleOverlayClick}
		aria-hidden="true"
	></div>
{/if}

<aside
	class={cn(
		'fixed left-0 top-0 z-40 h-screen w-64 flex flex-col',
		'bg-white dark:bg-gray-900',
		'border-r border-gray-200 dark:border-gray-700',
		'transition-transform duration-300 ease-in-out',
		// Mobile: slide in/out
		isMobile && !sidebarOpen && '-translate-x-full',
		isMobile && sidebarOpen && 'translate-x-0',
		// Desktop: always visible
		!isMobile && 'translate-x-0',
		className
	)}
	role="navigation"
	aria-label="主導覽選單"
	data-testid="sidebar"
>
	<div class="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
		<a href="/dashboard" class="flex items-center gap-2" onclick={handleNavClick}>
			<span class="text-xl font-bold text-[var(--color-primary-600)]">{config.appName}</span>
		</a>
		<!-- Mobile close button -->
		{#if isMobile}
			<button
				type="button"
				class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
				onclick={() => ui.closeSidebar()}
				aria-label="關閉選單"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>

	<div class="flex flex-col flex-1 overflow-hidden">
		<nav class="overflow-y-auto p-4 flex-1" aria-label="主選單" data-testid="sidebar-nav">
			<ul class="space-y-1" role="list">
				{#each visibleItems as item}
					<li>
						{#if item.children}
							<!-- Parent item with children: button to toggle -->
							<button
								type="button"
								onclick={() => toggleMenu(item.href)}
								class={cn(
									'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
									'transition-colors duration-200',
									isActive(item.href) || hasActiveChild(item)
										? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)]/20 dark:text-[var(--color-primary-400)]'
										: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
								)}
								aria-expanded={isExpanded(item.href)}
							>
								{#if item.icon}
									<span class="w-5 h-5" aria-hidden="true">{@html item.icon}</span>
								{/if}
								<span class="flex-1 text-left">{item.label}</span>
								{#if item.badge}
									<span
										class="px-2 py-0.5 text-xs font-medium bg-[var(--color-primary-100)] text-[var(--color-primary-700)] rounded-full"
										aria-label="{item.label} 有 {item.badge} 項"
									>
										{item.badge}
									</span>
								{/if}
								<!-- Chevron icon -->
								<svg
									class={cn(
										'w-4 h-4 transition-transform duration-200',
										isExpanded(item.href) && 'rotate-180'
									)}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							<!-- Collapsible children -->
							{#if isExpanded(item.href)}
								<ul class="mt-1 ml-8 space-y-1" role="list">
									{#each item.children as child}
										<li>
											<a
												href={child.href}
												onclick={handleNavClick}
												class={cn(
													'block px-3 py-1.5 rounded-md text-sm',
													'transition-colors duration-200',
													isActive(child.href)
														? 'text-[var(--color-primary-600)] font-medium'
														: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
												)}
												aria-current={isActive(child.href) ? 'page' : undefined}
											>
												{child.label}
											</a>
										</li>
									{/each}
								</ul>
							{/if}
						{:else}
							<!-- Regular nav item without children -->
							<a
								href={item.href}
								onclick={handleNavClick}
								class={cn(
									'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
									'transition-colors duration-200',
									isActive(item.href)
										? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)]/20 dark:text-[var(--color-primary-400)]'
										: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
								)}
								aria-current={isActive(item.href) ? 'page' : undefined}
							>
								{#if item.icon}
									<span class="w-5 h-5" aria-hidden="true">{@html item.icon}</span>
								{/if}
								<span class="flex-1">{item.label}</span>
								{#if item.badge}
									<span
										class="px-2 py-0.5 text-xs font-medium bg-[var(--color-primary-100)] text-[var(--color-primary-700)] rounded-full"
										aria-label="{item.label} 有 {item.badge} 項"
									>
										{item.badge}
									</span>
								{/if}
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>

		<!-- User profile section -->
		{#if user}
			<div class="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 mt-auto">
				<div class="flex items-center gap-3">
					<div
						class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0"
					>
						{#if user.avatar}
							<img src={user.avatar} alt={user.name} class="w-10 h-10 rounded-full object-cover" />
						{:else}
							<span class="text-sm font-medium text-gray-600 dark:text-gray-300">
								{user.name.charAt(0).toUpperCase()}
							</span>
						{/if}
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
						<p class="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
					</div>
					<button
						type="button"
						class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						onclick={handleLogout}
						aria-label="登出"
						data-testid="logout-button"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
					</button>
				</div>
			</div>
		{/if}
	</div>
</aside>
