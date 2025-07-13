const { test, expect } = require('@playwright/test');
const JiraStoryPage = require('../pages/jira-story-page');

test.describe('Jira Story Tests', () => {
  let jirastoryPage;

  test.beforeEach(async ({ page }) => {
    jirastoryPage = new JiraStoryPage(page);
    await jirastoryPage.navigate();
  });

  test('should load the application successfully', async () => {
    const isVisible = await jirastoryPage.isApplicationVisible();
    expect(isVisible).toBe(true);
  });

  test('should handle user login', async ({ page }) => {
    await jirastoryPage.enterCredentials('testuser@example.com', 'password123');
    await jirastoryPage.clickButton('login');
    
    const isLoggedIn = await jirastoryPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should handle user registration', async ({ page }) => {
    await jirastoryPage.fillRegistrationForm({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'newpassword123'
    });
    await jirastoryPage.clickButton('register');
    
    const successMessage = await jirastoryPage.getSuccessMessage();
    expect(successMessage).toContain('registered');
  });

  test('should handle search functionality', async ({ page }) => {
    await jirastoryPage.enterSearchCriteria('test search');
    await jirastoryPage.clickButton('search');
    
    const hasResults = await jirastoryPage.hasSearchResults();
    expect(hasResults).toBe(true);
  });

  test('should handle error scenarios', async ({ page }) => {
    // Test with invalid credentials
    await jirastoryPage.enterCredentials('invalid@email.com', 'wrongpassword');
    await jirastoryPage.clickButton('login');
    
    // Should remain on login page or show error
    const isLoggedIn = await jirastoryPage.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot for debugging if test fails
    await jirastoryPage.takeScreenshot(`test-${test.info().title}`);
  });
});
