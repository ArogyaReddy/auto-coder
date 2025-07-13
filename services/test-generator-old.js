const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');
const RequirementAnalyzer = require('./requirement-analyzer');
const IntelligentTemplateGenerator = require('../utils/template-generator');

class TestGenerator {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'generated');
    this.analyzer = new RequirementAnalyzer();
    this.templateGenerator = new IntelligentTemplateGenerator();
    this.ensureDirectoriesExist();
  }

  async ensureDirectoriesExist() {
    const dirs = ['features', 'steps', 'pages', 'tests', 'summary'];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(this.outputDir, dir));
    }
  }

  async generateFromSource(inputSource, inputType, outputDir) {
    let requirements;
    
    switch (inputType) {
      case 'file':
        requirements = await this.requirementReader.readFromFile(inputSource);
        break;
      case 'url':
        requirements = await this.requirementReader.readFromUrl(inputSource);
        break;
      case 'image':
        requirements = await this.requirementReader.readFromImage(inputSource);
        break;
      case 'confluence':
        requirements = await this.requirementReader.readFromConfluence(JSON.parse(inputSource));
        break;
      case 'curl':
        requirements = await this.requirementReader.readFromCurl(inputSource);
        break;
      case 'playwright':
        requirements = await this.requirementReader.readFromPlaywright(inputSource);
        break;
      default:
        throw new Error(`Unsupported input type: ${inputType}`);
    }

    return await this.generateArtifacts(requirements, outputDir);
  }

  async generateFromFile(filePath, outputDir) {
    const requirements = await this.requirementReader.readFromFile(filePath);
    return await this.generateArtifacts(requirements, outputDir);
  }

  async generateFromText(textInput, outputDir = './generated') {
    const requirements = {
      content: textInput,
      source: 'text-input',
      type: 'text',
      fileName: `text_input_${Date.now()}`,
      metadata: {
        inputLength: textInput.length,
        inputType: 'direct-text'
      }
    };

    return await this.generateArtifacts(requirements, outputDir);
  }

  async generateArtifacts(requirements, outputDir = './generated') {
    try {
      logger.info('🛠️ Generating test artifacts...');
      
      const baseName = requirements.fileName || 'requirements';
      const artifacts = {};

      // Ensure output directories exist
      await fs.ensureDir(outputDir);
      await fs.ensureDir(path.join(outputDir, 'summary'));
      await fs.ensureDir(path.join(outputDir, 'features'));
      await fs.ensureDir(path.join(outputDir, 'steps'));
      await fs.ensureDir(path.join(outputDir, 'pages'));
      await fs.ensureDir(path.join(outputDir, 'tests'));

      // Generate summary
      logger.info('📝 Generating summary...');
      const summary = await this.generateSummary(requirements);
      const summaryPath = path.join(outputDir, 'summary', `${baseName}-summary.md`);
      await fs.writeFile(summaryPath, summary);
      artifacts.summary = summaryPath;

      // Generate feature files
      logger.info('🎯 Generating feature files...');
      const feature = await this.generateFeatureFile(requirements);
      const featurePath = path.join(outputDir, 'features', `${baseName}.feature`);
      await fs.writeFile(featurePath, feature);
      artifacts.feature = featurePath;

      // Generate step definitions
      logger.info('🪜 Generating step definitions...');
      const steps = await this.generateStepDefinitions(requirements);
      const stepsPath = path.join(outputDir, 'steps', `${baseName}-steps.js`);
      await fs.writeFile(stepsPath, steps);
      artifacts.steps = stepsPath;

      // Generate page objects
      logger.info('📄 Generating page objects...');
      const pageObjects = await this.generatePageObjects(requirements);
      const pagePath = path.join(outputDir, 'pages', `${baseName}-page.js`);
      await fs.writeFile(pagePath, pageObjects);
      artifacts.page = pagePath;

      // Generate test scripts
      logger.info('🧪 Generating test scripts...');
      const testScript = await this.generateTestScript(requirements);
      const testPath = path.join(outputDir, 'tests', `${baseName}-test.js`);
      await fs.writeFile(testPath, testScript);
      artifacts.test = testPath;

      // Generate configuration files
      await this.generateConfigFiles(outputDir);

      logger.success('✅ All test artifacts generated successfully!');
      return artifacts;
    } catch (error) {
      logger.error(`Test generation failed: ${error.message}`);
      throw error;
    }
  }

  async generateSummary(requirements) {
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `# Requirements Summary

**Generated on:** ${timestamp}  
**Source:** ${requirements.source}  
**Type:** ${requirements.type}  

## Overview

This document summarizes the requirements extracted from the source material and outlines the test scenarios that will be implemented.

## Source Information

- **File/Source:** ${requirements.source}
- **Content Type:** ${requirements.type}
- **Content Length:** ${requirements.content.length} characters
${requirements.metadata ? this.formatMetadata(requirements.metadata) : ''}

## Requirements Analysis

${this.analyzeRequirements(requirements.content)}

## Test Scenarios Identified

${this.identifyTestScenarios(requirements.content)}

## Test Data Requirements

${this.identifyTestData(requirements.content)}

## Coverage Areas

${this.identifyCoverageAreas(requirements.content)}

---

*This summary was automatically generated by the Auto-Coder Framework*
`;
  }

  formatMetadata(metadata) {
    let formatted = '\n## Metadata\n\n';
    for (const [key, value] of Object.entries(metadata)) {
      formatted += `- **${key}:** ${value}\n`;
    }
    return formatted;
  }

  analyzeRequirements(content) {
    const lines = content.split('\n').filter(line => line.trim());
    const wordCount = content.split(/\s+/).length;
    
    // Extract key actions and entities
    const actions = this.extractActions(content);
    const entities = this.extractEntities(content);
    
    return `
### Content Analysis
- **Total Lines:** ${lines.length}
- **Word Count:** ${wordCount}
- **Key Actions Identified:** ${actions.length}
- **Entities Found:** ${entities.length}

### Key Actions
${actions.map(action => `- ${action}`).join('\n')}

### Key Entities
${entities.map(entity => `- ${entity}`).join('\n')}
`;
  }

  extractActions(content) {
    const actionKeywords = [
      'login', 'register', 'submit', 'click', 'enter', 'select', 'upload', 'download',
      'create', 'update', 'delete', 'search', 'filter', 'sort', 'navigate', 'verify',
      'validate', 'check', 'confirm', 'cancel', 'save', 'edit', 'view', 'open', 'close'
    ];
    
    const found = [];
    const contentLower = content.toLowerCase();
    
    actionKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        found.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });
    
    return [...new Set(found)].slice(0, 10); // Limit to 10 unique actions
  }

  extractEntities(content) {
    const entityPatterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Proper nouns
      /\b(?:user|admin|customer|account|profile|dashboard|form|button|field|page|screen)\b/gi,
      /\b(?:email|password|username|name|address|phone|date|time)\b/gi
    ];
    
    const found = [];
    
    entityPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      found.push(...matches);
    });
    
    return [...new Set(found)].slice(0, 15); // Limit to 15 unique entities
  }

  identifyTestScenarios(content) {
    const scenarios = [];
    const lines = content.split('\n');
    
    // Look for scenario patterns
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (this.isScenarioLine(trimmed)) {
        scenarios.push({
          title: this.extractScenarioTitle(trimmed),
          lineNumber: index + 1
        });
      }
    });
    
    // If no explicit scenarios found, generate based on content
    if (scenarios.length === 0) {
      scenarios.push(...this.generateScenariosFromContent(content));
    }
    
    return scenarios.map((scenario, index) => 
      `### Scenario ${index + 1}: ${scenario.title}`
    ).join('\n\n');
  }

  isScenarioLine(line) {
    const scenarioKeywords = [
      'scenario', 'test case', 'user story', 'feature', 'requirement',
      'given', 'when', 'then', 'should', 'must', 'will'
    ];
    
    const lineLower = line.toLowerCase();
    return scenarioKeywords.some(keyword => lineLower.includes(keyword));
  }

  extractScenarioTitle(line) {
    // Clean up the line to extract meaningful title
    return line
      .replace(/^\d+\.?\s*/, '') // Remove numbering
      .replace(/^(scenario|test case|user story|feature|requirement)[:|\s]+/i, '') // Remove prefixes
      .trim();
  }

  generateScenariosFromContent(content) {
    const actions = this.extractActions(content);
    const scenarios = [];
    
    // Generate basic scenarios based on identified actions
    actions.forEach(action => {
      scenarios.push({
        title: `User can ${action.toLowerCase()}`
      });
    });
    
    // Add default scenarios if none found
    if (scenarios.length === 0) {
      scenarios.push(
        { title: 'User can access the application' },
        { title: 'User can perform basic operations' },
        { title: 'System validates user input' }
      );
    }
    
    return scenarios;
  }

  identifyTestData(content) {
    const testDataPatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // Dates
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
      /\b\d{3}-\d{3}-\d{4}\b/g, // Phone numbers
      /\$\d+(?:\.\d{2})?\b/g // Currency
    ];
    
    const foundData = [];
    
    testDataPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      foundData.push(...matches);
    });
    
    if (foundData.length > 0) {
      return `
### Identified Test Data
${foundData.slice(0, 10).map(data => `- ${data}`).join('\n')}
`;
    }
    
    return `
### Test Data Categories
- Valid input data
- Invalid input data
- Boundary value data
- Empty/null data
- Special characters
`;
  }

  identifyCoverageAreas(content) {
    const areas = [
      'User Interface Testing',
      'Functional Testing',
      'Input Validation',
      'Error Handling',
      'Performance Testing',
      'Security Testing',
      'Accessibility Testing',
      'Cross-browser Testing'
    ];
    
    return areas.map(area => `- ${area}`).join('\n');
  }

  async generateFeatureFile(requirements) {
    const baseName = requirements.fileName || 'requirements';
    const scenarios = this.extractScenariosForFeature(requirements.content);
    
    return `Feature: ${this.generateFeatureTitle(baseName)}
  As a user
  I want to interact with the application
  So that I can accomplish my goals

${scenarios.map(scenario => this.formatScenarioForFeature(scenario)).join('\n\n')}
`;
  }

  generateFeatureTitle(baseName) {
    return baseName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  extractScenariosForFeature(content) {
    const actions = this.extractActions(content);
    const scenarios = [];
    
    // Generate scenarios based on actions
    actions.forEach(action => {
      scenarios.push({
        title: `User can ${action.toLowerCase()}`,
        steps: this.generateStepsForAction(action)
      });
    });
    
    // Ensure we have at least one scenario
    if (scenarios.length === 0) {
      scenarios.push({
        title: 'User can access the application',
        steps: [
          'Given I am on the application homepage',
          'When I navigate to the main section',
          'Then I should see the application interface'
        ]
      });
    }
    
    return scenarios.slice(0, 5); // Limit to 5 scenarios
  }

  generateStepsForAction(action) {
    const actionLower = action.toLowerCase();
    
    switch (actionLower) {
      case 'login':
        return [
          'Given I am on the login page',
          'When I enter valid credentials',
          'And I click the login button',
          'Then I should be logged in successfully'
        ];
      case 'register':
        return [
          'Given I am on the registration page',
          'When I fill in the registration form',
          'And I submit the form',
          'Then I should be registered successfully'
        ];
      case 'search':
        return [
          'Given I am on the search page',
          'When I enter search criteria',
          'And I click the search button',
          'Then I should see search results'
        ];
      default:
        return [
          `Given I am on the ${actionLower} page`,
          `When I perform the ${actionLower} action`,
          `Then the ${actionLower} should be completed successfully`
        ];
    }
  }

  formatScenarioForFeature(scenario) {
    return `  Scenario: ${scenario.title}
${scenario.steps.map(step => `    ${step}`).join('\n')}`;
  }

  async generateStepDefinitions(requirements) {
    const baseName = requirements.fileName || 'requirements';
    
    return `const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { chromium } = require('playwright');

// Page object import
const ${this.toCamelCase(baseName)}Page = require('../pages/${baseName}-page');

let browser, context, page, ${this.toCamelCase(baseName).toLowerCase()}Page;

// Hooks
Given('I am on the {string} page', async function (pageName) {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
  ${this.toCamelCase(baseName).toLowerCase()}Page = new ${this.toCamelCase(baseName)}Page(page);
  
  await ${this.toCamelCase(baseName).toLowerCase()}Page.navigate();
});

When('I enter valid credentials', async function () {
  await ${this.toCamelCase(baseName).toLowerCase()}Page.enterCredentials('testuser@example.com', 'password123');
});

When('I click the {string} button', async function (buttonName) {
  await ${this.toCamelCase(baseName).toLowerCase()}Page.clickButton(buttonName);
});

When('I fill in the registration form', async function () {
  await ${this.toCamelCase(baseName).toLowerCase()}Page.fillRegistrationForm({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123'
  });
});

When('I enter search criteria', async function () {
  await ${this.toCamelCase(baseName).toLowerCase()}Page.enterSearchCriteria('test search');
});

When('I perform the {string} action', async function (action) {
  await ${this.toCamelCase(baseName).toLowerCase()}Page.performAction(action);
});

Then('I should be logged in successfully', async function () {
  const isLoggedIn = await ${this.toCamelCase(baseName).toLowerCase()}Page.isLoggedIn();
  expect(isLoggedIn).to.be.true;
});

Then('I should be registered successfully', async function () {
  const successMessage = await ${this.toCamelCase(baseName).toLowerCase()}Page.getSuccessMessage();
  expect(successMessage).to.include('registered');
});

Then('I should see search results', async function () {
  const hasResults = await ${this.toCamelCase(baseName).toLowerCase()}Page.hasSearchResults();
  expect(hasResults).to.be.true;
});

Then('I should see the application interface', async function () {
  const isVisible = await ${this.toCamelCase(baseName).toLowerCase()}Page.isApplicationVisible();
  expect(isVisible).to.be.true;
});

Then('the {string} should be completed successfully', async function (action) {
  const isCompleted = await ${this.toCamelCase(baseName).toLowerCase()}Page.isActionCompleted(action);
  expect(isCompleted).to.be.true;
});

// Cleanup
After(async function () {
  if (browser) {
    await browser.close();
  }
});
`;
  }

  async generatePageObjects(requirements) {
    const baseName = requirements.fileName || 'requirements';
    const className = this.toCamelCase(baseName) + 'Page';
    
    return `class ${className} {
  constructor(page) {
    this.page = page;
    this.baseUrl = 'http://localhost:3000'; // Update with actual URL
    
    // Selectors
    this.selectors = {
      // Login elements
      emailInput: '[name="email"], #email, [data-testid="email"]',
      passwordInput: '[name="password"], #password, [data-testid="password"]',
      loginButton: '[type="submit"], .login-btn, [data-testid="login-button"]',
      
      // Registration elements
      nameInput: '[name="name"], #name, [data-testid="name"]',
      registerButton: '.register-btn, [data-testid="register-button"]',
      
      // Search elements
      searchInput: '[name="search"], #search, [data-testid="search"]',
      searchButton: '.search-btn, [data-testid="search-button"]',
      searchResults: '.search-results, [data-testid="search-results"]',
      
      // General elements
      successMessage: '.success, .alert-success, [data-testid="success-message"]',
      errorMessage: '.error, .alert-error, [data-testid="error-message"]',
      userMenu: '.user-menu, [data-testid="user-menu"]',
      navigationMenu: '.nav, .navigation, [data-testid="navigation"]'
    };
  }

  async navigate(path = '') {
    await this.page.goto(this.baseUrl + path);
    await this.page.waitForLoadState('networkidle');
  }

  async enterCredentials(email, password) {
    await this.page.fill(this.selectors.emailInput, email);
    await this.page.fill(this.selectors.passwordInput, password);
  }

  async clickButton(buttonName) {
    const buttonMap = {
      'login': this.selectors.loginButton,
      'register': this.selectors.registerButton,
      'search': this.selectors.searchButton
    };
    
    const selector = buttonMap[buttonName.toLowerCase()] || \`[data-testid="\${buttonName.toLowerCase()}-button"]\`;
    await this.page.click(selector);
  }

  async fillRegistrationForm(userData) {
    if (userData.name) {
      await this.page.fill(this.selectors.nameInput, userData.name);
    }
    if (userData.email) {
      await this.page.fill(this.selectors.emailInput, userData.email);
    }
    if (userData.password) {
      await this.page.fill(this.selectors.passwordInput, userData.password);
    }
  }

  async enterSearchCriteria(searchTerm) {
    await this.page.fill(this.selectors.searchInput, searchTerm);
  }

  async performAction(action) {
    // Generic action performer
    const actionMap = {
      'click': async (selector) => await this.page.click(selector),
      'type': async (selector, text) => await this.page.type(selector, text),
      'select': async (selector, value) => await this.page.selectOption(selector, value)
    };
    
    // This is a placeholder - in a real implementation, you would
    // map actions to specific page interactions based on the requirements
    console.log(\`Performing action: \${action}\`);
  }

  async isLoggedIn() {
    try {
      await this.page.waitForSelector(this.selectors.userMenu, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async getSuccessMessage() {
    try {
      return await this.page.textContent(this.selectors.successMessage);
    } catch {
      return '';
    }
  }

  async hasSearchResults() {
    try {
      await this.page.waitForSelector(this.selectors.searchResults, { timeout: 5000 });
      const resultsCount = await this.page.locator(this.selectors.searchResults + ' > *').count();
      return resultsCount > 0;
    } catch {
      return false;
    }
  }

  async isApplicationVisible() {
    try {
      await this.page.waitForSelector(this.selectors.navigationMenu, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async isActionCompleted(action) {
    // Generic action completion checker
    try {
      const successMessage = await this.getSuccessMessage();
      return successMessage.toLowerCase().includes(action.toLowerCase());
    } catch {
      return false;
    }
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: \`screenshots/\${name}.png\` });
  }

  async waitForElement(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async getText(selector) {
    return await this.page.textContent(selector);
  }

  async getAttribute(selector, attribute) {
    return await this.page.getAttribute(selector, attribute);
  }
}

module.exports = ${className};
`;
  }

  async generateTestScript(requirements) {
    const baseName = requirements.fileName || 'requirements';
    
    return `const { test, expect } = require('@playwright/test');
const ${this.toCamelCase(baseName)}Page = require('../pages/${baseName}-page');

test.describe('${this.generateFeatureTitle(baseName)} Tests', () => {
  let ${this.toCamelCase(baseName).toLowerCase()}Page;

  test.beforeEach(async ({ page }) => {
    ${this.toCamelCase(baseName).toLowerCase()}Page = new ${this.toCamelCase(baseName)}Page(page);
    await ${this.toCamelCase(baseName).toLowerCase()}Page.navigate();
  });

  test('should load the application successfully', async () => {
    const isVisible = await ${this.toCamelCase(baseName).toLowerCase()}Page.isApplicationVisible();
    expect(isVisible).toBe(true);
  });

  test('should handle user login', async ({ page }) => {
    await ${this.toCamelCase(baseName).toLowerCase()}Page.enterCredentials('testuser@example.com', 'password123');
    await ${this.toCamelCase(baseName).toLowerCase()}Page.clickButton('login');
    
    const isLoggedIn = await ${this.toCamelCase(baseName).toLowerCase()}Page.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should handle user registration', async ({ page }) => {
    await ${this.toCamelCase(baseName).toLowerCase()}Page.fillRegistrationForm({
      name: 'Test User',
      email: 'newuser@example.com',
      password: 'newpassword123'
    });
    await ${this.toCamelCase(baseName).toLowerCase()}Page.clickButton('register');
    
    const successMessage = await ${this.toCamelCase(baseName).toLowerCase()}Page.getSuccessMessage();
    expect(successMessage).toContain('registered');
  });

  test('should handle search functionality', async ({ page }) => {
    await ${this.toCamelCase(baseName).toLowerCase()}Page.enterSearchCriteria('test search');
    await ${this.toCamelCase(baseName).toLowerCase()}Page.clickButton('search');
    
    const hasResults = await ${this.toCamelCase(baseName).toLowerCase()}Page.hasSearchResults();
    expect(hasResults).toBe(true);
  });

  test('should handle error scenarios', async ({ page }) => {
    // Test with invalid credentials
    await ${this.toCamelCase(baseName).toLowerCase()}Page.enterCredentials('invalid@email.com', 'wrongpassword');
    await ${this.toCamelCase(baseName).toLowerCase()}Page.clickButton('login');
    
    // Should remain on login page or show error
    const isLoggedIn = await ${this.toCamelCase(baseName).toLowerCase()}Page.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot for debugging if test fails
    await ${this.toCamelCase(baseName).toLowerCase()}Page.takeScreenshot(\`test-\${test.info().title}\`);
  });
});
`;
  }

  async generateConfigFiles(outputDir) {
    // Generate Cucumber configuration
    const cucumberConfig = `module.exports = {
  default: {
    features: './features/*.feature',
    require: ['./steps/*.js'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    parallel: 1
  }
};`;

    await fs.writeFile(path.join(outputDir, 'cucumber.js'), cucumberConfig);

    // Generate Playwright configuration
    const playwrightConfig = `const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'reports/playwright-report' }],
    ['json', { outputFile: 'reports/test-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});`;

    await fs.writeFile(path.join(outputDir, 'playwright.config.js'), playwrightConfig);

    // Generate package.json for the generated tests
    const testPackageJson = {
      name: 'generated-tests',
      version: '1.0.0',
      scripts: {
        'test:cucumber': 'cucumber-js',
        'test:playwright': 'playwright test',
        'test:all': 'npm run test:cucumber && npm run test:playwright',
        'report': 'playwright show-report reports/playwright-report'
      },
      dependencies: {
        '@cucumber/cucumber': '^11.3.0',
        '@playwright/test': '^1.40.0',
        'chai': '^5.2.1'
      }
    };

    await fs.writeFile(
      path.join(outputDir, 'package.json'), 
      JSON.stringify(testPackageJson, null, 2)
    );
  }

  toCamelCase(str) {
    return str
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\s/g, '');
  }
}

module.exports = TestGenerator;
