const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const JiraStory12Page = require('../pages/jira-story-12-page');

// Step definitions for Jira Story 12
// Generated from feature file analysis
// Domain: general

setDefaultTimeout(30000);

let page;
let jiraStory12Page;

Before(async function () {
  // Initialize browser and page for each scenario
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  page = await context.newPage();
  jiraStory12Page = new JiraStory12Page(page);
  
  // Set up test data and environment
  this.testData = {
    timestamp: new Date().toISOString(),
    testId: Math.random().toString(36).substring(7)
  };
});

// Background steps
Given('the application is running and the user has access', async function () {
  // Background setup for general domain
  await jiraStory12Page.navigate();
  await jiraStory12Page.waitForLoad();
  
  // Domain-specific initialization
  await jiraStory12Page.verify('the system is initialized');
  await jiraStory12Page.verify('the user is authenticated');
  await jiraStory12Page.verify('the functionality is available');
});

// Generated step definitions
Given('the application is running and the user has access', async function () {
  // Setup: the application is running and the user has access
  await jiraStory12Page.setup('the application is running and the user has access');
  this.context = { step: 'the application is running and the user has access', domain: 'general' };
});

Given('the application is running and the user is authenticated', async function () {
  // Setup: the application is running and the user is authenticated
  await jiraStory12Page.setup('the application is running and the user is authenticated');
  this.context = { step: 'the application is running and the user is authenticated', domain: 'general' };
});

Given('the application is running', async function () {
  // Setup: the application is running
  await jiraStory12Page.setup('the application is running');
  this.context = { step: 'the application is running', domain: 'general' };
});

When('the user performs an offline mode in the language learning app', async function () {
  // Action: the user performs an offline mode in the language learning app
  await jiraStory12Page.perform('the user performs an offline mode in the language learning app');
  this.result = await jiraStory12Page.getLastActionResult();
});

When('the user attempts an offline mode in the language learning app but encounters an error', async function () {
  // Action: the user attempts an offline mode in the language learning app but encounters an error
  await jiraStory12Page.perform('the user attempts an offline mode in the language learning app but encounters an error');
  this.result = await jiraStory12Page.getLastActionResult();
});

When('the user performs be able to customize my news feed based on my interests', async function () {
  // Action: the user performs be able to customize my news feed based on my interests
  await jiraStory12Page.perform('the user performs be able to customize my news feed based on my interests');
  this.result = await jiraStory12Page.getLastActionResult();
});

When('the user attempts be able to customize my news feed based on my interests but encounters an error', async function () {
  // Action: the user attempts be able to customize my news feed based on my interests but encounters an error
  await jiraStory12Page.perform('the user attempts be able to customize my news feed based on my interests but encounters an error');
  this.result = await jiraStory12Page.getLastActionResult();
});

When('the user performs be able to easily sync my app data across multiple devices', async function () {
  // Action: the user performs be able to easily sync my app data across multiple devices
  await jiraStory12Page.perform('the user performs be able to easily sync my app data across multiple devices');
  this.result = await jiraStory12Page.getLastActionResult();
});

When('I check the system status', async function () {
  // Action: I check the system status
  await jiraStory12Page.perform('I check the system status');
  this.result = await jiraStory12Page.getLastActionResult();
});

Then('I can continue learning without an internet connection', async function () {
  // Verification: I can continue learning without an internet connection
  const result = await jiraStory12Page.verify('I can continue learning without an internet connection');
  expect(result).toBe(true);
});

Then('the system handles the error gracefully and provides helpful feedback', async function () {
  // Verification: the system handles the error gracefully and provides helpful feedback
  const result = await jiraStory12Page.verify('the system handles the error gracefully and provides helpful feedback');
  expect(result).toBe(true);
});

Then('I can quickly find articles I want to read', async function () {
  // Verification: I can quickly find articles I want to read
  const result = await jiraStory12Page.verify('I can quickly find articles I want to read');
  expect(result).toBe(true);
});

Then('I can access my information from anywhere', async function () {
  // Verification: I can access my information from anywhere
  const result = await jiraStory12Page.verify('I can access my information from anywhere');
  expect(result).toBe(true);
});

Then('all required services should be operational', async function () {
  // Verification: all required services should be operational
  const result = await jiraStory12Page.verify('all required services should be operational');
  expect(result).toBe(true);
});

// Common steps
Given('the application is running', async function () {
  await jiraStory12Page.navigate();
  await jiraStory12Page.waitForLoad();
});

When('I check the system status', async function () {
  await jiraStory12Page.checkSystemHealth();
});

Then('all required services should be operational', async function () {
  const isHealthy = await jiraStory12Page.verifySystemHealth();
  expect(isHealthy).toBe(true);
});

Then('no critical errors should be present', async function () {
  const errors = await jiraStory12Page.getCriticalErrors();
  expect(errors).toHaveLength(0);
});

Then('the operation should be logged for audit purposes', async function () {
  const logs = await jiraStory12Page.getAuditLogs();
  expect(logs).toContain(this.testData.testId);
});

Then('the system should remain stable', async function () {
  const isStable = await jiraStory12Page.verifySystemStability();
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
