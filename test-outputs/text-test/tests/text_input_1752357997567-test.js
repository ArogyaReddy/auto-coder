const { test, expect } = require('@playwright/test');
const TextInput1752357997567Page = require('../pages/text_input_1752357997567-page');

test.describe('Text Input 1752357997567 Tests', () => {
  let textinput1752357997567Page;

  test.beforeEach(async ({ page }) => {
    textinput1752357997567Page = new TextInput1752357997567Page(page);
    await textinput1752357997567Page.navigate();
  });

  test('should load the application successfully', async () => {
    const isVisible = await textinput1752357997567Page.isApplicationVisible();
    expect(isVisible).toBe(true);
  });

  test('should handle user login', async ({ page }) => {
    await textinput1752357997567Page.enterCredentials('testuser@example.com', 'password123');
    await textinput1752357997567Page.clickButton('login');
    
    const isLoggedIn = await textinput1752357997567Page.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should handle user registration', async ({ page }) => {
    await textinput1752357997567Page.fillRegistrationForm({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'newpassword123'
    });
    await textinput1752357997567Page.clickButton('register');
    
    const successMessage = await textinput1752357997567Page.getSuccessMessage();
    expect(successMessage).toContain('registered');
  });

  test('should handle search functionality', async ({ page }) => {
    await textinput1752357997567Page.enterSearchCriteria('test search');
    await textinput1752357997567Page.clickButton('search');
    
    const hasResults = await textinput1752357997567Page.hasSearchResults();
    expect(hasResults).toBe(true);
  });

  test('should handle error scenarios', async ({ page }) => {
    // Test with invalid credentials
    await textinput1752357997567Page.enterCredentials('invalid@email.com', 'wrongpassword');
    await textinput1752357997567Page.clickButton('login');
    
    // Should remain on login page or show error
    const isLoggedIn = await textinput1752357997567Page.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot for debugging if test fails
    await textinput1752357997567Page.takeScreenshot(`test-${test.info().title}`);
  });
});
