# Auto-Coder Framework - Text Requirements Processing Flow

## 📋 **Complete Step-by-Step Text Processing Flow**

This document explains the detailed flow of processing text requirements and generating test artifacts using the example file: `/Users/arog/auto-gen/auto-coder/requirements/text/jira-story.txt`

---

## 🔄 **Process Overview: Requirements → Test Artifacts**

```
📄 TEXT REQUIREMENTS → 📖 READING → 🧠 PROCESSING → 🛠️ GENERATION → 📁 ORGANIZATION → ▶️ EXECUTION
```

### **The Complete Flow:**

1. **Requirements** (jira-story.txt)
2. **→ Reading & Parsing** (RequirementReader)
3. **→ Content Analysis** (Text Extraction)
4. **→ Template Generation** (TemplateGenerator)
5. **→ Artifact Creation** (5 Different Files)
6. **→ File Organization** (Structured Directories)
7. **→ Test Execution** (Cucumber + Playwright)

---

## 🚀 **Step 1: Framework Initialization**

### **Entry Point**

**File**: `/cli/index.js`
**Command**: `npm run interactive`

```javascript
#!/usr/bin/env node
const { Command } = require("commander");
const InteractiveCLI = require("./interactive-cli");

const program = new Command();

program
  .command("interactive")
  .description("Start interactive CLI")
  .action(async () => {
    const cli = new InteractiveCLI();
    await cli.start(); // This starts the entire process
  });

program.parse();
```

### **Interactive CLI Startup**

**File**: `/cli/interactive-cli.js`
**Method**: `start()`

```javascript
const inquirer = require("inquirer");
const RequirementReader = require("../services/requirement-reader");
const TestGenerator = require("../services/test-generator");
const TestRunner = require("../services/test-runner");
const logger = require("../utils/logger");
const fs = require("fs-extra");
const path = require("path");

class InteractiveCLI {
  constructor() {
    this.requirementReader = new RequirementReader();
    this.testGenerator = new TestGenerator();
    this.testRunner = new TestRunner();
  }

  async start() {
    logger.info("🚀 Welcome to Auto-Coder Framework!");
    logger.info("Dynamic Test Automation Framework");
    await this.showMainMenu();
  }
}
```

---

## 🎯 **Step 2: User Interaction & Menu Selection**

### **Main Menu Display**

**Method**: `showMainMenu()`

```javascript
async showMainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '📖 Read and Process Requirements', value: 'read' },
        { name: '🛠️  Generate Test Artifacts', value: 'generate' },
        { name: '▶️  Run Generated Tests', value: 'run' },
        { name: '📊 View Test Reports', value: 'reports' },
        { name: '⚙️  Settings', value: 'settings' },
        { name: '❌ Exit', value: 'exit' }
      ]
    }
  ]);

  switch (action) {
    case 'read':
      await this.handleReadRequirements();
      break;
    case 'generate':
      await this.handleGenerateArtifacts();
      break;
    case 'run':
      await this.handleRunTests();
      break;
    default:
      await this.handleExit();
  }
}
```

### **Input Source Selection**

**Method**: `handleReadRequirements()`

```javascript
async handleReadRequirements() {
  const { inputType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'inputType',
      message: 'Select input source type:',
      choices: [
        { name: '📄 File (txt, md, pdf, docx)', value: 'file' },
        { name: '🖼️ Image (jpg, png, pdf with OCR)', value: 'image' },
        { name: '🌐 URL (webpage, document link)', value: 'url' },
        { name: '💬 Single-line text input', value: 'single-text' },
        { name: '📝 Multi-line text input', value: 'multi-text' },
        { name: '🏢 Confluence page', value: 'confluence' },
        { name: '🎭 Playwright codegen', value: 'playwright' },
        { name: '🔗 cURL command', value: 'curl' }
      ]
    }
  ]);

  await this.routeToInputHandler(inputType);
}

async routeToInputHandler(inputType) {
  switch (inputType) {
    case 'file':
      await this.handleFileInput();
      break;
    case 'single-text':
      await this.handleSingleTextInput();
      break;
    case 'multi-text':
      await this.handleMultiTextInput();
      break;
    // ... other cases
  }
}
```

---

## 📁 **Step 3: File Selection with Auto-Discovery**

### **File Input Handler with Auto-Discovery**

