const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { chromium } = require('playwright');

// Page object import
const TextInput1752357997567Page = require('../pages/text_input_1752357997567-page');

let browser, context, page, textinput1752357997567Page;

// Hooks
Given('I am on the {string} page', async function (pageName) {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
  textinput1752357997567Page = new TextInput1752357997567Page(page);
  
  await textinput1752357997567Page.navigate();
});

When('I enter valid credentials', async function () {
  await textinput1752357997567Page.enterCredentials('testuser@example.com', 'password123');
});

When('I click the {string} button', async function (buttonName) {
  await textinput1752357997567Page.clickButton(buttonName);
});

When('I fill in the registration form', async function () {
  await textinput1752357997567Page.fillRegistrationForm({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123'
  });
});

When('I enter search criteria', async function () {
  await textinput1752357997567Page.enterSearchCriteria('test search');
});

When('I perform the {string} action', async function (action) {
  await textinput1752357997567Page.performAction(action);
});

Then('I should be logged in successfully', async function () {
  const isLoggedIn = await textinput1752357997567Page.isLoggedIn();
  expect(isLoggedIn).to.be.true;
});

Then('I should be registered successfully', async function () {
  const successMessage = await textinput1752357997567Page.getSuccessMessage();
  expect(successMessage).to.include('registered');
});

Then('I should see search results', async function () {
  const hasResults = await textinput1752357997567Page.hasSearchResults();
  expect(hasResults).to.be.true;
});

Then('I should see the application interface', async function () {
  const isVisible = await textinput1752357997567Page.isApplicationVisible();
  expect(isVisible).to.be.true;
});

Then('the {string} should be completed successfully', async function (action) {
  const isCompleted = await textinput1752357997567Page.isActionCompleted(action);
  expect(isCompleted).to.be.true;
});

// Cleanup
After(async function () {
  if (browser) {
    await browser.close();
  }
});
