const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { chromium } = require('playwright');

// Page object import
const TextInput1752358006478Page = require('../pages/text_input_1752358006478-page');

let browser, context, page, textinput1752358006478Page;

// Hooks
Given('I am on the {string} page', async function (pageName) {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
  textinput1752358006478Page = new TextInput1752358006478Page(page);
  
  await textinput1752358006478Page.navigate();
});

When('I enter valid credentials', async function () {
  await textinput1752358006478Page.enterCredentials('testuser@example.com', 'password123');
});

When('I click the {string} button', async function (buttonName) {
  await textinput1752358006478Page.clickButton(buttonName);
});

When('I fill in the registration form', async function () {
  await textinput1752358006478Page.fillRegistrationForm({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123'
  });
});

When('I enter search criteria', async function () {
  await textinput1752358006478Page.enterSearchCriteria('test search');
});

When('I perform the {string} action', async function (action) {
  await textinput1752358006478Page.performAction(action);
});

Then('I should be logged in successfully', async function () {
  const isLoggedIn = await textinput1752358006478Page.isLoggedIn();
  expect(isLoggedIn).to.be.true;
});

Then('I should be registered successfully', async function () {
  const successMessage = await textinput1752358006478Page.getSuccessMessage();
  expect(successMessage).to.include('registered');
});

Then('I should see search results', async function () {
  const hasResults = await textinput1752358006478Page.hasSearchResults();
  expect(hasResults).to.be.true;
});

Then('I should see the application interface', async function () {
  const isVisible = await textinput1752358006478Page.isApplicationVisible();
  expect(isVisible).to.be.true;
});

Then('the {string} should be completed successfully', async function (action) {
  const isCompleted = await textinput1752358006478Page.isActionCompleted(action);
  expect(isCompleted).to.be.true;
});

// Cleanup
After(async function () {
  if (browser) {
    await browser.close();
  }
});
