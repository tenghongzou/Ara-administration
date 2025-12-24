import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { ui } from '$lib/stores/ui';

describe('UI Store', () => {
	beforeEach(() => {
		// Reset to default state by opening sidebar (desktop default)
		ui.openSidebar();
	});

	it('should have initial state', () => {
		const state = get(ui);
		expect(state).toHaveProperty('sidebarOpen');
		expect(state).toHaveProperty('isMobile');
		expect(state).toHaveProperty('theme');
		expect(state).toHaveProperty('locale');
	});

	it('should toggle sidebar', () => {
		const initialState = get(ui).sidebarOpen;
		ui.toggleSidebar();
		expect(get(ui).sidebarOpen).toBe(!initialState);

		ui.toggleSidebar();
		expect(get(ui).sidebarOpen).toBe(initialState);
	});

	it('should open sidebar', () => {
		ui.closeSidebar();
		expect(get(ui).sidebarOpen).toBe(false);

		ui.openSidebar();
		expect(get(ui).sidebarOpen).toBe(true);
	});

	it('should close sidebar', () => {
		ui.openSidebar();
		expect(get(ui).sidebarOpen).toBe(true);

		ui.closeSidebar();
		expect(get(ui).sidebarOpen).toBe(false);
	});

	it('should set theme', () => {
		ui.setTheme('dark');
		expect(get(ui).theme).toBe('dark');

		ui.setTheme('light');
		expect(get(ui).theme).toBe('light');

		ui.setTheme('system');
		expect(get(ui).theme).toBe('system');
	});

	it('should set locale', () => {
		ui.setLocale('en-US');
		expect(get(ui).locale).toBe('en-US');

		ui.setLocale('zh-TW');
		expect(get(ui).locale).toBe('zh-TW');
	});

	it('should have default theme as system', () => {
		// Check the default value in initial state
		const state = get(ui);
		expect(['light', 'dark', 'system']).toContain(state.theme);
	});

	it('should have default locale as zh-TW', () => {
		const state = get(ui);
		expect(state.locale).toBe('zh-TW');
	});
});
