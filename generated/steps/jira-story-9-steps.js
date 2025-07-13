const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const JiraStory9Page = require('../pages/jira-story-9-page');

// Step definitions for Jira Story 9
// Generated from feature file analysis
// Domain: web

setDefaultTimeout(30000);

let page;
let jiraStory9Page;

Before(async function () {
  // Initialize browser and page for each scenario
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  page = await context.newPage();
  jiraStory9Page = new JiraStory9Page(page);
  
  // Set up test data and environment
  this.testData = {
    timestamp: new Date().toISOString(),
    testId: Math.random().toString(36).substring(7)
  };
});

// Background steps
Given('the web application is running and I am logged in', async function () {
  // Background setup for web domain
  await jiraStory9Page.navigate();
  await jiraStory9Page.waitForLoad();
  
  // Domain-specific initialization
  await jiraStory9Page.verify('the page loads successfully');
  await jiraStory9Page.verify('the user interface is responsive');
  await jiraStory9Page.verify('all elements are visible');
});

// Generated step definitions
Given('the application is running', async function () {
  // Setup: the application is running
  await jiraStory9Page.setup('the application is running');
  this.context = { step: 'the application is running', domain: 'web' };
});

When('I check the system status', async function () {
  // Action: I check the system status
  await jiraStory9Page.perform('I check the system status');
  this.result = await jiraStory9Page.getLastActionResult();
});

Then('all required services should be operational', async function () {
  // Verification: all required services should be operational
  const result = await jiraStory9Page.verify('all required services should be operational');
  expect(result).toBe(true);
});

// Common steps
Given('the application is running', async function () {
  await jiraStory9Page.navigate();
  await jiraStory9Page.waitForLoad();
});

When('I check the system status', async function () {
  await jiraStory9Page.checkSystemHealth();
});

Then('all required services should be operational', async function () {
  const isHealthy = await jiraStory9Page.verifySystemHealth();
  expect(isHealthy).toBe(true);
});

Then('no critical errors should be present', async function () {
  const errors = await jiraStory9Page.getCriticalErrors();
  expect(errors).toHaveLength(0);
});

Then('the operation should be logged for audit purposes', async function () {
  const logs = await jiraStory9Page.getAuditLogs();
  expect(logs).toContain(this.testData.testId);
});

Then('the system should remain stable', async function () {
  const isStable = await jiraStory9Page.verifySystemStability();
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