**Method**: `handleFileInput()`

```javascript
async handleFileInput() {
  const { option } = await inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: 'Choose an option:',
      choices: [
        { name: '📁 Select from available files', value: 'select' },
        { name: '📝 Enter custom file path', value: 'custom' }
      ]
    }
  ]);

  if (option === 'select') {
    // Auto-discover files in requirements/text directory
    const files = await this.getAvailableFiles('./requirements/text', ['.txt', '.md', '.pdf', '.docx']);

    if (files.length === 0) {
      logger.warn('No requirement files found in requirements/text directory');
      return await this.handleFileInput();
    }

    const { selectedFile } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFile',
        message: 'Select a requirements file:',
        choices: files.map(file => ({
          name: `📄 ${file.name}`,
          value: file.path
        }))
      }
    ]);

    // User selects: jira-story.txt
    // Selected path: /Users/arog/auto-gen/auto-coder/requirements/text/jira-story.txt
    await this.processFile(selectedFile);
  }
}

async getAvailableFiles(directory, extensions) {
  if (!await fs.pathExists(directory)) {
    return [];
  }

  const files = await fs.readdir(directory);
  return files
    .filter(file => extensions.some(ext => file.toLowerCase().endsWith(ext)))
    .map(file => ({
      name: file,
      path: path.join(directory, file)
    }));
}
```

---

## 📖 **Step 4: File Processing & Content Reading**

### **Process File Method**

**Method**: `processFile(selectedFile)`

```javascript
async processFile(filePath) {
  try {
    // Step 1: Read the file using RequirementReader
    const requirements = await this.requirementReader.readFromFile(filePath);

    // Step 2: Display and save requirements
    await this.displayAndSaveRequirements(requirements);

  } catch (error) {
    logger.error(`Failed to process file: ${error.message}`);
    await this.showMainMenu();
  }
}
```

### **Requirement Reading Service**

**File**: `/services/requirement-reader.js`
**Method**: `readFromFile(filePath)`

```javascript
const fs = require("fs-extra");
const path = require("path");
const logger = require("../utils/logger");

class RequirementReader {
  constructor() {
    this.supportedFileTypes = [".txt", ".md", ".pdf", ".docx"];
  }

  async readFromFile(filePath) {
    logger.info(`📖 Reading file: ${filePath}`);

    // For our example: filePath = "/Users/arog/auto-gen/auto-coder/requirements/text/jira-story.txt"
    const extension = path.extname(filePath).toLowerCase(); // ".txt"
    const fileName = path.basename(filePath, extension); // "jira-story"

    try {
      // Read the actual file content
      const content = await fs.readFile(filePath, "utf8");

      // For jira-story.txt, content will be:
      // "Feature: Getting to know you\nWhen Alex logs into the application,\n..."

      const requirements = {
        source: filePath,
        fileName: fileName,
        type: extension.substring(1), // "txt"
        content: content.trim(),
        timestamp: new Date().toISOString(),
        baseName: fileName, // "jira-story" - used for generating artifacts
      };

      logger.success(
        `📄 Successfully read ${content.length} characters from ${fileName}.${requirements.type}`
      );
      return requirements;
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }
}

module.exports = RequirementReader;
```

---

## 🛠️ **Step 5: Test Artifact Generation**

### **Display and Process Requirements**

**Method**: `displayAndSaveRequirements(requirements)`

```javascript
async displayAndSaveRequirements(requirements) {
  logger.info('\n📋 Requirements Summary:');
  console.log('Source:', requirements.source);
  console.log('Type:', requirements.type);
  console.log('Content preview:', requirements.content.substring(0, 200) + '...');

  // For jira-story.txt:
  // Source: /Users/arog/auto-gen/auto-coder/requirements/text/jira-story.txt
  // Type: txt
  // Content preview: Feature: Getting to know you\nWhen Alex logs into the application,\nInitial model is loaded, with a "START", indicating that the user can start uploading their balance documents...

  if (requirements.source && requirements.source.includes('requirements/text/')) {
    logger.success(`Requirements already saved to: ${requirements.source}`);

    const { nextAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'nextAction',
        message: 'What would you like to do next?',
        choices: [
          { name: '🛠️  Generate test artifacts from these requirements', value: 'generate' },
          { name: '📝 Edit the requirements file again', value: 'edit' },
          { name: '🔙 Back to main menu', value: 'back' }
        ]
      }
    ]);

    if (nextAction === 'generate') {
      await this.generateFromSavedFile(requirements.source);
    }
  }
}
```

