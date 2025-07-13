const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { chromium } = require('playwright');

// Page object import
const JiraStoryPage = require('../pages/jira-story-page');

let browser, context, page, jirastoryPage;

// Hooks
Given('I am on the {string} page', async function (pageName) {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
  jirastoryPage = new JiraStoryPage(page);
  
  await jirastoryPage.navigate();
});

When('I enter valid credentials', async function () {
  await jirastoryPage.enterCredentials('testuser@example.com', 'password123');
});

When('I click the {string} button', async function (buttonName) {
  await jirastoryPage.clickButton(buttonName);
});

When('I fill in the registration form', async function () {
  await jirastoryPage.fillRegistrationForm({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123'
  });
});

When('I enter search criteria', async function () {
  await jirastoryPage.enterSearchCriteria('test search');
});

When('I perform the {string} action', async function (action) {
  await jirastoryPage.performAction(action);
});

Then('I should be logged in successfully', async function () {
  const isLoggedIn = await jirastoryPage.isLoggedIn();
  expect(isLoggedIn).to.be.true;
});

Then('I should be registered successfully', async function () {
  const successMessage = await jirastoryPage.getSuccessMessage();
  expect(successMessage).to.include('registered');
});

Then('I should see search results', async function () {
  const hasResults = await jirastoryPage.hasSearchResults();
  expect(hasResults).to.be.true;
});

Then('I should see the application interface', async function () {
  const isVisible = await jirastoryPage.isApplicationVisible();
  expect(isVisible).to.be.true;
});

Then('the {string} should be completed successfully', async function (action) {
  const isCompleted = await jirastoryPage.isActionCompleted(action);
  expect(isCompleted).to.be.true;
});

// Cleanup
After(async function () {
  if (browser) {
    await browser.close();
  }
});
