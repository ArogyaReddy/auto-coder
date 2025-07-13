const { test, expect } = require('@playwright/test');
const SamplePlaywrightCodegenPage = require('../pages/sample-playwright-codegen-page');

test.describe('Sample Playwright Codegen Tests', () => {
  let sampleplaywrightcodegenPage;

  test.beforeEach(async ({ page }) => {
    sampleplaywrightcodegenPage = new SamplePlaywrightCodegenPage(page);
    await sampleplaywrightcodegenPage.navigate();
  });

  test('should load the application successfully', async () => {
    const isVisible = await sampleplaywrightcodegenPage.isApplicationVisible();
    expect(isVisible).toBe(true);
  });

  test('should handle user login', async ({ page }) => {
    await sampleplaywrightcodegenPage.enterCredentials('testuser@example.com', 'password123');
    await sampleplaywrightcodegenPage.clickButton('login');
    
    const isLoggedIn = await sampleplaywrightcodegenPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should handle user registration', async ({ page }) => {
    await sampleplaywrightcodegenPage.fillRegistrationForm({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'newpassword123'
    });
    await sampleplaywrightcodegenPage.clickButton('register');
    
    const successMessage = await sampleplaywrightcodegenPage.getSuccessMessage();
    expect(successMessage).toContain('registered');
  });

  test('should handle search functionality', async ({ page }) => {
    await sampleplaywrightcodegenPage.enterSearchCriteria('test search');
    await sampleplaywrightcodegenPage.clickButton('search');
    
    const hasResults = await sampleplaywrightcodegenPage.hasSearchResults();
    expect(hasResults).toBe(true);
  });

  test('should handle error scenarios', async ({ page }) => {
    // Test with invalid credentials
    await sampleplaywrightcodegenPage.enterCredentials('invalid@email.com', 'wrongpassword');
    await sampleplaywrightcodegenPage.clickButton('login');
    
    // Should remain on login page or show error
    const isLoggedIn = await sampleplaywrightcodegenPage.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot for debugging if test fails
    await sampleplaywrightcodegenPage.takeScreenshot(`test-${test.info().title}`);
  });
});
