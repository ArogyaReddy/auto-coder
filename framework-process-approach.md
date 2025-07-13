# Auto-Coder Framework - Step-by-Step Process Flow

## 📋 Complete Technical Documentation

This document provides a comprehensive step-by-step breakdown of how the Auto-Coder Framework processes requirements and generates test artifacts, including all file names, paths, functions, methods, and code snippets.

---

## 🚀 **Step 1: Framework Initialization and Startup**

### **Entry Point**

- **File**: `/cli/index.js`
- **Command**: `npm run interactive` or `node cli/index.js interactive`

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
    await cli.start();
  });

program.parse();
```

### **Interactive CLI Initialization**

- **File**: `/cli/interactive-cli.js`
- **Class**: `InteractiveCLI`
- **Method**: `constructor()`

```javascript
const inquirer = require("inquirer");
const RequirementReader = require("../services/requirement-reader");
const TestGenerator = require("../services/test-generator");
const TestRunner = require("../services/test-runner");
const logger = require("../utils/logger");

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

## 🎯 **Step 2: User Interaction and Menu System**

### **Main Menu Display**

- **File**: `/cli/interactive-cli.js`
- **Method**: `showMainMenu()`

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
    // ...other cases
  }
}
```

### **Input Source Selection**

- **Method**: `handleReadRequirements()`

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
```

---

## 📁 **Step 3: File Input Processing with Auto-Discovery**

### **File Input Handler**

- **Method**: `handleFileInput()`
- **Auto-Discovery Function**: `getAvailableFiles()`

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

## 📝 **Step 4: Text Input with VS Code Integration**

### **Single-Line Text Input**

- **Method**: `handleSingleTextInput()`

```javascript
async handleSingleTextInput() {
  const { option } = await inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: 'Choose input method:',
      choices: [
        { name: '⌨️  Enter text directly in CLI', value: 'direct' },
        { name: '🛠️ Use VS Code editor', value: 'editor' }
      ]
    }
  ]);

  if (option === 'editor') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `text-input-${timestamp}.md`;
    const filePath = path.join('./requirements/text', fileName);

    await fs.ensureDir('./requirements/text');
    await fs.writeFile(filePath, '# Requirements\n\nEnter your requirements here...\n');

    await this.openEditor(filePath);
    // Process continues after user completes editing
  }
}
```

### **Multi-Line Text Input with BDD Template**

- **Method**: `handleMultiTextInput()`

```javascript
async handleMultiTextInput() {
  logger.info('Creating a comprehensive BDD requirements template...');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `requirements-${timestamp}.md`;
  const filePath = path.join('./requirements/text', fileName);

  const bddTemplate = `# Test Requirements Document
## Generated: ${new Date().toLocaleString()}

## Overview
<!-- Describe the feature or functionality being tested -->

## User Stories
### User Story 1:
**As a** [user type]
**I want** [functionality]
**So that** [benefit/value]

### Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Test Scenarios
### Scenario 1: [Happy Path]
**Given** [initial context]
**When** [action performed]
**Then** [expected outcome]

### Scenario 2: [Edge Case]
**Given** [initial context]
**When** [action performed]
**Then** [expected outcome]

## Additional Notes
<!-- Any additional information, constraints, or considerations -->
`;

  await fs.ensureDir('./requirements/text');
  await fs.writeFile(filePath, bddTemplate);

  logger.success(`📄 Created requirements file: ${fileName}`);
  logger.info('🛠️ Opening VS Code editor...');

  await this.openEditor(filePath);

  const { status } = await inquirer.prompt([
    {
      type: 'list',
      name: 'status',
      message: 'File status:',
      choices: [
        { name: '✅ DONE - Process the requirements', value: 'done' },
        { name: '🔄 Continue editing', value: 'continue' }
      ]
    }
  ]);

  if (status === 'done') {
    await this.processFile(filePath);
  }
}
```

### **VS Code Editor Integration**

- **Method**: `openEditor()`

```javascript
async openEditor(filePath) {
  const { spawn } = require('child_process');

  return new Promise((resolve, reject) => {
    const editor = spawn('code', [filePath], {
      stdio: 'inherit',
      detached: true
    });

    editor.on('error', (error) => {
      logger.warn('VS Code not found, trying VS Code Insiders...');
      const editorInsiders = spawn('code-insiders', [filePath], {
        stdio: 'inherit',
        detached: true
      });

      editorInsiders.on('error', () => {
        logger.error('Neither VS Code nor VS Code Insiders found');
        reject(new Error('No suitable editor found'));
      });

      editorInsiders.on('spawn', () => {
        logger.success('File opened in VS Code Insiders');
        resolve();
      });
    });

    editor.on('spawn', () => {
      logger.success('File opened in VS Code');
      resolve();
    });
  });
}
```

