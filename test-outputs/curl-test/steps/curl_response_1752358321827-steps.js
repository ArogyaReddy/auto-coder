const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { chromium } = require('playwright');

// Page object import
const CurlResponse1752358321827Page = require('../pages/curl_response_1752358321827-page');

let browser, context, page, curlresponse1752358321827Page;

// Hooks
Given('I am on the {string} page', async function (pageName) {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
  curlresponse1752358321827Page = new CurlResponse1752358321827Page(page);
  
  await curlresponse1752358321827Page.navigate();
});

When('I enter valid credentials', async function () {
  await curlresponse1752358321827Page.enterCredentials('testuser@example.com', 'password123');
});

When('I click the {string} button', async function (buttonName) {
  await curlresponse1752358321827Page.clickButton(buttonName);
});

When('I fill in the registration form', async function () {
  await curlresponse1752358321827Page.fillRegistrationForm({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123'
  });
});

When('I enter search criteria', async function () {
  await curlresponse1752358321827Page.enterSearchCriteria('test search');
});

When('I perform the {string} action', async function (action) {
  await curlresponse1752358321827Page.performAction(action);
});

Then('I should be logged in successfully', async function () {
  const isLoggedIn = await curlresponse1752358321827Page.isLoggedIn();
  expect(isLoggedIn).to.be.true;
});

Then('I should be registered successfully', async function () {
  const successMessage = await curlresponse1752358321827Page.getSuccessMessage();
  expect(successMessage).to.include('registered');
});

Then('I should see search results', async function () {
  const hasResults = await curlresponse1752358321827Page.hasSearchResults();
  expect(hasResults).to.be.true;
});

Then('I should see the application interface', async function () {
  const isVisible = await curlresponse1752358321827Page.isApplicationVisible();
  expect(isVisible).to.be.true;
});

Then('the {string} should be completed successfully', async function (action) {
  const isCompleted = await curlresponse1752358321827Page.isActionCompleted(action);
  expect(isCompleted).to.be.true;
});

// Cleanup
After(async function () {
  if (browser) {
    await browser.close();
  }
});
