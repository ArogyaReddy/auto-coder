const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const JiraStory10Page = require('../pages/jira-story-10-page');

// Step definitions for Jira Story 10
// Generated from feature file analysis
// Domain: general

setDefaultTimeout(30000);

let page;
let jiraStory10Page;

Before(async function () {
  // Initialize browser and page for each scenario
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  page = await context.newPage();
  jiraStory10Page = new JiraStory10Page(page);
  
  // Set up test data and environment
  this.testData = {
    timestamp: new Date().toISOString(),
    testId: Math.random().toString(36).substring(7)
  };
});

// Background steps
Given('the application is running and the user has access', async function () {
  // Background setup for general domain
  await jiraStory10Page.navigate();
  await jiraStory10Page.waitForLoad();
  
  // Domain-specific initialization
  await jiraStory10Page.verify('the system is initialized');
  await jiraStory10Page.verify('the user is authenticated');
  await jiraStory10Page.verify('the functionality is available');
});

// Generated step definitions
Given('the application is running and the user has access', async function () {
  // Setup: the application is running and the user has access
  await jiraStory10Page.setup('the application is running and the user has access');
  this.context = { step: 'the application is running and the user has access', domain: 'general' };
});

Given('the application is running and the user is authenticated', async function () {
  // Setup: the application is running and the user is authenticated
  await jiraStory10Page.setup('the application is running and the user is authenticated');
  this.context = { step: 'the application is running and the user is authenticated', domain: 'general' };
});

Given('the application is running', async function () {
  // Setup: the application is running
  await jiraStory10Page.setup('the application is running');
  this.context = { step: 'the application is running', domain: 'general' };
});

When('the user performs an option to stay logged in', async function () {
  // Action: the user performs an option to stay logged in
  await jiraStory10Page.perform('the user performs an option to stay logged in');
  this.result = await jiraStory10Page.getLastActionResult();
});

When('the user attempts an option to stay logged in but encounters an error', async function () {
  // Action: the user attempts an option to stay logged in but encounters an error
  await jiraStory10Page.perform('the user attempts an option to stay logged in but encounters an error');
  this.result = await jiraStory10Page.getLastActionResult();
});

When('the user performs be able to reset my password if I forget it', async function () {
  // Action: the user performs be able to reset my password if I forget it
  await jiraStory10Page.perform('the user performs be able to reset my password if I forget it');
  this.result = await jiraStory10Page.getLastActionResult();
});

When('the user attempts be able to reset my password if I forget it but encounters an error', async function () {
  // Action: the user attempts be able to reset my password if I forget it but encounters an error
  await jiraStory10Page.perform('the user attempts be able to reset my password if I forget it but encounters an error');
  this.result = await jiraStory10Page.getLastActionResult();
});

When('the user performs see an error message if I enter incorrect login details', async function () {
  // Action: the user performs see an error message if I enter incorrect login details
  await jiraStory10Page.perform('the user performs see an error message if I enter incorrect login details');
  this.result = await jiraStory10Page.getLastActionResult();
});

When('I check the system status', async function () {
  // Action: I check the system status
  await jiraStory10Page.perform('I check the system status');
  this.result = await jiraStory10Page.getLastActionResult();
});

Then('I don’t have to enter my credentials every time', async function () {
  // Verification: I don’t have to enter my credentials every time
  const result = await jiraStory10Page.verify('I don’t have to enter my credentials every time');
  expect(result).toBe(true);
});

Then('the system handles the error gracefully and provides helpful feedback', async function () {
  // Verification: the system handles the error gracefully and provides helpful feedback
  const result = await jiraStory10Page.verify('the system handles the error gracefully and provides helpful feedback');
  expect(result).toBe(true);
});

Then('I can regain access to my account', async function () {
  // Verification: I can regain access to my account
  const result = await jiraStory10Page.verify('I can regain access to my account');
  expect(result).toBe(true);
});

Then('I know when my login attempt has failed', async function () {
  // Verification: I know when my login attempt has failed
  const result = await jiraStory10Page.verify('I know when my login attempt has failed');
  expect(result).toBe(true);
});

Then('all required services should be operational', async function () {
  // Verification: all required services should be operational
  const result = await jiraStory10Page.verify('all required services should be operational');
  expect(result).toBe(true);
});

// Common steps
Given('the application is running', async function () {
  await jiraStory10Page.navigate();
  await jiraStory10Page.waitForLoad();
});

When('I check the system status', async function () {
  await jiraStory10Page.checkSystemHealth();
});

Then('all required services should be operational', async function () {
  const isHealthy = await jiraStory10Page.verifySystemHealth();
  expect(isHealthy).toBe(true);
});

Then('no critical errors should be present', async function () {
  const errors = await jiraStory10Page.getCriticalErrors();
  expect(errors).toHaveLength(0);
});

Then('the operation should be logged for audit purposes', async function () {
  const logs = await jiraStory10Page.getAuditLogs();
  expect(logs).toContain(this.testData.testId);
});

Then('the system should remain stable', async function () {
  const isStable = await jiraStory10Page.verifySystemStability();
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
