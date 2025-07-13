# 🚀 Auto-Coder Framework

**Dynamic Test Automation Framework**

Read → Understand → Generate → Run

A comprehensive framework that reads requirements from various sources and automatically generates structured test artifacts including feature files, step definitions, page objects, and test scripts.

## ✨ Features

### 📖 Multi-Source Requirement Reading

- **Files**: .txt, .md, .pdf, .docx
- **Images**: Screenshots with OCR processing
- **URLs**: Web pages and documents
- **Text Input**: Single and multi-line text
- **Confluence**: Pages via REST API
- **Playwright**: Codegen recordings
- **cURL**: Command parsing and execution

### 🛠️ Automated Test Artifact Generation

- **Summary**: Structured requirement analysis (.md)
- **Feature Files**: Cucumber/BDD format (.feature)
- **Step Definitions**: JavaScript implementations (.js)
- **Page Objects**: Playwright page object pattern (.js)
- **Test Scripts**: Complete test suites (.js)

### 🎯 Framework Characteristics

- **Dynamic**: Adapts to different input sources and formats
- **No Hard-coded Logic**: Extensible and maintainable
- **Modern Stack**: Node.js, JavaScript, Playwright, Cucumber
- **Interactive CLI**: User-friendly interface with guided workflows
- **Comprehensive Reports**: HTML, JSON, and JUnit formats

## 🚀 Quick Start

### Installation

1. **Clone or navigate to the framework directory**

   ```bash
   cd /path/to/auto-coder
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Make CLI executable (optional)**
   ```bash
   npm link
   ```

### Usage

#### Interactive Mode (Recommended)

```bash
npm start
# or
node cli/index.js
```

#### Command Line Interface

```bash
# Generate tests from file
node cli/index.js generate --input requirements.md --type file --output ./generated

# Run generated tests
node cli/index.js run --path ./generated --format html

# Interactive mode
node cli/index.js interactive
```

## 📋 Usage Examples

### 1. Reading Requirements from File

```bash
# Start interactive mode
npm start

# Select: Read and Process Requirements
# Choose: File (txt, md, pdf, docx)
# Enter file path: ./requirements/sample-requirements.md
```

### 2. Processing Image Requirements (OCR)

```bash
# Start interactive mode
npm start

# Select: Read and Process Requirements
# Choose: Image (screenshot, png, jpg)
# Enter image path: ./requirements/screenshots/requirements.png
```

### 3. Reading from URL

```bash
# Start interactive mode
npm start

# Select: Read and Process Requirements
# Choose: URL (webpage, document link)
# Enter URL: https://example.com/requirements
```

### 4. Multi-line Text Input

```bash
# Start interactive mode
npm start

# Select: Read and Process Requirements
# Choose: Multiple lines text
# Framework opens template in VS Code for editing
# Save and confirm when done
```

### 5. Confluence Integration

```bash
# Start interactive mode
npm start

# Select: Read and Process Requirements
# Choose: Confluence page
# Enter base URL, page ID, credentials
```

## 📁 Project Structure

```
auto-coder/
├── cli/                          # Command line interface
│   ├── index.js                  # Main CLI entry point
│   └── interactive-cli.js        # Interactive CLI implementation
├── services/                     # Core services
│   ├── requirement-reader.js     # Multi-source requirement reading
│   ├── test-generator.js         # Test artifact generation
│   └── test-runner.js           # Test execution and reporting
├── utils/                        # Utility modules
│   ├── logger.js                # Logging utility
│   └── template-generator.js    # Template creation utilities
├── requirements/                 # Input requirements storage
│   ├── confluence/              # Confluence exports
│   ├── curl/                    # cURL command outputs
│   ├── images/                  # Image files for OCR
│   ├── jira/                    # JIRA exports
│   ├── text/                    # Text-based requirements
│   └── ux/                      # UX/Design requirements
├── generated/                    # Generated test artifacts
│   ├── features/                # Cucumber feature files
│   ├── steps/                   # Step definitions
│   ├── pages/                   # Page objects
│   ├── tests/                   # Test scripts
│   └── summary/                 # Requirement summaries
└── reports/                     # Test execution reports
```

## 🔧 Generated Artifacts

### File Naming Convention

For input file `login-requirements.md`, generates:

- `login-requirements-summary.md`
- `login-requirements.feature`
- `login-requirements-steps.js`
- `login-requirements-page.js`
- `login-requirements-test.js`

### Summary (.md)

```markdown
# Requirements Summary

**Generated on:** 2024-01-15
**Source:** ./requirements/login-requirements.md
**Type:** markdown

## Requirements Analysis

- Total Lines: 45
- Word Count: 387
- Key Actions Identified: 5
- Entities Found: 8

## Test Scenarios Identified

### Scenario 1: User can login

### Scenario 2: User can register

...
```

### Feature File (.feature)

```gherkin
Feature: Login Requirements
  As a user
  I want to interact with the application
  So that I can accomplish my goals

  Scenario: User can login
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should be logged in successfully
```

### Step Definitions (.js)

```javascript
const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("chai");
const LoginPage = require("../pages/login-requirements-page");

Given("I am on the login page", async function () {
  // Implementation
});

When("I enter valid credentials", async function () {
  // Implementation
});
```

### Page Objects (.js)

```javascript
class LoginPage {
  constructor(page) {
    this.page = page;
    this.selectors = {
      emailInput: '[name="email"]',
      passwordInput: '[name="password"]',
      loginButton: '[type="submit"]',
    };
  }

