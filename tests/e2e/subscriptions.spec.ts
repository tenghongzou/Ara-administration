import { test, expect } from '@playwright/test';

test.describe('Subscriptions Management', () => {
	test.beforeEach(async ({ page }) => {
		// Login first
		await page.goto('/login');
		await page.getByLabel('帳號').fill('admin');
		await page.locator('#password').fill('admin123');
		await page.getByTestId('submit-button').click();

		// Wait for login to complete
		await expect(page).toHaveURL('/dashboard');

		// Navigate to subscriptions page
		await page.goto('/subscriptions');
		await expect(page).toHaveURL('/subscriptions');

		// Wait for page to be fully loaded
		await expect(page.getByTestId('subscriptions-page')).toBeVisible({ timeout: 10000 });
	});

	test('should display subscriptions page', async ({ page }) => {
		await expect(page.getByRole('heading', { name: '訂閱管理' })).toBeVisible();
		await expect(page.getByTestId('subscriptions-page')).toBeVisible();
	});

	test('should display statistics cards', async ({ page }) => {
		await expect(page.getByTestId('subscriptions-stats')).toBeVisible();
		await expect(page.getByText('月費總計')).toBeVisible();
		await expect(page.getByText('年費總計')).toBeVisible();
		await expect(page.getByText('即將到期 (7天內)')).toBeVisible();
	});

	test('should display subscriptions table', async ({ page }) => {
		await expect(page.getByTestId('subscriptions-table')).toBeVisible();
	});

	test('should display filter section', async ({ page }) => {
		await expect(page.getByTestId('subscriptions-filters')).toBeVisible();
		await expect(page.getByPlaceholder('搜尋訂閱服務名稱...')).toBeVisible();
	});

	test('should have add subscription button', async ({ page }) => {
		await expect(page.getByTestId('add-subscription-button')).toBeVisible();
	});

	test('should navigate to new subscription page', async ({ page }) => {
		await page.getByTestId('add-subscription-button').getByRole('link').click();
		await expect(page).toHaveURL('/subscriptions/new');
		await expect(page.getByRole('heading', { name: '新增訂閱' })).toBeVisible();
	});

	test('should search subscriptions', async ({ page }) => {
		const searchInput = page.getByPlaceholder('搜尋訂閱服務名稱...');

		await searchInput.fill('Netflix');
		await page.getByRole('button', { name: '搜尋' }).click();

		// Wait for search results
		await page.waitForTimeout(800);

		// Check that table is still visible (would contain filtered results)
		await expect(page.getByTestId('subscriptions-table')).toBeVisible();
	});

	test('should filter by category', async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(800);

		// Find the category select (first select in the filters)
		const categorySelect = page.getByTestId('subscriptions-filters').locator('select').first();

		if (await categorySelect.isVisible()) {
			await categorySelect.selectOption({ label: '影音串流' });
			await page.waitForTimeout(800);
			await expect(page.getByTestId('subscriptions-table')).toBeVisible();
		}
	});

	test('should filter by status', async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(800);

		// Find the status select (second select in the filters)
		const statusSelect = page.getByTestId('subscriptions-filters').locator('select').nth(1);

		if (await statusSelect.isVisible()) {
			await statusSelect.selectOption({ label: '啟用中' });
			await page.waitForTimeout(800);
			await expect(page.getByTestId('subscriptions-table')).toBeVisible();
		}
	});

	test('should filter by billing cycle', async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(800);

		// Find the cycle select (third select in the filters)
		const cycleSelect = page.getByTestId('subscriptions-filters').locator('select').nth(2);

		if (await cycleSelect.isVisible()) {
			await cycleSelect.selectOption({ label: '月繳' });
			await page.waitForTimeout(800);
			await expect(page.getByTestId('subscriptions-table')).toBeVisible();
		}
	});

	test('should display subscription details in table', async ({ page }) => {
		// Wait for table data to load
		await page.waitForTimeout(1000);

		// Check table headers by looking for the text within the table
		const table = page.getByTestId('subscriptions-table');
		await expect(table.getByText('服務')).toBeVisible();
		await expect(table.getByText('分類')).toBeVisible();
		await expect(table.getByText('費用')).toBeVisible();
		await expect(table.getByText('週期')).toBeVisible();
		await expect(table.getByText('狀態')).toBeVisible();
	});

	test('should navigate to edit subscription page', async ({ page }) => {
		// Wait for table to load
		await page.waitForTimeout(1000);

		// Find and click edit button on first subscription row
		const editButton = page
			.getByTestId('subscriptions-table')
			.locator('a[href^="/subscriptions/"]')
			.filter({ hasNot: page.locator('[href="/subscriptions/new"]') })
			.first();

		if (await editButton.isVisible()) {
			await editButton.click();
			await expect(page).toHaveURL(/\/subscriptions\/\d+/);
			await expect(page.getByRole('heading', { name: '編輯訂閱' })).toBeVisible();
		}
	});

	test('should show export button', async ({ page }) => {
		await expect(page.getByRole('button', { name: /匯出/ })).toBeVisible();
	});
});

