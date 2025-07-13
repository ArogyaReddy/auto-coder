const { test, expect } = require('@playwright/test');
const HttpbinOrgPage = require('../pages/httpbin_org-page');

test.describe('Httpbin Org Tests', () => {
  let httpbinorgPage;

  test.beforeEach(async ({ page }) => {
    httpbinorgPage = new HttpbinOrgPage(page);
    await httpbinorgPage.navigate();
  });

  test('should load the application successfully', async () => {
    const isVisible = await httpbinorgPage.isApplicationVisible();
    expect(isVisible).toBe(true);
  });

  test('should handle user login', async ({ page }) => {
    await httpbinorgPage.enterCredentials('testuser@example.com', 'password123');
    await httpbinorgPage.clickButton('login');
    
    const isLoggedIn = await httpbinorgPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should handle user registration', async ({ page }) => {
    await httpbinorgPage.fillRegistrationForm({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'newpassword123'
    });
    await httpbinorgPage.clickButton('register');
    
    const successMessage = await httpbinorgPage.getSuccessMessage();
    expect(successMessage).toContain('registered');
  });

  test('should handle search functionality', async ({ page }) => {
    await httpbinorgPage.enterSearchCriteria('test search');
    await httpbinorgPage.clickButton('search');
    
    const hasResults = await httpbinorgPage.hasSearchResults();
    expect(hasResults).toBe(true);
  });

  test('should handle error scenarios', async ({ page }) => {
    // Test with invalid credentials
    await httpbinorgPage.enterCredentials('invalid@email.com', 'wrongpassword');
    await httpbinorgPage.clickButton('login');
    
    // Should remain on login page or show error
    const isLoggedIn = await httpbinorgPage.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot for debugging if test fails
    await httpbinorgPage.takeScreenshot(`test-${test.info().title}`);
  });
});