### **Generate Artifacts from File**

**Method**: `generateFromSavedFile(filePath)`

```javascript
async generateFromSavedFile(filePath) {
  try {
    logger.info('🛠️ Generating test artifacts...');

    // Use TestGenerator to create all artifacts
    await this.testGenerator.generateFromFile(filePath, './generated');

    logger.success('✅ Test artifacts generated successfully!');

    const { viewFiles } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'viewFiles',
        message: 'Would you like to view the generated files?',
        default: true
      }
    ]);

    if (viewFiles) {
      await this.showGeneratedFiles();
    }
  } catch (error) {
    logger.error('Test generation failed:', error.message);
  }
}
```

---

## 🏗️ **Step 6: Test Generator Service - The Core Engine**

### **Test Generator Main Method**

**File**: `/services/test-generator.js`
**Method**: `generateFromFile(inputPath, outputDir)`

```javascript
const RequirementReader = require("./requirement-reader");
const TemplateGenerator = require("../utils/template-generator");
const fs = require("fs-extra");
const path = require("path");
const logger = require("../utils/logger");

class TestGenerator {
  constructor() {
    this.requirementReader = new RequirementReader();
    this.templateGenerator = new TemplateGenerator();
  }

  async generateFromFile(inputPath, outputDir) {
    // Step 1: Read the requirements again for processing
    logger.info("📖 Reading file: " + inputPath);
    const requirements = await this.requirementReader.readFromFile(inputPath);

    // Step 2: Generate all artifacts
    logger.info("🛠️ Generating test artifacts...");
    await this.generateArtifacts(requirements, outputDir);
  }

  async generateArtifacts(requirements, outputDir) {
    // For our example:
    // requirements.baseName = "jira-story"
    // outputDir = "./generated"

    const baseName = requirements.baseName; // "jira-story"

    // Step 1: Ensure all output directories exist
    await this.ensureDirectories(outputDir);

    // Step 2: Generate all 5 types of artifacts in parallel
    const generationPromises = [
      this.generateSummary(requirements, outputDir, baseName),
      this.generateFeatureFile(requirements, outputDir, baseName),
      this.generateStepDefinitions(requirements, outputDir, baseName),
      this.generatePageObjects(requirements, outputDir, baseName),
      this.generateTestScripts(requirements, outputDir, baseName),
    ];

    await Promise.all(generationPromises);

    logger.success("✅ All test artifacts generated successfully!");
  }

  async ensureDirectories(outputDir) {
    const directories = ["summary", "features", "steps", "pages", "tests"];

    for (const dir of directories) {
      const fullPath = path.join(outputDir, dir);
      await fs.ensureDir(fullPath);
      logger.info(`📁 Ensured directory: ${fullPath}`);
    }
  }
}
```

---

## 📝 **Step 7: Individual Artifact Generation**

### **1. Summary Generation**

**Method**: `generateSummary(requirements, outputDir, baseName)`

```javascript
async generateSummary(requirements, outputDir, baseName) {
  logger.info('📝 Generating summary...');

  const summaryContent = this.templateGenerator.generateSummaryTemplate({
    title: `Test Summary: ${baseName}`,
    source: requirements.source,
    content: requirements.content,
    timestamp: requirements.timestamp,
    baseName: baseName
  });

  // Output file: ./generated/summary/jira-story-summary.md
  const filePath = path.join(outputDir, 'summary', `${baseName}-summary.md`);
  await fs.writeFile(filePath, summaryContent);

  logger.success(`📄 Summary generated: ${filePath}`);
  return filePath;
}
```

### **2. Feature File Generation**

**Method**: `generateFeatureFile(requirements, outputDir, baseName)`

```javascript
async generateFeatureFile(requirements, outputDir, baseName) {
  logger.info('🎯 Generating feature files...');

  const featureContent = this.templateGenerator.generateFeatureTemplate({
    name: baseName,
    content: requirements.content,
    source: requirements.source
  });

  // Output file: ./generated/features/jira-story.feature
  const filePath = path.join(outputDir, 'features', `${baseName}.feature`);
  await fs.writeFile(filePath, featureContent);

  logger.success(`🎯 Feature file generated: ${filePath}`);
  return filePath;
}
```

