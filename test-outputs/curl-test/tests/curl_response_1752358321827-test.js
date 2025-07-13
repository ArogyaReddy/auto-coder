const { test, expect } = require('@playwright/test');
const CurlResponse1752358321827Page = require('../pages/curl_response_1752358321827-page');

test.describe('Curl Response 1752358321827 Tests', () => {
  let curlresponse1752358321827Page;

  test.beforeEach(async ({ page }) => {
    curlresponse1752358321827Page = new CurlResponse1752358321827Page(page);
    await curlresponse1752358321827Page.navigate();
  });

  test('should load the application successfully', async () => {
    const isVisible = await curlresponse1752358321827Page.isApplicationVisible();
    expect(isVisible).toBe(true);
  });

  test('should handle user login', async ({ page }) => {
    await curlresponse1752358321827Page.enterCredentials('testuser@example.com', 'password123');
    await curlresponse1752358321827Page.clickButton('login');
    
    const isLoggedIn = await curlresponse1752358321827Page.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should handle user registration', async ({ page }) => {
    await curlresponse1752358321827Page.fillRegistrationForm({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'newpassword123'
    });
    await curlresponse1752358321827Page.clickButton('register');
    
    const successMessage = await curlresponse1752358321827Page.getSuccessMessage();
    expect(successMessage).toContain('registered');
  });

  test('should handle search functionality', async ({ page }) => {
    await curlresponse1752358321827Page.enterSearchCriteria('test search');
    await curlresponse1752358321827Page.clickButton('search');
    
    const hasResults = await curlresponse1752358321827Page.hasSearchResults();
    expect(hasResults).toBe(true);
  });

  test('should handle error scenarios', async ({ page }) => {
    // Test with invalid credentials
    await curlresponse1752358321827Page.enterCredentials('invalid@email.com', 'wrongpassword');
    await curlresponse1752358321827Page.clickButton('login');
    
    // Should remain on login page or show error
    const isLoggedIn = await curlresponse1752358321827Page.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot for debugging if test fails
    await curlresponse1752358321827Page.takeScreenshot(`test-${test.info().title}`);
  });
});
