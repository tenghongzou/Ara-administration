import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
	});

	test('should display login page', async ({ page }) => {
		await expect(page.getByRole('heading', { name: '登入' })).toBeVisible();
		await expect(page.getByTestId('login-form')).toBeVisible();
		await expect(page.getByLabel('帳號')).toBeVisible();
		await expect(page.locator('#password')).toBeVisible();
	});

	test('should show error for invalid credentials', async ({ page }) => {
		await page.getByLabel('帳號').fill('invalid@example.com');
		await page.locator('#password').fill('wrongpassword');
		await page.getByTestId('submit-button').click();

		await expect(page.getByTestId('login-error')).toBeVisible();
	});

	test('should login with email', async ({ page }) => {
		await page.getByLabel('帳號').fill('admin@example.com');
		await page.locator('#password').fill('admin123');
		await page.getByTestId('submit-button').click();

		// Should redirect to dashboard after successful login
		await expect(page).toHaveURL('/dashboard');
	});

	test('should login with username', async ({ page }) => {
		await page.getByLabel('帳號').fill('admin');
		await page.locator('#password').fill('admin123');
		await page.getByTestId('submit-button').click();

		// Should redirect to dashboard after successful login
		await expect(page).toHaveURL('/dashboard');
	});

	test('should show loading state during login', async ({ page }) => {
		await page.getByLabel('帳號').fill('admin@example.com');
		await page.locator('#password').fill('admin123');

		// Click and immediately check for loading state
		const submitButton = page.getByTestId('submit-button');
		await submitButton.click();

		// Check that button shows loading text or is disabled
		await expect(submitButton.getByRole('button')).toBeDisabled();
	});

	test('should redirect to dashboard if already authenticated', async ({ page }) => {
		// Login first
		await page.getByLabel('帳號').fill('admin@example.com');
		await page.locator('#password').fill('admin123');
		await page.getByTestId('submit-button').click();

		await expect(page).toHaveURL('/dashboard');

		// Try to navigate to login page
		await page.goto('/login');

		// Should redirect back to dashboard
		await expect(page).toHaveURL('/dashboard');
	});

	test('should logout successfully', async ({ page }) => {
		// Login first
		await page.getByLabel('帳號').fill('admin@example.com');
		await page.locator('#password').fill('admin123');
		await page.getByTestId('submit-button').click();

		await expect(page).toHaveURL('/dashboard');

		// Click logout button
		await page.getByTestId('logout-button').click();

		// Should redirect to login page
		await expect(page).toHaveURL('/login');
	});

	test('should require account field', async ({ page }) => {
		await page.locator('#password').fill('password123');
		await page.getByTestId('submit-button').click();

		// Check that account field is required
		const accountInput = page.getByLabel('帳號');
		await expect(accountInput).toHaveAttribute('required');
	});

	test('should require password field', async ({ page }) => {
		await page.getByLabel('帳號').fill('test@example.com');
		await page.getByTestId('submit-button').click();

		// Check that password field is required
		const passwordInput = page.locator('#password');
		await expect(passwordInput).toHaveAttribute('required');
	});

	test('should protect dashboard route', async ({ page }) => {
		// Try to access dashboard without login
		await page.goto('/dashboard');

		// Should redirect to login page
		await expect(page).toHaveURL('/login');
	});

	test('should protect users route', async ({ page }) => {
		// Try to access users page without login
		await page.goto('/settings/users');

		// Should redirect to login page
		await expect(page).toHaveURL('/login');
	});
});
