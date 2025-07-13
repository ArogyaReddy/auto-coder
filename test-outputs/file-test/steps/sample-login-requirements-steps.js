const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { chromium } = require('playwright');

// Page object import
const SampleLoginRequirementsPage = require('../pages/sample-login-requirements-page');

let browser, context, page, sampleloginrequirementsPage;

// Hooks
Given('I am on the {string} page', async function (pageName) {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
  sampleloginrequirementsPage = new SampleLoginRequirementsPage(page);
  
  await sampleloginrequirementsPage.navigate();
});

When('I enter valid credentials', async function () {
  await sampleloginrequirementsPage.enterCredentials('testuser@example.com', 'password123');
});

When('I click the {string} button', async function (buttonName) {
  await sampleloginrequirementsPage.clickButton(buttonName);
});

When('I fill in the registration form', async function () {
  await sampleloginrequirementsPage.fillRegistrationForm({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123'
  });
});

When('I enter search criteria', async function () {
  await sampleloginrequirementsPage.enterSearchCriteria('test search');
});

When('I perform the {string} action', async function (action) {
  await sampleloginrequirementsPage.performAction(action);
});

Then('I should be logged in successfully', async function () {
  const isLoggedIn = await sampleloginrequirementsPage.isLoggedIn();
  expect(isLoggedIn).to.be.true;
});

Then('I should be registered successfully', async function () {
  const successMessage = await sampleloginrequirementsPage.getSuccessMessage();
  expect(successMessage).to.include('registered');
});

Then('I should see search results', async function () {
  const hasResults = await sampleloginrequirementsPage.hasSearchResults();
  expect(hasResults).to.be.true;
});

Then('I should see the application interface', async function () {
  const isVisible = await sampleloginrequirementsPage.isApplicationVisible();
  expect(isVisible).to.be.true;
});

Then('the {string} should be completed successfully', async function (action) {
  const isCompleted = await sampleloginrequirementsPage.isActionCompleted(action);
  expect(isCompleted).to.be.true;
});

// Cleanup
After(async function () {
  if (browser) {
    await browser.close();
  }
});
