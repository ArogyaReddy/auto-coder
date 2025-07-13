const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { chromium } = require('playwright');

// Page object import
const SamplePlaywrightCodegenPage = require('../pages/sample-playwright-codegen-page');

let browser, context, page, sampleplaywrightcodegenPage;

// Hooks
Given('I am on the {string} page', async function (pageName) {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
  sampleplaywrightcodegenPage = new SamplePlaywrightCodegenPage(page);
  
  await sampleplaywrightcodegenPage.navigate();
});

When('I enter valid credentials', async function () {
  await sampleplaywrightcodegenPage.enterCredentials('testuser@example.com', 'password123');
});

When('I click the {string} button', async function (buttonName) {
  await sampleplaywrightcodegenPage.clickButton(buttonName);
});

When('I fill in the registration form', async function () {
  await sampleplaywrightcodegenPage.fillRegistrationForm({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123'
  });
});

When('I enter search criteria', async function () {
  await sampleplaywrightcodegenPage.enterSearchCriteria('test search');
});

When('I perform the {string} action', async function (action) {
  await sampleplaywrightcodegenPage.performAction(action);
});

Then('I should be logged in successfully', async function () {
  const isLoggedIn = await sampleplaywrightcodegenPage.isLoggedIn();
  expect(isLoggedIn).to.be.true;
});

Then('I should be registered successfully', async function () {
  const successMessage = await sampleplaywrightcodegenPage.getSuccessMessage();
  expect(successMessage).to.include('registered');
});

Then('I should see search results', async function () {
  const hasResults = await sampleplaywrightcodegenPage.hasSearchResults();
  expect(hasResults).to.be.true;
});

Then('I should see the application interface', async function () {
  const isVisible = await sampleplaywrightcodegenPage.isApplicationVisible();
  expect(isVisible).to.be.true;
});

Then('the {string} should be completed successfully', async function (action) {
  const isCompleted = await sampleplaywrightcodegenPage.isActionCompleted(action);
  expect(isCompleted).to.be.true;
});

// Cleanup
After(async function () {
  if (browser) {
    await browser.close();
  }
});
