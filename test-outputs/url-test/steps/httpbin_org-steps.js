const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { chromium } = require('playwright');

// Page object import
const HttpbinOrgPage = require('../pages/httpbin_org-page');

let browser, context, page, httpbinorgPage;

// Hooks
Given('I am on the {string} page', async function (pageName) {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
  httpbinorgPage = new HttpbinOrgPage(page);
  
  await httpbinorgPage.navigate();
});

When('I enter valid credentials', async function () {
  await httpbinorgPage.enterCredentials('testuser@example.com', 'password123');
});

When('I click the {string} button', async function (buttonName) {
  await httpbinorgPage.clickButton(buttonName);
});

When('I fill in the registration form', async function () {
  await httpbinorgPage.fillRegistrationForm({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123'
  });
});

When('I enter search criteria', async function () {
  await httpbinorgPage.enterSearchCriteria('test search');
});

When('I perform the {string} action', async function (action) {
  await httpbinorgPage.performAction(action);
});

Then('I should be logged in successfully', async function () {
  const isLoggedIn = await httpbinorgPage.isLoggedIn();
  expect(isLoggedIn).to.be.true;
});

Then('I should be registered successfully', async function () {
  const successMessage = await httpbinorgPage.getSuccessMessage();
  expect(successMessage).to.include('registered');
});

Then('I should see search results', async function () {
  const hasResults = await httpbinorgPage.hasSearchResults();
  expect(hasResults).to.be.true;
});

Then('I should see the application interface', async function () {
  const isVisible = await httpbinorgPage.isApplicationVisible();
  expect(isVisible).to.be.true;
});

Then('the {string} should be completed successfully', async function (action) {
  const isCompleted = await httpbinorgPage.isActionCompleted(action);
  expect(isCompleted).to.be.true;
});

// Cleanup
After(async function () {
  if (browser) {
    await browser.close();
  }
});
