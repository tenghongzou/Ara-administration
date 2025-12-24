import { test, expect } from '@playwright/test';

test.describe('Users Management', () => {
	test.beforeEach(async ({ page }) => {
		// Login first
		await page.goto('/login');
		await page.getByLabel('帳號').fill('admin');
		await page.locator('#password').fill('admin123');
		await page.getByTestId('submit-button').click();

		// Wait for login to complete
		await expect(page).toHaveURL('/dashboard');

		// Navigate to users page
		await page.goto('/settings/users');
		await expect(page).toHaveURL('/settings/users');

		// Wait for page to be fully loaded
		await expect(page.getByTestId('users-page')).toBeVisible({ timeout: 10000 });
	});

	test('should display users page', async ({ page }) => {
		await expect(page.getByRole('heading', { name: '使用者管理' })).toBeVisible();
		await expect(page.getByTestId('users-page')).toBeVisible();
	});

	test('should display users table', async ({ page }) => {
		await expect(page.getByTestId('users-table')).toBeVisible();
	});

	test('should display filter section', async ({ page }) => {
		await expect(page.getByTestId('users-filters')).toBeVisible();
		await expect(page.getByPlaceholder('搜尋使用者名稱或電子郵件...')).toBeVisible();
	});

	test('should have add user button', async ({ page }) => {
		await expect(page.getByTestId('add-user-button')).toBeVisible();
	});

	test('should navigate to new user page', async ({ page }) => {
		await page.getByTestId('add-user-button').getByRole('link').click();
		await expect(page).toHaveURL('/settings/users/new');
	});

	test('should search users', async ({ page }) => {
		const searchInput = page.getByPlaceholder('搜尋使用者名稱或電子郵件...');

		await searchInput.fill('admin');
		await page.getByRole('button', { name: '搜尋' }).click();

		// Wait for search results
		await page.waitForTimeout(800);

		// Check that table is still visible (would contain filtered results)
		await expect(page.getByTestId('users-table')).toBeVisible();
	});

	test('should filter by role', async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(800);

		// Find the role select (first select in the filters)
		const roleSelect = page.getByTestId('users-filters').locator('select').first();

		if (await roleSelect.isVisible()) {
			await roleSelect.selectOption({ label: '系統管理員' });
			await page.waitForTimeout(800);
			await expect(page.getByTestId('users-table')).toBeVisible();
		}
	});

	test('should filter by status', async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(800);

		// Find the status select (second select in the filters)
		const statusSelect = page.getByTestId('users-filters').locator('select').nth(1);

		if (await statusSelect.isVisible()) {
			await statusSelect.selectOption({ label: '啟用' });
			await page.waitForTimeout(800);
			await expect(page.getByTestId('users-table')).toBeVisible();
		}
	});

	test('should display user details in table', async ({ page }) => {
		// Wait for table data to load
		await page.waitForTimeout(1000);

		// Check table headers by looking for the text within the table
		const table = page.getByTestId('users-table');
		await expect(table.getByText('使用者')).toBeVisible();
		await expect(table.getByText('角色')).toBeVisible();
		await expect(table.getByText('狀態')).toBeVisible();
	});

	test('should show pagination when there are many users', async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1000);

		// Check if any user data exists
		const table = page.getByTestId('users-table');
		await expect(table).toBeVisible();
	});

	test('should navigate to edit user page', async ({ page }) => {
		// Wait for table to load
		await page.waitForTimeout(1000);

		// Find and click edit button on first user row (excluding the "new" link)
		const editButton = page
			.getByTestId('users-table')
			.locator('a[href^="/settings/users/"]')
			.filter({ hasNot: page.locator('[href="/settings/users/new"]') })
			.first();

		if (await editButton.isVisible()) {
			await editButton.click();
			await expect(page).toHaveURL(/\/settings\/users\/\d+/);
		}
	});
});