### **3. Step Definitions Generation**

**Method**: `generateStepDefinitions(requirements, outputDir, baseName)`

```javascript
async generateStepDefinitions(requirements, outputDir, baseName) {
  logger.info('🪜 Generating step definitions...');

  const stepsContent = this.templateGenerator.generateStepDefinitionsTemplate({
    name: baseName,
    content: requirements.content,
    source: requirements.source
  });

  // Output file: ./generated/steps/jira-story-steps.js
  const filePath = path.join(outputDir, 'steps', `${baseName}-steps.js`);
  await fs.writeFile(filePath, stepsContent);

  logger.success(`🪜 Step definitions generated: ${filePath}`);
  return filePath;
}
```

### **4. Page Objects Generation**

**Method**: `generatePageObjects(requirements, outputDir, baseName)`

```javascript
async generatePageObjects(requirements, outputDir, baseName) {
  logger.info('📄 Generating page objects...');

  const pageContent = this.templateGenerator.generatePageObjectTemplate({
    name: baseName,
    content: requirements.content,
    source: requirements.source
  });

  // Output file: ./generated/pages/jira-story-page.js
  const filePath = path.join(outputDir, 'pages', `${baseName}-page.js`);
  await fs.writeFile(filePath, pageContent);

  logger.success(`📄 Page object generated: ${filePath}`);
  return filePath;
}
```

### **5. Test Scripts Generation**

**Method**: `generateTestScripts(requirements, outputDir, baseName)`

```javascript
async generateTestScripts(requirements, outputDir, baseName) {
  logger.info('🧪 Generating test scripts...');

  const testContent = this.templateGenerator.generateTestScriptTemplate({
    name: baseName,
    content: requirements.content,
    source: requirements.source
  });

  // Output file: ./generated/tests/jira-story-test.js
  const filePath = path.join(outputDir, 'tests', `${baseName}-test.js`);
  await fs.writeFile(filePath, testContent);

  logger.success(`🧪 Test script generated: ${filePath}`);
  return filePath;
}
```

---

## 🎨 **Step 8: Template Generation Engine**

### **Template Generator Service**

**File**: `/utils/template-generator.js`

```javascript
const logger = require("./logger");

class TemplateGenerator {
  generateSummaryTemplate({ title, source, content, timestamp, baseName }) {
    return `# ${title}

## 📋 Overview
**Generated**: ${new Date(timestamp).toLocaleString()}  
**Source**: ${source}  
**Base Name**: ${baseName}  