---

## 🖼️ **Step 5: Image Processing with OCR**

### **Image Input Handler**

- **Method**: `handleImageInput()`
- **File**: `/cli/interactive-cli.js`

```javascript
async handleImageInput() {
  const images = await this.getAvailableFiles('./requirements/images', ['.jpg', '.jpeg', '.png', '.gif', '.bmp']);

  if (images.length === 0) {
    logger.warn('No image files found in requirements/images directory');
    const { customPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customPath',
        message: 'Enter the path to your image file:'
      }
    ]);
    await this.processImage(customPath);
  } else {
    const { selectedImage } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedImage',
        message: 'Select an image file:',
        choices: images.map(image => ({
          name: `🖼️  ${image.name}`,
          value: image.path
        }))
      }
    ]);

    await this.processImage(selectedImage);
  }
}
```

---

## 🔍 **Step 6: Requirement Reading and Processing**

### **Requirement Reader Service**

- **File**: `/services/requirement-reader.js`
- **Class**: `RequirementReader`

```javascript
class RequirementReader {
  constructor() {
    this.supportedFileTypes = [".txt", ".md", ".pdf", ".docx"];
    this.supportedImageTypes = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
  }

  async readFromFile(filePath) {
    logger.info(`📖 Reading file: ${filePath}`);

    const extension = path.extname(filePath).toLowerCase();
    const content = await fs.readFile(filePath, "utf8");

    return {
      source: filePath,
      type: extension.substring(1),
      content: content,
      timestamp: new Date().toISOString(),
    };
  }

  async readFromImage(imagePath) {
    logger.info(`🖼️ Processing image with OCR: ${imagePath}`);

    const { createWorker } = require("tesseract.js");
    const worker = await createWorker("eng");

    try {
      const {
        data: { text },
      } = await worker.recognize(imagePath);
      await worker.terminate();

      return {
        source: imagePath,
        type: "image",
        content: text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      await worker.terminate();
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  async readFromUrl(url) {
    logger.info(`🌐 Fetching content from URL: ${url}`);

    const axios = require("axios");
    const cheerio = require("cheerio");

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Extract meaningful text content
      const content = $("body").text().replace(/\s+/g, " ").trim();

      return {
        source: url,
        type: "url",
        content: content,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`URL fetch failed: ${error.message}`);
    }
  }
}
```

---

## 🛠️ **Step 7: Test Artifact Generation**

### **Test Generator Service**

- **File**: `/services/test-generator.js`
- **Class**: `TestGenerator`

```javascript
class TestGenerator {
  constructor() {
    this.templateGenerator = new TemplateGenerator();
  }

  async generateFromFile(inputPath, outputDir) {
    const requirements = await this.requirementReader.readFromFile(inputPath);
    await this.generateArtifacts(requirements, outputDir);
  }

  async generateArtifacts(requirements, outputDir) {
    logger.info("🛠️ Generating test artifacts...");

    const baseName = this.extractBaseName(requirements.source);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Create output directories
    await this.ensureDirectories(outputDir);

    // Generate all artifacts
    await Promise.all([
      this.generateSummary(requirements, outputDir, baseName),
      this.generateFeatureFile(requirements, outputDir, baseName),
      this.generateStepDefinitions(requirements, outputDir, baseName),
      this.generatePageObjects(requirements, outputDir, baseName),
      this.generateTestScripts(requirements, outputDir, baseName),
    ]);

    logger.success("✅ All test artifacts generated successfully!");
  }

  async generateSummary(requirements, outputDir, baseName) {
    logger.info("📝 Generating summary...");

    const summary = this.templateGenerator.generateSummaryTemplate({
      title: `Test Summary: ${baseName}`,
      source: requirements.source,
      content: requirements.content,
      timestamp: requirements.timestamp,
    });

    const filePath = path.join(outputDir, "summary", `${baseName}-summary.md`);
    await fs.writeFile(filePath, summary);
    return filePath;
  }

  async generateFeatureFile(requirements, outputDir, baseName) {
    logger.info("🎯 Generating feature files...");

    const feature = this.templateGenerator.generateFeatureTemplate({
      name: baseName,
      content: requirements.content,
    });

    const filePath = path.join(outputDir, "features", `${baseName}.feature`);
    await fs.writeFile(filePath, feature);
    return filePath;
  }

  async generateStepDefinitions(requirements, outputDir, baseName) {
    logger.info("🪜 Generating step definitions...");

    const steps = this.templateGenerator.generateStepDefinitionsTemplate({
      name: baseName,
      content: requirements.content,
    });

    const filePath = path.join(outputDir, "steps", `${baseName}-steps.js`);
    await fs.writeFile(filePath, steps);
    return filePath;
  }
}
```

