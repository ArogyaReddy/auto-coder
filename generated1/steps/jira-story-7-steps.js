const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const JiraStory7Page = require('../pages/jira-story-7-page');

// Step definitions for Jira Story 7
// Generated from feature file analysis
// Domain: general

setDefaultTimeout(30000);

let page;
let jiraStory7Page;

Before(async function () {
  // Initialize browser and page for each scenario
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  page = await context.newPage();
  jiraStory7Page = new JiraStory7Page(page);
  
  // Set up test data and environment
  this.testData = {
    timestamp: new Date().toISOString(),
    testId: Math.random().toString(36).substring(7)
  };
});

// Background steps
Given('the application is running and the user has access', async function () {
  // Background setup for general domain
  await jiraStory7Page.navigate();
  await jiraStory7Page.waitForLoad();
  
  // Domain-specific initialization
  await jiraStory7Page.verify('the system is initialized');
  await jiraStory7Page.verify('the user is authenticated');
  await jiraStory7Page.verify('the functionality is available');
});

// Generated step definitions
Given('the application is running and the user has access', async function () {
  // Setup: the application is running and the user has access
  await jiraStory7Page.setup('the application is running and the user has access');
  this.context = { step: 'the application is running and the user has access', domain: 'general' };
});

Given('the user is logged in and has access to the invitation feature', async function () {
  // Setup: the user is logged in and has access to the invitation feature
  await jiraStory7Page.setup('the user is logged in and has access to the invitation feature');
  this.context = { step: 'the user is logged in and has access to the invitation feature', domain: 'general' };
});

Given('the user is logged in and has work items to organize', async function () {
  // Setup: the user is logged in and has work items to organize
  await jiraStory7Page.setup('the user is logged in and has work items to organize');
  this.context = { step: 'the user is logged in and has work items to organize', domain: 'general' };
});

Given('the manager is logged in and has team members with progress data', async function () {
  // Setup: the manager is logged in and has team members with progress data
  await jiraStory7Page.setup('the manager is logged in and has team members with progress data');
  this.context = { step: 'the manager is logged in and has team members with progress data', domain: 'general' };
});

Given('the application is running', async function () {
  // Setup: the application is running
  await jiraStory7Page.setup('the application is running');
  this.context = { step: 'the application is running', domain: 'general' };
});

When('the user sends invitations to friends', async function () {
  // Action: the user sends invitations to friends
  await jiraStory7Page.perform('the user sends invitations to friends');
  this.result = await jiraStory7Page.getLastActionResult();
});

When('the user attempts to invite friends but the service is unavailable', async function () {
  // Action: the user attempts to invite friends but the service is unavailable
  await jiraStory7Page.perform('the user attempts to invite friends but the service is unavailable');
  this.result = await jiraStory7Page.getLastActionResult();
});

When('the user organizes their work items', async function () {
  // Action: the user organizes their work items
  await jiraStory7Page.perform('the user organizes their work items');
  this.result = await jiraStory7Page.getLastActionResult();
});

When('the user attempts to organize work but encounters system errors', async function () {
  // Action: the user attempts to organize work but encounters system errors
  await jiraStory7Page.perform('the user attempts to organize work but encounters system errors');
  this.result = await jiraStory7Page.getLastActionResult();
});

When('the manager views team progress information', async function () {
  // Action: the manager views team progress information
  await jiraStory7Page.perform('the manager views team progress information');
  this.result = await jiraStory7Page.getLastActionResult();
});

When('I check the system status', async function () {
  // Action: I check the system status
  await jiraStory7Page.perform('I check the system status');
  this.result = await jiraStory7Page.getLastActionResult();
});

Then('we can enjoy this service together', async function () {
  // Verification: we can enjoy this service together
  const result = await jiraStory7Page.verify('we can enjoy this service together');
  expect(result).toBe(true);
});

Then('the system handles the error gracefully and provides helpful feedback', async function () {
  // Verification: the system handles the error gracefully and provides helpful feedback
  const result = await jiraStory7Page.verify('the system handles the error gracefully and provides helpful feedback');
  expect(result).toBe(true);
});

Then('I can feel more in control', async function () {
  // Verification: I can feel more in control
  const result = await jiraStory7Page.verify('I can feel more in control');
  expect(result).toBe(true);
});

Then('I can better report our sucess and failures', async function () {
  // Verification: I can better report our sucess and failures
  const result = await jiraStory7Page.verify('I can better report our sucess and failures');
  expect(result).toBe(true);
});

Then('all required services should be operational', async function () {
  // Verification: all required services should be operational
  const result = await jiraStory7Page.verify('all required services should be operational');
  expect(result).toBe(true);
});

// Common steps
Given('the application is running', async function () {
  await jiraStory7Page.navigate();
  await jiraStory7Page.waitForLoad();
});

When('I check the system status', async function () {
  await jiraStory7Page.checkSystemHealth();
});

Then('all required services should be operational', async function () {
  const isHealthy = await jiraStory7Page.verifySystemHealth();
  expect(isHealthy).toBe(true);
});

Then('no critical errors should be present', async function () {
  const errors = await jiraStory7Page.getCriticalErrors();
  expect(errors).toHaveLength(0);
});

Then('the operation should be logged for audit purposes', async function () {
  const logs = await jiraStory7Page.getAuditLogs();
  expect(logs).toContain(this.testData.testId);
});

Then('the system should remain stable', async function () {
  const isStable = await jiraStory7Page.verifySystemStability();
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