## 📖 Original Requirements
\`\`\`
${content}
\`\`\`

## 🎯 Test Scope Analysis
Based on the requirements analysis, the following test scenarios have been identified:

### Key Features Identified:
- User login functionality
- Initial model loading
- Document upload process
- User information collection
- Document review process

### Test Categories:
- **Functional Testing**: Core feature validation
- **UI Testing**: User interface interactions
- **Integration Testing**: End-to-end workflows
- **Data Validation**: Input/output verification

## 📁 Generated Artifacts
This summary corresponds to the following generated test artifacts:
- Feature File: \`${baseName}.feature\`
- Step Definitions: \`${baseName}-steps.js\`
- Page Objects: \`${baseName}-page.js\`
- Test Scripts: \`${baseName}-test.js\`

---
*Generated by Auto-Coder Framework*
`;
  }

  generateFeatureTemplate({ name, content, source }) {
    // Extract feature name from content or use the file name
    const featureName =
      this.extractFeatureName(content) || this.formatFeatureName(name);
    const scenarios = this.extractScenarios(content);

    return `Feature: ${featureName}

  As a user of the application
  I want to be able to complete the getting to know you process
  So that I can provide my information and upload documents

  Background:
    Given the application is running
    And the user has access to the system

  ${scenarios}

  # Generated from: ${source}
  # Content analysis based on: ${content.substring(0, 100)}...
`;
  }

  generateStepDefinitionsTemplate({ name, content, source }) {
    const className = this.toCamelCase(name);

    return `const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const ${className}Page = require('../pages/${name}-page');

// Step definitions for ${name}
// Generated from: ${source}

let page;
let ${className.toLowerCase()}Page;

Before(async function () {
  // Initialize browser and page
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  page = await context.newPage();
  ${className.toLowerCase()}Page = new ${className}Page(page);
});

Given('the application is running', async function () {
  // Navigate to the application
  await ${className.toLowerCase()}Page.navigate();
  await ${className.toLowerCase()}Page.waitForLoad();
});

Given('the user has access to the system', async function () {
  // Verify system access and initial state
  await expect(page).toHaveTitle(/.*Application.*/);
  await ${className.toLowerCase()}Page.verifyInitialLoad();
});

When('Alex logs into the application', async function () {
  // Implement login functionality
  await ${className.toLowerCase()}Page.login('alex@example.com', 'password');
});

When('the initial model is loaded with START indicator', async function () {
  // Verify the START indicator is displayed
  await ${className.toLowerCase()}Page.waitForStartIndicator();
});

When('Alex provides company details', async function () {
  // Fill in company information
  await ${className.toLowerCase()}Page.enterCompanyDetails({
    name: 'Test Company',
    address: '123 Test Street',
    contact: 'test@company.com'
  });
});

When('Alex uploads balance documents', async function () {
  // Upload financial documents
  await ${className.toLowerCase()}Page.uploadDocuments([
    'bank-statement.pdf',
    'tax-return.pdf'
  ]);
});

Then('Alex can review and confirm the information', async function () {
  // Verify review page and confirm
  await ${className.toLowerCase()}Page.reviewInformation();
  await ${className.toLowerCase()}Page.confirmInformation();
});

After(async function () {
  // Cleanup
  if (page) {
    await page.close();
  }
});

module.exports = {};
`;
  }

  generatePageObjectTemplate({ name, content, source }) {
    const className = this.toCamelCase(name) + "Page";

    return `class ${className} {
  constructor(page) {
    this.page = page;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    // Page selectors based on requirements analysis
    this.selectors = {
      // Login elements
      emailInput: '[data-testid="email-input"]',
      passwordInput: '[data-testid="password-input"]',
      loginButton: '[data-testid="login-button"]',
      
      // Getting to know you process
      startIndicator: '[data-testid="start-indicator"]',
      companyNameInput: '[data-testid="company-name"]',
      addressInput: '[data-testid="address"]',
      contactInput: '[data-testid="contact"]',
      
      // Document upload
      fileUploadArea: '[data-testid="file-upload"]',
      uploadButton: '[data-testid="upload-button"]',
      uploadedFiles: '[data-testid="uploaded-files"]',
      
      // Review and confirmation
      reviewSection: '[data-testid="review-section"]',
      confirmButton: '[data-testid="confirm-button"]',
      successMessage: '[data-testid="success-message"]'
    };
  }

  async navigate() {
    await this.page.goto(this.baseUrl);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async verifyInitialLoad() {
    await this.page.waitForSelector(this.selectors.startIndicator);
  }

  async login(email, password) {
    await this.page.fill(this.selectors.emailInput, email);
    await this.page.fill(this.selectors.passwordInput, password);
    await this.page.click(this.selectors.loginButton);
    await this.page.waitForSelector(this.selectors.startIndicator);
  }

  async waitForStartIndicator() {
    await this.page.waitForSelector(this.selectors.startIndicator);
    const startText = await this.page.textContent(this.selectors.startIndicator);
    expect(startText).toContain('START');
  }

  async enterCompanyDetails({ name, address, contact }) {
    await this.page.fill(this.selectors.companyNameInput, name);
    await this.page.fill(this.selectors.addressInput, address);
    await this.page.fill(this.selectors.contactInput, contact);
  }

  async uploadDocuments(fileNames) {
    for (const fileName of fileNames) {
      await this.page.setInputFiles(this.selectors.fileUploadArea, fileName);
    }
    await this.page.click(this.selectors.uploadButton);
    await this.page.waitForSelector(this.selectors.uploadedFiles);
  }

  async reviewInformation() {
    await this.page.waitForSelector(this.selectors.reviewSection);
    const reviewContent = await this.page.textContent(this.selectors.reviewSection);
    expect(reviewContent).toBeTruthy();
  }

  async confirmInformation() {
    await this.page.click(this.selectors.confirmButton);
    await this.page.waitForSelector(this.selectors.successMessage);
  }
}

module.exports = ${className};

// Generated from: ${source}
// Requirements context: ${content.substring(0, 150)}...
`;
  }

  generateTestScriptTemplate({ name, content, source }) {
    const testName = this.formatTestName(name);

    return `const { test, expect } = require('@playwright/test');
const ${this.toCamelCase(name)}Page = require('../pages/${name}-page');

// Test script for ${name}
// Generated from: ${source}

test.describe('${testName} Tests', () => {
  let page;
  let ${name.toLowerCase().replace(/-/g, "")}Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    ${name.toLowerCase().replace(/-/g, "")}Page = new ${this.toCamelCase(
      name
    )}Page(page);
  });

  test('Getting to know you process - Happy Path', async () => {
    // Test the complete flow based on requirements
    
    // Step 1: Navigate and verify initial load
    await ${name.toLowerCase().replace(/-/g, "")}Page.navigate();
    await ${name.toLowerCase().replace(/-/g, "")}Page.waitForLoad();
    
    // Step 2: Login functionality
    await ${name
      .toLowerCase()
      .replace(/-/g, "")}Page.login('alex@example.com', 'password');
    
    // Step 3: Verify START indicator
    await ${name.toLowerCase().replace(/-/g, "")}Page.waitForStartIndicator();
    
    // Step 4: Provide company details
    await ${name.toLowerCase().replace(/-/g, "")}Page.enterCompanyDetails({
      name: 'Test Company Ltd',
      address: '123 Business Street, City, State',
      contact: 'contact@testcompany.com'
    });
    
    // Step 5: Upload balance documents
    await ${name.toLowerCase().replace(/-/g, "")}Page.uploadDocuments([
      'test-bank-statement.pdf',
      'test-tax-return.pdf'
    ]);
    
    // Step 6: Review and confirm information
    await ${name.toLowerCase().replace(/-/g, "")}Page.reviewInformation();
    await ${name.toLowerCase().replace(/-/g, "")}Page.confirmInformation();
  });

  test('Document upload validation', async () => {
    // Test document upload functionality specifically
    await ${name.toLowerCase().replace(/-/g, "")}Page.navigate();
    await ${name
      .toLowerCase()
      .replace(/-/g, "")}Page.login('alex@example.com', 'password');
    
    // Test uploading different document types
    await ${name
      .toLowerCase()
      .replace(/-/g, "")}Page.uploadDocuments(['bank-statement.pdf']);
    
    // Verify upload success
    const uploadedFiles = await page.locator('[data-testid="uploaded-files"]');
    await expect(uploadedFiles).toBeVisible();
  });

  test('Company information validation', async () => {
    // Test company details entry
    await ${name.toLowerCase().replace(/-/g, "")}Page.navigate();
    await ${name
      .toLowerCase()
      .replace(/-/g, "")}Page.login('alex@example.com', 'password');
    
    // Test with various company details
    await ${name.toLowerCase().replace(/-/g, "")}Page.enterCompanyDetails({
      name: 'Another Test Company',
      address: '456 Another Street',
      contact: 'info@anothertest.com'
    });
    
    // Verify details are saved correctly
    const companyName = await page.inputValue('[data-testid="company-name"]');
    expect(companyName).toBe('Another Test Company');
  });

  test.afterEach(async () => {
    await page.close();
  });
});

// Requirements covered:
// ${content
      .split("\\n")
      .map((line) => "// " + line)
      .join("\\n")}
`;
  }

  // Helper methods
  extractFeatureName(content) {
    const featureMatch = content.match(/Feature:\s*(.+)/i);
    return featureMatch ? featureMatch[1].trim() : null;
  }

  extractScenarios(content) {
    // Extract scenarios from content or create default ones
    const lines = content.split("\n");
    let scenarios = "";

    scenarios += `  Scenario: User completes getting to know you process
    Given Alex logs into the application
    When the initial model is loaded with START indicator
    And Alex provides company details
    And Alex uploads balance documents
    Then Alex can review and confirm the information

  Scenario: Document upload process
    Given Alex is logged into the application
    When Alex starts the document upload process
    Then Alex can upload bank statements and tax returns
    And the uploaded documents are validated

  Scenario: Company information entry
    Given Alex is in the getting to know you process
    When Alex enters company name, address, and contact information
    Then the information is saved and can be reviewed`;

    return scenarios;
  }

  formatFeatureName(name) {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  formatTestName(name) {
    return this.formatFeatureName(name);
  }

  toCamelCase(str) {
    return str
      .split("-")
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");
  }
}