  async enterCredentials(email, password) {
    await this.page.fill(this.selectors.emailInput, email);
    await this.page.fill(this.selectors.passwordInput, password);
  }
}
```

### Test Scripts (.js)

```javascript
const { test, expect } = require("@playwright/test");
const LoginPage = require("../pages/login-requirements-page");

test.describe("Login Tests", () => {
  test("should handle user login", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.enterCredentials("user@example.com", "password");
    // Additional assertions
  });
});
```

## 🎯 Interactive CLI Menu

```
🚀 Welcome to Auto-Coder Framework!
Dynamic Test Automation Framework

? What would you like to do?
❯ 📖 Read and Process Requirements
  🛠️  Generate Test Artifacts
  ▶️  Run Generated Tests
  📊 View Test Reports
  ⚙️  Settings
  ❌ Exit
```

### Read and Process Requirements

- 📄 File (txt, md, pdf, docx)
- 🖼️ Image (screenshot, png, jpg)
- 🌐 URL (webpage, document link)
- ✏️ Single line text
- 📝 Multiple lines text
- 🔗 Confluence page
- 🎭 Playwright codegen recording
- 📡 cURL command

### Generate Test Artifacts

- Select from saved requirements
- Choose output directory
- Generate complete test suite

### Run Generated Tests

- Execute Cucumber tests
- Run Playwright tests
- Generate comprehensive reports

## 📊 Reporting

### HTML Report

Beautiful, interactive HTML reports with:

- Test execution summary
- Cucumber and Playwright results
- Pass/fail statistics
- Duration metrics
- Visual indicators

### JSON Report

Machine-readable format for CI/CD integration:

```json
{
  "meta": {
    "framework": "Auto-Coder",
    "version": "1.0.0",
    "timestamp": "2024-01-15"
  },
  "summary": {
    "cucumber": { "passed": 5, "failed": 0 },
    "playwright": { "passed": 8, "failed": 1 }
  }
}
```

### JUnit XML

Standard format for test result integration.

## 🔌 Supported Input Sources

### Files

- **Text Files**: .txt, .md
- **PDF Documents**: Parsed with pdf-parse
- **Word Documents**: .docx (planned)

### Images

- **OCR Processing**: Using Tesseract.js
- **Supported Formats**: .png, .jpg, .jpeg, .gif, .bmp
- **Text Extraction**: From screenshots and scanned documents

### Web Sources

- **URL Fetching**: Using Axios
- **HTML Parsing**: With Cheerio
- **Content Extraction**: Automatic text extraction

### Confluence

- **REST API**: Direct integration
- **Authentication**: Username/password or token
- **Content Parsing**: HTML to text conversion

### Playwright

- **Codegen Files**: Recorded interactions
- **Scenario Extraction**: Automatic test scenario identification
- **Code Conversion**: Convert recordings to requirements

### cURL

- **Command Parsing**: Extract HTTP request details
- **Request Execution**: Automatic API calls
- **Response Processing**: JSON/HTML/Text handling

## 🛠️ Configuration

### Environment Variables

```bash
# Logging level
export LOG_LEVEL=debug

# Default output directory
export AUTO_CODER_OUTPUT_DIR=./generated

# Confluence settings
export CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
export CONFLUENCE_USERNAME=your-email@domain.com
export CONFLUENCE_TOKEN=your-api-token
```

### Framework Settings

- Default output directories
- Test preferences
- Report formats
- Editor preferences (VS Code, VS Code Insiders)

## 🧪 Testing the Framework

### 1. Test with Sample Requirements

```bash
# Use the provided sample file
npm start
# Select: Generate Test Artifacts
# Choose: sample-login-requirements.md
```

### 2. Test OCR Functionality

```bash
# Create a screenshot of requirements and test OCR
npm start
# Select: Read and Process Requirements
# Choose: Image
# Provide path to screenshot
```

### 3. Test URL Processing

```bash
npm start
# Select: Read and Process Requirements
# Choose: URL
# Enter: https://example.com/requirements
```

## 🔍 Troubleshooting

### Common Issues

**1. OCR Not Working**

```bash
# Install additional dependencies
npm install tesseract.js
```

**2. VS Code Not Opening for Templates**

```bash
# Ensure VS Code is in PATH
# Or set EDITOR environment variable
export EDITOR=nano
```

**3. PDF Processing Fails**

```bash
# Install pdf-parse dependencies
npm install pdf-parse
```

**4. Playwright Tests Not Running**

```bash
# Install Playwright browsers
npx playwright install
```

### Debug Mode

```bash
LOG_LEVEL=debug npm start
```

## 🚦 CI/CD Integration

### GitHub Actions Example

```yaml
name: Auto-Coder Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"
      - name: Install dependencies
        run: npm install
      - name: Generate tests
        run: node cli/index.js generate --input requirements.md --type file
      - name: Run tests
        run: node cli/index.js run --format junit
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: reports/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details.

## 🙋‍♂️ Support

For questions, issues, or feature requests:

1. Check the troubleshooting section
2. Review existing issues
3. Create a new issue with detailed information

## 🗺️ Roadmap

### Upcoming Features

- [ ] Word document (.docx) support
- [ ] JIRA integration
- [ ] API testing support
- [ ] Visual regression testing
- [ ] AI-powered requirement analysis (optional)
- [ ] Docker containerization
- [ ] Web-based UI
- [ ] Plugin system
- [ ] Multiple language support

---

**Auto-Coder Framework v1.0.0**  
_Dynamic Test Automation Made Simple_
