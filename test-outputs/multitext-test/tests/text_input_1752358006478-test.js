const { test, expect } = require('@playwright/test');
const TextInput1752358006478Page = require('../pages/text_input_1752358006478-page');

test.describe('Text Input 1752358006478 Tests', () => {
  let textinput1752358006478Page;

  test.beforeEach(async ({ page }) => {
    textinput1752358006478Page = new TextInput1752358006478Page(page);
    await textinput1752358006478Page.navigate();
  });

  test('should load the application successfully', async () => {
    const isVisible = await textinput1752358006478Page.isApplicationVisible();
    expect(isVisible).toBe(true);
  });

  test('should handle user login', async ({ page }) => {
    await textinput1752358006478Page.enterCredentials('testuser@example.com', 'password123');
    await textinput1752358006478Page.clickButton('login');
    
    const isLoggedIn = await textinput1752358006478Page.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should handle user registration', async ({ page }) => {
    await textinput1752358006478Page.fillRegistrationForm({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'newpassword123'
    });
    await textinput1752358006478Page.clickButton('register');
    
    const successMessage = await textinput1752358006478Page.getSuccessMessage();
    expect(successMessage).toContain('registered');
  });

  test('should handle search functionality', async ({ page }) => {
    await textinput1752358006478Page.enterSearchCriteria('test search');
    await textinput1752358006478Page.clickButton('search');
    
    const hasResults = await textinput1752358006478Page.hasSearchResults();
    expect(hasResults).toBe(true);
  });

  test('should handle error scenarios', async ({ page }) => {
    // Test with invalid credentials
    await textinput1752358006478Page.enterCredentials('invalid@email.com', 'wrongpassword');
    await textinput1752358006478Page.clickButton('login');
    
    // Should remain on login page or show error
    const isLoggedIn = await textinput1752358006478Page.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot for debugging if test fails
    await textinput1752358006478Page.takeScreenshot(`test-${test.info().title}`);
  });
});
