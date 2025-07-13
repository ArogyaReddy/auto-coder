const { test, expect } = require('@playwright/test');
const SampleLoginRequirementsPage = require('../pages/sample-login-requirements-page');

test.describe('Sample Login Requirements Tests', () => {
  let sampleloginrequirementsPage;

  test.beforeEach(async ({ page }) => {
    sampleloginrequirementsPage = new SampleLoginRequirementsPage(page);
    await sampleloginrequirementsPage.navigate();
  });

  test('should load the application successfully', async () => {
    const isVisible = await sampleloginrequirementsPage.isApplicationVisible();
    expect(isVisible).toBe(true);
  });

  test('should handle user login', async ({ page }) => {
    await sampleloginrequirementsPage.enterCredentials('testuser@example.com', 'password123');
    await sampleloginrequirementsPage.clickButton('login');
    
    const isLoggedIn = await sampleloginrequirementsPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should handle user registration', async ({ page }) => {
    await sampleloginrequirementsPage.fillRegistrationForm({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'newpassword123'
    });
    await sampleloginrequirementsPage.clickButton('register');
    
    const successMessage = await sampleloginrequirementsPage.getSuccessMessage();
    expect(successMessage).toContain('registered');
  });

  test('should handle search functionality', async ({ page }) => {
    await sampleloginrequirementsPage.enterSearchCriteria('test search');
    await sampleloginrequirementsPage.clickButton('search');
    
    const hasResults = await sampleloginrequirementsPage.hasSearchResults();
    expect(hasResults).toBe(true);
  });

  test('should handle error scenarios', async ({ page }) => {
    // Test with invalid credentials
    await sampleloginrequirementsPage.enterCredentials('invalid@email.com', 'wrongpassword');
    await sampleloginrequirementsPage.clickButton('login');
    
    // Should remain on login page or show error
    const isLoggedIn = await sampleloginrequirementsPage.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot for debugging if test fails
    await sampleloginrequirementsPage.takeScreenshot(`test-${test.info().title}`);
  });
});
