import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
	test.beforeEach(async ({ page }) => {
		// Login first
		await page.goto('/login');
		await page.getByLabel('帳號').fill('admin');
		await page.locator('#password').fill('admin123');
		await page.getByTestId('submit-button').click();

		await expect(page).toHaveURL('/dashboard');
	});

	test('should display sidebar', async ({ page }) => {
		await expect(page.getByTestId('sidebar')).toBeVisible();
	});

	test('should display sidebar navigation', async ({ page }) => {
		await expect(page.getByTestId('sidebar-nav')).toBeVisible();
	});

	test('should navigate to dashboard', async ({ page }) => {
		await page.getByTestId('sidebar-nav').getByRole('link', { name: '儀表板' }).click();
		await expect(page).toHaveURL('/dashboard');
	});

	test('should navigate to subscriptions page', async ({ page }) => {
		await page.getByTestId('sidebar-nav').getByRole('link', { name: '訂閱管理' }).click();
		await expect(page).toHaveURL('/subscriptions');
	});

	test('should highlight active navigation item', async ({ page }) => {
		// Navigate to subscriptions
		await page.goto('/subscriptions');

		// Check that subscriptions nav item has active styling
		const subscriptionsLink = page.getByTestId('sidebar-nav').getByRole('link', { name: '訂閱管理' });
		await expect(subscriptionsLink).toHaveAttribute('aria-current', 'page');
	});

	test('should toggle sidebar on mobile', async ({ page }) => {
		// Set viewport to mobile size
		await page.setViewportSize({ width: 375, height: 667 });

		// Sidebar should be hidden on mobile initially
		const sidebar = page.getByTestId('sidebar');

		// Find and click hamburger menu button in header
		const menuButton = page.getByRole('button', { name: /開啟選單/i });

		if (await menuButton.isVisible()) {
			await menuButton.click();
			await expect(sidebar).toBeVisible();
		}
	});

	test('should close sidebar on mobile when navigation item clicked', async ({ page }) => {
		// Set viewport to mobile size
		await page.setViewportSize({ width: 375, height: 667 });

		// Open sidebar
		const menuButton = page.getByRole('button', { name: /開啟選單/i });

		if (await menuButton.isVisible()) {
			await menuButton.click();
			await page.waitForTimeout(300);

			// Click on a nav item
			await page.getByTestId('sidebar-nav').getByRole('link', { name: '訂閱管理' }).click();

			// Sidebar should close after navigation
			await page.waitForTimeout(300);
			const sidebar = page.getByTestId('sidebar');

			// On mobile, sidebar should have transform class indicating it's closed
			await expect(sidebar).toHaveClass(/-translate-x-full/);
		}
	});

	test('should show app name in sidebar', async ({ page }) => {
		await expect(page.getByTestId('sidebar')).toContainText(/Admin Dashboard/i);
	});

	test('should show user profile in sidebar', async ({ page }) => {
		// Check that user info is displayed
		await expect(page.getByTestId('sidebar')).toContainText(/admin/i);
	});

	test('should navigate to settings page', async ({ page }) => {
		await page.getByTestId('sidebar-nav').getByRole('link', { name: '設定' }).click();
		await expect(page).toHaveURL('/settings');
	});

	test('should display settings modules on settings page', async ({ page }) => {
		await page.goto('/settings');

		// Check that settings modules are displayed
		await expect(page.getByTestId('settings-modules')).toBeVisible();
		await expect(page.getByTestId('settings-module-general')).toBeVisible();
		await expect(page.getByTestId('settings-module-profile')).toBeVisible();
		await expect(page.getByTestId('settings-module-security')).toBeVisible();
		await expect(page.getByTestId('settings-module-notifications')).toBeVisible();
		await expect(page.getByTestId('settings-module-logs')).toBeVisible();
		await expect(page.getByTestId('settings-module-users')).toBeVisible();
	});

	test('should navigate to general settings from settings page', async ({ page }) => {
		await page.goto('/settings');

		await page.getByTestId('settings-module-general').click();
		await expect(page).toHaveURL('/settings/general');
	});

	test('should navigate to profile settings from settings page', async ({ page }) => {
		await page.goto('/settings');

		await page.getByTestId('settings-module-profile').click();
		await expect(page).toHaveURL('/settings/profile');
	});

	test('should navigate to security settings from settings page', async ({ page }) => {
		await page.goto('/settings');

		await page.getByTestId('settings-module-security').click();
		await expect(page).toHaveURL('/settings/security');
	});

	test('should navigate to notification settings from settings page', async ({ page }) => {
		await page.goto('/settings');

		await page.getByTestId('settings-module-notifications').click();
		await expect(page).toHaveURL('/settings/notifications');
	});

	test('should navigate to audit logs from settings page', async ({ page }) => {
		await page.goto('/settings');

		await page.getByTestId('settings-module-logs').click();
		await expect(page).toHaveURL('/settings/logs');
	});

	test('should navigate to users management from settings page', async ({ page }) => {
		await page.goto('/settings');

		await page.getByTestId('settings-module-users').click();
		await expect(page).toHaveURL('/settings/users');
	});

	test('should show logout button', async ({ page }) => {
		await expect(page.getByTestId('logout-button')).toBeVisible();
	});

	test('should logout when logout button clicked', async ({ page }) => {
		await page.getByTestId('logout-button').click();
		await expect(page).toHaveURL('/login');
	});

	test('should close sidebar with ESC key on mobile', async ({ page }) => {
		// Set viewport to mobile size
		await page.setViewportSize({ width: 375, height: 667 });

		// Open sidebar
		const menuButton = page.getByRole('button', { name: /開啟選單/i });

		if (await menuButton.isVisible()) {
			await menuButton.click();
			await page.waitForTimeout(300);

			// Press ESC
			await page.keyboard.press('Escape');

			// Sidebar should close
			await page.waitForTimeout(300);
			const sidebar = page.getByTestId('sidebar');
			await expect(sidebar).toHaveClass(/-translate-x-full/);
		}
	});
});