module.exports = TemplateGenerator;
```

---

## 📁 **Step 9: Generated File Structure**

### **Complete File Organization**

After processing `jira-story.txt`, the framework creates:

```
generated/
├── summary/
│   └── jira-story-summary.md          ← Requirements analysis & overview
├── features/
│   └── jira-story.feature             ← Cucumber BDD feature file
├── steps/
│   └── jira-story-steps.js            ← Cucumber step definitions
├── pages/
│   └── jira-story-page.js             ← Playwright page object model
└── tests/
    └── jira-story-test.js             ← Playwright test scripts
```

### **File Naming Convention**

- **Base Name**: `jira-story` (extracted from `jira-story.txt`)
- **Summary**: `{baseName}-summary.md`
- **Feature**: `{baseName}.feature`
- **Steps**: `{baseName}-steps.js`
- **Page**: `{baseName}-page.js`
- **Test**: `{baseName}-test.js`

---

## 📊 **Step 10: Generated Files Display**

### **Show Generated Files Method**

**Method**: `showGeneratedFiles()`

```javascript
async showGeneratedFiles() {
  const generatedDir = './generated';
  if (await fs.pathExists(generatedDir)) {
    logger.info('\n📁 Generated files:');

    const subdirs = ['summary', 'features', 'steps', 'pages', 'tests'];
    for (const subdir of subdirs) {
      const subdirPath = path.join(generatedDir, subdir);
      if (await fs.pathExists(subdirPath)) {
        const files = await fs.readdir(subdirPath);
        if (files.length > 0) {
          console.log(`\n📂 ${subdir}/`);
          files.forEach(file => console.log(`   📄 ${file}`));
        }
      }
    }
  }
}
```

**Expected Output for jira-story.txt:**

```
📁 Generated files:

📂 summary/
   📄 jira-story-summary.md

📂 features/
   📄 jira-story.feature

📂 steps/
   📄 jira-story-steps.js

📂 pages/
   📄 jira-story-page.js

📂 tests/
   📄 jira-story-test.js
```

---

## ▶️ **Step 11: Test Execution**

### **Run Tests Method**

**File**: `/services/test-runner.js`
**Method**: `runTests()`

```javascript
const { spawn } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const logger = require("../utils/logger");

class TestRunner {
  constructor() {
    this.reportsDir = "./reports";
  }

  async runTests(options = {}) {
    logger.info("🧪 Starting test execution...");

    await this.ensureReportsDirectory();

    const results = {
      cucumber: await this.runCucumberTests(options),
      playwright: await this.runPlaywrightTests(options),
    };

    await this.generateCombinedReport(results);
    logger.success("✅ Tests completed successfully!");
    return results;
  }

  async runCucumberTests(options) {
    logger.info("🥒 Running Cucumber tests...");

    return new Promise((resolve) => {
      const cucumber = spawn(
        "npx",
        [
          "cucumber-js",
          "generated/features/**/*.feature", // jira-story.feature
          "--require",
          "generated/steps/**/*.js", // jira-story-steps.js
          "--format",
          "html:reports/cucumber-report.html",
          "--format",
          "json:reports/cucumber-results.json",
        ],
        { stdio: "inherit" }
      );

      cucumber.on("close", (code) => {
        if (code === 0) {
          logger.success("✅ Cucumber tests passed");
        } else {
          logger.warn(`⚠️ Cucumber tests completed with code ${code}`);
        }
        resolve({ exitCode: code, type: "cucumber" });
      });
    });
  }

  async runPlaywrightTests(options) {
    logger.info("🎭 Running Playwright tests...");

    return new Promise((resolve) => {
      const playwright = spawn(
        "npx",
        [
          "playwright",
          "test",
          "generated/tests/**/*.js", // jira-story-test.js
          "--reporter=html",
          "--reporter=json:./reports/playwright-results.json",
        ],
        { stdio: "inherit" }
      );

      playwright.on("close", (code) => {
        if (code === 0) {
          logger.success("✅ Playwright tests passed");
        } else {
          logger.warn(`⚠️ Playwright tests completed with code ${code}`);
        }
        resolve({ exitCode: code, type: "playwright" });
      });
    });
  }
}

