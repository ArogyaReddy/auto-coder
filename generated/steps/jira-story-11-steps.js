const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const JiraStory11Page = require('../pages/jira-story-11-page');

// Step definitions for Jira Story 11
// Generated from feature file analysis
// Domain: web

setDefaultTimeout(30000);

let page;
let jiraStory11Page;

Before(async function () {
  // Initialize browser and page for each scenario
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  page = await context.newPage();
  jiraStory11Page = new JiraStory11Page(page);
  
  // Set up test data and environment
  this.testData = {
    timestamp: new Date().toISOString(),
    testId: Math.random().toString(36).substring(7)
  };
});

// Background steps
Given('the web application is running and I am logged in', async function () {
  // Background setup for web domain
  await jiraStory11Page.navigate();
  await jiraStory11Page.waitForLoad();
  
  // Domain-specific initialization
  await jiraStory11Page.verify('the page loads successfully');
  await jiraStory11Page.verify('the user interface is responsive');
  await jiraStory11Page.verify('all elements are visible');
});

// Generated step definitions
Given('the web application is running and I am logged in', async function () {
  // Setup: the web application is running and I am logged in
  await jiraStory11Page.setup('the web application is running and I am logged in');
  this.context = { step: 'the web application is running and I am logged in', domain: 'web' };
});

Given('the application is running and the user is authenticated', async function () {
  // Setup: the application is running and the user is authenticated
  await jiraStory11Page.setup('the application is running and the user is authenticated');
  this.context = { step: 'the application is running and the user is authenticated', domain: 'web' };
});

Given('the application is running', async function () {
  // Setup: the application is running
  await jiraStory11Page.setup('the application is running');
  this.context = { step: 'the application is running', domain: 'web' };
});

When('the user performs log in via my social media accounts', async function () {
  // Action: the user performs log in via my social media accounts
  await jiraStory11Page.perform('the user performs log in via my social media accounts');
  this.result = await jiraStory11Page.getLastActionResult();
});

When('the user attempts log in via my social media accounts but encounters an error', async function () {
  // Action: the user attempts log in via my social media accounts but encounters an error
  await jiraStory11Page.perform('the user attempts log in via my social media accounts but encounters an error');
  this.result = await jiraStory11Page.getLastActionResult();
});

When('the user performs choose my own username and password during registration', async function () {
  // Action: the user performs choose my own username and password during registration
  await jiraStory11Page.perform('the user performs choose my own username and password during registration');
  this.result = await jiraStory11Page.getLastActionResult();
});

When('the user attempts choose my own username and password during registration but encounters an error', async function () {
  // Action: the user attempts choose my own username and password during registration but encounters an error
  await jiraStory11Page.perform('the user attempts choose my own username and password during registration but encounters an error');
  this.result = await jiraStory11Page.getLastActionResult();
});

When('the user performs provide my basic information during registration, such as name and date of birth', async function () {
  // Action: the user performs provide my basic information during registration, such as name and date of birth
  await jiraStory11Page.perform('the user performs provide my basic information during registration, such as name and date of birth');
  this.result = await jiraStory11Page.getLastActionResult();
});

When('I check the system status', async function () {
  // Action: I check the system status
  await jiraStory11Page.perform('I check the system status');
  this.result = await jiraStory11Page.getLastActionResult();
});

Then('I can quickly access the platform without creating a new account', async function () {
  // Verification: I can quickly access the platform without creating a new account
  const result = await jiraStory11Page.verify('I can quickly access the platform without creating a new account');
  expect(result).toBe(true);
});

Then('the system handles the error gracefully and provides helpful feedback', async function () {
  // Verification: the system handles the error gracefully and provides helpful feedback
  const result = await jiraStory11Page.verify('the system handles the error gracefully and provides helpful feedback');
  expect(result).toBe(true);
});

Then('I can personalize my login credentials', async function () {
  // Verification: I can personalize my login credentials
  const result = await jiraStory11Page.verify('I can personalize my login credentials');
  expect(result).toBe(true);
});

Then('I can personalize my profile', async function () {
  // Verification: I can personalize my profile
  const result = await jiraStory11Page.verify('I can personalize my profile');
  expect(result).toBe(true);
});

Then('all required services should be operational', async function () {
  // Verification: all required services should be operational
  const result = await jiraStory11Page.verify('all required services should be operational');
  expect(result).toBe(true);
});

// Common steps
Given('the application is running', async function () {
  await jiraStory11Page.navigate();
  await jiraStory11Page.waitForLoad();
});

When('I check the system status', async function () {
  await jiraStory11Page.checkSystemHealth();
});

Then('all required services should be operational', async function () {
  const isHealthy = await jiraStory11Page.verifySystemHealth();
  expect(isHealthy).toBe(true);
});

Then('no critical errors should be present', async function () {
  const errors = await jiraStory11Page.getCriticalErrors();
  expect(errors).toHaveLength(0);
});

Then('the operation should be logged for audit purposes', async function () {
  const logs = await jiraStory11Page.getAuditLogs();
  expect(logs).toContain(this.testData.testId);
});

Then('the system should remain stable', async function () {
  const isStable = await jiraStory11Page.verifySystemStability();
  expect(isStable).toBe(true);
});

After(async function () {
  // Cleanup after each scenario
  if (page) {
    await page.screenshot({ 
      path: `reports/screenshots/${this.testData.testId}-${Date.now()}.png`,
      fullPage: true 
    });
    await page.close();
  }
});

module.exports = {};