---

## 📄 **Step 8: Template Generation**

### **Template Generator Utility**

- **File**: `/utils/template-generator.js`
- **Class**: `TemplateGenerator`

```javascript
class TemplateGenerator {
  generateFeatureTemplate({ name, content }) {
    return `Feature: ${this.formatFeatureName(name)}

Background:
  Given the application is running
  And the user has access to the system

Scenario: Basic functionality test
  Given the user is on the main page
  When the user performs the required action
  Then the expected result should be displayed

# Generated from: ${name}
# Content analysis: ${content.substring(0, 100)}...
`;
  }

  generateStepDefinitionsTemplate({ name, content }) {
    return `const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Step definitions for ${name}
// Generated from requirements analysis

Given('the application is running', async function () {
  // Initialize application
  await this.page.goto('${this.baseUrl}');
});

Given('the user has access to the system', async function () {
  // Verify system access
  await expect(this.page).toHaveTitle(/.*Application.*/);
});

When('the user performs the required action', async function () {
  // Implement user action based on requirements
  // TODO: Analyze requirements: ${content.substring(0, 100)}...
});

Then('the expected result should be displayed', async function () {
  // Verify expected outcome
  // TODO: Define expected result based on requirements
});

Before(async function () {
  // Setup before each scenario
});

After(async function () {
  // Cleanup after each scenario
});

module.exports = {};
`;
  }

  generatePageObjectTemplate({ name, content }) {
    const className = this.toCamelCase(name) + "Page";

    return `class ${className} {
  constructor(page) {
    this.page = page;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    // Page elements - to be defined based on requirements
    this.selectors = {
      // TODO: Define selectors based on requirements analysis
    };
  }

  async navigate() {
    await this.page.goto(this.baseUrl);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // Methods to be implemented based on requirements
  // Requirements context: ${content.substring(0, 150)}...
}

module.exports = ${className};
`;
  }
}
```

---

## ▶️ **Step 9: Test Execution**

### **Test Runner Service**

- **File**: `/services/test-runner.js`
- **Class**: `TestRunner`

```javascript
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
    return results;
  }

  async runCucumberTests(options) {
    logger.info("🥒 Running Cucumber tests...");

    const { spawn } = require("child_process");

    return new Promise((resolve) => {
      const cucumber = spawn(
        "npx",
        [
          "cucumber-js",
          "generated/features/**/*.feature",
          "--require",
          "generated/steps/**/*.js",
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

    const { spawn } = require("child_process");

    return new Promise((resolve) => {
      const playwright = spawn(
        "npx",
        [
          "playwright",
          "test",
          "generated/tests/**/*.js",
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
```

---

## 📊 **Step 10: Report Generation and Viewing**

### **Combined Report Generation**

- **Method**: `generateCombinedReport()`

```javascript
async generateCombinedReport(results) {
  logger.info('📊 Generating combined HTML report...');

  const reportTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Execution Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #007acc; }
        .success { border-left-color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .error { border-left-color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Auto-Coder Framework - Test Execution Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>

    <div class="section ${results.cucumber.exitCode === 0 ? 'success' : 'warning'}">
        <h2>🥒 Cucumber Test Results</h2>
        <p>Exit Code: ${results.cucumber.exitCode}</p>
        <p>Status: ${results.cucumber.exitCode === 0 ? 'PASSED' : 'FAILED'}</p>
    </div>

    <div class="section ${results.playwright.exitCode === 0 ? 'success' : 'warning'}">
        <h2>🎭 Playwright Test Results</h2>
        <p>Exit Code: ${results.playwright.exitCode}</p>
        <p>Status: ${results.playwright.exitCode === 0 ? 'PASSED' : 'FAILED'}</p>
    </div>
</body>
</html>`;

  const reportPath = path.join(this.reportsDir, 'combined-report.html');
  await fs.writeFile(reportPath, reportTemplate);

  logger.success(`📊 HTML report generated: ${reportPath}`);
  return reportPath;
}
```

---

## 🧹 **Step 11: Cleanup and Exit**

### **Cleanup Operations**

- **Method**: `handleCleanup()`

```javascript
async handleCleanup() {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to clean up all generated files?',
      default: false
    }
  ]);

  if (confirm) {
    try {
      const directories = ['./generated', './reports', './temp'];

      for (const dir of directories) {
        if (await fs.pathExists(dir)) {
          await fs.remove(dir);
          logger.success(`🗑️ Cleaned: ${dir}`);
        }
      }

      logger.success('✅ Cleanup completed successfully!');
    } catch (error) {
      logger.error(`Cleanup failed: ${error.message}`);
    }
  }
}