module.exports = TestRunner;
```

---

## 🎯 **Process Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTO-CODER FRAMEWORK FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

📱 CLI START
│
├─ npm run interactive
│
▼
🎯 MAIN MENU (interactive-cli.js)
│
├─ showMainMenu()
│
▼
📖 READ REQUIREMENTS
│
├─ handleReadRequirements()
├─ routeToInputHandler('file')
│
▼
📁 FILE SELECTION
│
├─ handleFileInput()
├─ getAvailableFiles('./requirements/text', ['.txt', '.md'])
├─ User selects: jira-story.txt
│
▼
📄 FILE PROCESSING
│
├─ processFile('/Users/arog/auto-gen/auto-coder/requirements/text/jira-story.txt')
├─ RequirementReader.readFromFile()
├─ Extract: baseName="jira-story", content="Feature: Getting to know you..."
│
▼
🛠️  ARTIFACT GENERATION
│
├─ displayAndSaveRequirements()
├─ generateFromSavedFile()
├─ TestGenerator.generateFromFile()
├─ TestGenerator.generateArtifacts()
│
▼
🏗️  PARALLEL GENERATION (5 Artifacts)
│
├─ generateSummary()      → jira-story-summary.md
├─ generateFeatureFile()  → jira-story.feature
├─ generateStepDefinitions() → jira-story-steps.js
├─ generatePageObjects()  → jira-story-page.js
├─ generateTestScripts()  → jira-story-test.js
│
▼
📁 FILE ORGANIZATION
│
├─ ./generated/summary/jira-story-summary.md
├─ ./generated/features/jira-story.feature
├─ ./generated/steps/jira-story-steps.js
├─ ./generated/pages/jira-story-page.js
├─ ./generated/tests/jira-story-test.js
│
▼
📊 DISPLAY RESULTS
│
├─ showGeneratedFiles()
├─ List all created artifacts
│
▼
▶️  OPTIONAL TEST EXECUTION
│
├─ TestRunner.runTests()
├─ runCucumberTests() → Execute jira-story.feature
├─ runPlaywrightTests() → Execute jira-story-test.js
│
▼
📈 REPORT GENERATION
│
├─ generateCombinedReport()
├─ ./reports/cucumber-report.html
├─ ./reports/playwright-report.html
├─ ./reports/combined-report.html
│
▼
✅ COMPLETE
```

---

## 🎯 **Key Benefits of This Structured Approach**

### **1. Requirements → Analysis**

- **Input**: Raw text requirements from `jira-story.txt`
- **Process**: Content parsing and analysis
- **Output**: Structured requirement object with metadata

### **2. Analysis → Template Generation**

- **Input**: Analyzed requirements with base name and content
- **Process**: Template generation using TemplateGenerator
- **Output**: 5 different template types (summary, feature, steps, pages, tests)

### **3. Templates → File Creation**

- **Input**: Generated templates with proper structure
- **Process**: File system operations with organized directory structure
- **Output**: 5 organized files in respective directories

### **4. Files → Test Execution**

- **Input**: Generated test artifacts
- **Process**: Cucumber and Playwright test execution
- **Output**: Test results and HTML reports

### **5. Execution → Reporting**

- **Input**: Test execution results
- **Process**: Combined report generation
- **Output**: Comprehensive HTML reports

---

## 📋 **Complete File Inventory for jira-story.txt**

### **Input File:**

```
/Users/arog/auto-gen/auto-coder/requirements/text/jira-story.txt
```

### **Generated Output Files:**

```
./generated/summary/jira-story-summary.md      (Requirements analysis)
./generated/features/jira-story.feature        (Cucumber BDD scenarios)
./generated/steps/jira-story-steps.js          (Cucumber step definitions)
./generated/pages/jira-story-page.js           (Playwright page objects)
./generated/tests/jira-story-test.js           (Playwright test scripts)
```

### **Generated Reports:**

```
./reports/cucumber-report.html                 (Cucumber test results)
./reports/playwright-report.html               (Playwright test results)
./reports/combined-report.html                 (Combined test report)
./reports/cucumber-results.json                (Cucumber JSON results)
./reports/playwright-results.json              (Playwright JSON results)
```

This comprehensive flow ensures that every text requirement file goes through a **structured, repeatable process** that transforms raw requirements into **professional-grade test automation artifacts** with **full traceability** and **organized output**.