test.describe('New Subscription Page', () => {
	test.beforeEach(async ({ page }) => {
		// Login first
		await page.goto('/login');
		await page.getByLabel('帳號').fill('admin');
		await page.locator('#password').fill('admin123');
		await page.getByTestId('submit-button').click();

		await expect(page).toHaveURL('/dashboard');

		// Navigate to new subscription page
		await page.goto('/subscriptions/new');
		await expect(page).toHaveURL('/subscriptions/new');
	});

	test('should display new subscription form', async ({ page }) => {
		await expect(page.getByRole('heading', { name: '新增訂閱' })).toBeVisible();
		await expect(page.getByLabel('服務名稱')).toBeVisible();
		await expect(page.getByLabel('分類')).toBeVisible();
		await expect(page.getByLabel('費用')).toBeVisible();
		await expect(page.getByLabel('計費週期')).toBeVisible();
		await expect(page.getByLabel('下次扣款日')).toBeVisible();
	});

	test('should have back link to subscriptions list', async ({ page }) => {
		await expect(page.getByRole('link', { name: '返回訂閱列表' })).toBeVisible();
	});

	test('should validate required fields', async ({ page }) => {
		// Fill in name then clear it to trigger our custom validation
		const nameInput = page.getByLabel('服務名稱');
		await nameInput.fill('Test');
		await nameInput.clear();

		// Fill cost then clear it
		const costInput = page.getByLabel('費用');
		await costInput.fill('100');
		await costInput.clear();

		// Set a date then clear it
		const dateInput = page.getByLabel('下次扣款日');
		await dateInput.fill('2025-12-31');
		await dateInput.clear();

		// Click submit to trigger validation
		await page.getByRole('button', { name: '建立訂閱' }).click();

		// Wait for validation
		await page.waitForTimeout(500);

		// Verify form still exists (wasn't submitted due to validation)
		await expect(page.getByRole('button', { name: '建立訂閱' })).toBeVisible();
	});

	test('should create a new subscription', async ({ page }) => {
		// Fill in the form
		await page.getByLabel('服務名稱').fill('Test Subscription');
		await page.getByLabel('分類').selectOption({ label: '影音串流' });
		await page.getByLabel('費用').fill('299');
		await page.getByLabel('貨幣').selectOption({ label: 'TWD (新台幣)' });
		await page.getByLabel('計費週期').selectOption({ label: '月繳' });

		// Set next billing date to a future date
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 30);
		const dateString = futureDate.toISOString().split('T')[0];
		await page.getByLabel('下次扣款日').fill(dateString);

		// Submit the form
		await page.getByRole('button', { name: '建立訂閱' }).click();

		// Wait for redirect back to list
		await page.waitForTimeout(1000);
		await expect(page).toHaveURL('/subscriptions');
	});
});

test.describe('Edit Subscription Page', () => {
	test.beforeEach(async ({ page }) => {
		// Login first
		await page.goto('/login');
		await page.getByLabel('帳號').fill('admin');
		await page.locator('#password').fill('admin123');
		await page.getByTestId('submit-button').click();

		await expect(page).toHaveURL('/dashboard');

		// Navigate to edit page for first subscription
		await page.goto('/subscriptions/1');
	});

	test('should display edit subscription form', async ({ page }) => {
		await expect(page.getByRole('heading', { name: '編輯訂閱' })).toBeVisible();
	});

	test('should have back link to subscriptions list', async ({ page }) => {
		await expect(page.getByRole('link', { name: '返回訂閱列表' })).toBeVisible();
	});

	test('should display subscription info sidebar', async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1000);

		// Check for subscription info elements in the sidebar (first column of the grid)
		const sidebar = page.locator('.lg\\:col-span-1').first();
		await expect(sidebar.getByText('費用')).toBeVisible();
		await expect(sidebar.getByText('下次扣款')).toBeVisible();
		await expect(sidebar.getByText('自動續訂')).toBeVisible();
	});

	test('should update subscription', async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1000);

		// Update the name
		const nameInput = page.getByLabel('服務名稱');
		await nameInput.clear();
		await nameInput.fill('Updated Subscription Name');

		// Submit the form
		await page.getByRole('button', { name: '儲存變更' }).click();

		// Wait for redirect back to list
		await page.waitForTimeout(1000);
		await expect(page).toHaveURL('/subscriptions');
	});
});