async handleExit() {
  logger.info('👋 Thank you for using Auto-Coder Framework!');
  process.exit(0);
}
```

---

## 🚨 **Step 12: Error Handling and Feedback**

### **Error Handling Patterns**

- **File**: `/utils/logger.js`

```javascript
const colors = require("colors");

class Logger {
  info(message) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${timestamp} [INFO]`.blue, message);
  }

  success(message) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${timestamp} [SUCCESS]`.green, message);
  }

  warn(message) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${timestamp} [WARN]`.yellow, message);
  }

  error(message) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${timestamp} [ERROR]`.red, message);
  }
}

module.exports = new Logger();
```

### **Global Error Handling**

- **File**: `/cli/interactive-cli.js`

```javascript
async processWithErrorHandling(asyncFunction, errorMessage) {
  try {
    return await asyncFunction();
  } catch (error) {
    logger.error(`${errorMessage}: ${error.message}`);

    const { retry } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'retry',
        message: 'Would you like to try again?',
        default: true
      }
    ]);

    if (retry) {
      return await this.processWithErrorHandling(asyncFunction, errorMessage);
    }

    return null;
  }
}
```

---

## 📁 **File Organization and Naming Conventions**

### **Base Name Extraction**

```javascript
extractBaseName(filePath) {
  const fileName = path.basename(filePath);
  const nameWithoutExt = path.parse(fileName).name;

  // Clean up timestamp patterns for auto-generated files
  return nameWithoutExt.replace(/-\d{4}-\d{2}-\d{2}T[\d-]+Z$/, '');
}
```

### **Generated File Structure**

```
generated/
├── summary/
│   ├── requirements-summary.md
│   └── jira-story-summary.md
├── features/
│   ├── requirements.feature
│   └── jira-story.feature
├── steps/
│   ├── requirements-steps.js
│   └── jira-story-steps.js
├── pages/
│   ├── requirements-page.js
│   └── jira-story-page.js
└── tests/
    ├── requirements-test.js
    └── jira-story-test.js
```

---

## 🔄 **Complete Process Flow Summary**

1. **Entry**: `npm run interactive` → `/cli/index.js` → `InteractiveCLI.start()`
2. **Menu**: `showMainMenu()` → User selects "Read and Process Requirements"
3. **Input Selection**: `handleReadRequirements()` → User chooses input type
4. **Route to Handler**: `routeToInputHandler()` → Specific input method
5. **File Discovery**: `getAvailableFiles()` → Auto-lists available files
6. **VS Code Integration**: `openEditor()` → Opens files in VS Code
7. **Processing**: `RequirementReader.readFromFile()` → Extracts content
8. **Generation**: `TestGenerator.generateArtifacts()` → Creates all artifacts
9. **Templates**: `TemplateGenerator` → Generates structured templates
10. **Execution**: `TestRunner.runTests()` → Runs Cucumber + Playwright
11. **Reporting**: `generateCombinedReport()` → Creates HTML reports
12. **Cleanup**: `handleCleanup()` → Removes generated files

This comprehensive flow ensures **dynamic adaptability**, **error resilience**, and **structured output** while maintaining **flexibility** for various input sources and formats.

---

## 🎯 **Key Benefits of This Architecture**

- **Modular Design**: Clear separation of concerns
- **Dynamic Processing**: No hard-coded logic
- **User-Friendly**: Auto-discovery and VS Code integration
- **Comprehensive**: Handles 8 different input types
- **Organized Output**: Consistent naming and structure
- **Error Resilient**: Graceful error handling and recovery
- **Template-Driven**: Structured, professional artifacts
- **Extensible**: Easy to add new input types and generators

The framework successfully achieves the goal of "Read → Understand → Generate → Run" with a sophisticated, user-friendly approach that eliminates manual overhead while maintaining professional-grade output quality.
