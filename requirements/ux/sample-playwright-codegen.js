const { test, expect } = require('@playwright/test');

test('test login flow', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.click('[data-testid="email-input"]');
  await page.fill('[data-testid="email-input"]', 'user@example.com');
  await page.click('[data-testid="password-input"]');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
});

test('test registration flow', async ({ page }) => {
  await page.goto('https://example.com/register');
  await page.fill('[data-testid="name-input"]', 'John Doe');
  await page.fill('[data-testid="email-input"]', 'john@example.com');
  await page.fill('[data-testid="password-input"]', 'newpassword123');
  await page.click('[data-testid="register-button"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
