const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const JiraStory5Page = require('../pages/jira-story-5-page');

// Step definitions for Jira Story 5
// Generated from feature file analysis
// Domain: jira

setDefaultTimeout(30000);

let page;
let jiraStory5Page;

Before(async function () {
  // Initialize browser and page for each scenario
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  page = await context.newPage();
  jiraStory5Page = new JiraStory5Page(page);
  
  // Set up test data and environment
  this.testData = {
    timestamp: new Date().toISOString(),
    testId: Math.random().toString(36).substring(7)
  };
});

// Background steps
Given('Jira is running and I have administrator privileges', async function () {
  // Background setup for jira domain
  await jiraStory5Page.navigate();
  await jiraStory5Page.waitForLoad();
  
  // Domain-specific initialization
  await jiraStory5Page.verify('the Jira instance is configured');
  await jiraStory5Page.verify('the user has appropriate permissions');
  await jiraStory5Page.verify('the feature flag is accessible');
});

// Generated step definitions
Given('Jira is running and I have administrator privileges', async function () {
  // Setup: Jira is running and I have administrator privileges
  await jiraStory5Page.setup('Jira is running and I have administrator privileges');
  this.context = { step: 'Jira is running and I have administrator privileges', domain: 'jira' };
});

Given('the Jira instance is running and the user has appropriate permissions', async function () {
  // Setup: the Jira instance is running and the user has appropriate permissions
  await jiraStory5Page.setup('the Jira instance is running and the user has appropriate permissions');
  this.context = { step: 'the Jira instance is running and the user has appropriate permissions', domain: 'jira' };
});

Given('the application is running', async function () {
  // Setup: the application is running
  await jiraStory5Page.setup('the application is running');
  this.context = { step: 'the application is running', domain: 'jira' };
});

When('the user interacts with your export', async function () {
  // Action: the user interacts with your export
  await jiraStory5Page.perform('the user interacts with your export');
  this.result = await jiraStory5Page.getLastActionResult();
});

When('the user attempts to your export with invalid parameters', async function () {
  // Action: the user attempts to your export with invalid parameters
  await jiraStory5Page.perform('the user attempts to your export with invalid parameters');
  this.result = await jiraStory5Page.getLastActionResult();
});

When('the user interacts with dark features', async function () {
  // Action: the user interacts with dark features
  await jiraStory5Page.perform('the user interacts with dark features');
  this.result = await jiraStory5Page.getLastActionResult();
});

When('the user interacts with feature flag', async function () {
  // Action: the user interacts with feature flag
  await jiraStory5Page.perform('the user interacts with feature flag');
  this.result = await jiraStory5Page.getLastActionResult();
});

When('the user interacts with dark feature', async function () {
  // Action: the user interacts with dark feature
  await jiraStory5Page.perform('the user interacts with dark feature');
  this.result = await jiraStory5Page.getLastActionResult();
});

When('I check the system status', async function () {
  // Action: I check the system status
  await jiraStory5Page.perform('I check the system status');
  this.result = await jiraStory5Page.getLastActionResult();
});

Then('the operation should complete successfully', async function () {
  // Verification: the operation should complete successfully
  const result = await jiraStory5Page.verify('the operation should complete successfully');
  expect(result).toBe(true);
});

Then('an appropriate error message should be displayed and the system should remain stable', async function () {
  // Verification: an appropriate error message should be displayed and the system should remain stable
  const result = await jiraStory5Page.verify('an appropriate error message should be displayed and the system should remain stable');
  expect(result).toBe(true);
});

Then('all required services should be operational', async function () {
  // Verification: all required services should be operational
  const result = await jiraStory5Page.verify('all required services should be operational');
  expect(result).toBe(true);
});

// Common steps
Given('the application is running', async function () {
  await jiraStory5Page.navigate();
  await jiraStory5Page.waitForLoad();
});

When('I check the system status', async function () {
  await jiraStory5Page.checkSystemHealth();
});

Then('all required services should be operational', async function () {
  const isHealthy = await jiraStory5Page.verifySystemHealth();
  expect(isHealthy).toBe(true);
});

Then('no critical errors should be present', async function () {
  const errors = await jiraStory5Page.getCriticalErrors();
  expect(errors).toHaveLength(0);
});

Then('the operation should be logged for audit purposes', async function () {
  const logs = await jiraStory5Page.getAuditLogs();
  expect(logs).toContain(this.testData.testId);
});

Then('the system should remain stable', async function () {
  const isStable = await jiraStory5Page.verifySystemStability();
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
