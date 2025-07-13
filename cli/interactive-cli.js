const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const RequirementReader = require('../services/requirement-reader');
const TestGenerator = require('../services/test-generator');
const TestRunner = require('../services/test-runner');
const { logger } = require('../utils/logger');
const { createTemplate } = require('../utils/template-generator');

class InteractiveCLI {
  constructor() {
    this.requirementReader = new RequirementReader();
    this.testGenerator = new TestGenerator();
    this.testRunner = new TestRunner();
  }

  async start() {
    logger.info('🚀 Welcome to Auto-Coder Framework!');
    logger.info('Dynamic Test Automation Framework');
    console.log('');

    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '🎯 Generate Test Artifacts from Requirements', value: 'generate' },
            { name: '▶️  Run Generated Tests', value: 'run' },
            { name: '📊 View Test Reports', value: 'reports' },
            { name: '⚙️  Settings', value: 'settings' },
            { name: '❌ Exit', value: 'exit' }
          ]
        }
      ]);

      switch (action) {
        case 'generate':
          await this.handleIntelligentGeneration();
          break;
        case 'run':
          await this.handleRunTests();
          break;
        case 'reports':
          await this.handleViewReports();
          break;
        case 'settings':
          await this.handleSettings();
          break;
        case 'exit':
          logger.info('👋 Thank you for using Auto-Coder Framework!');
          process.exit(0);
          break;
      }
    }
  }

  // OLD METHODS REMOVED - Now handled by handleIntelligentGeneration
  // These methods provided separate "read" and "generate" flows
  // Now we have a streamlined single flow: select requirements → complete generation pipeline

  async handleFileInput() {
    // First check if requirements/text directory exists and has files
    const textDir = path.join(process.cwd(), 'requirements', 'text');
    let availableFiles = [];
    
    if (await fs.pathExists(textDir)) {
      const files = await fs.readdir(textDir);
      availableFiles = files.filter(f => f.endsWith('.md') || f.endsWith('.txt'));
    }
    
    if (availableFiles.length > 0) {
      const { choice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'Choose an option:',
          choices: [
            { name: '📁 Select from available files', value: 'select' },
            { name: '📝 Enter custom file path', value: 'custom' }
          ]
        }
      ]);
      
      if (choice === 'select') {
        const { selectedFile } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedFile',
            message: 'Select a requirements file:',
            choices: availableFiles.map(file => ({
              name: `📄 ${file}`,
              value: path.join(textDir, file)
            }))
          }
        ]);
        
        return await this.requirementReader.readFromFile(selectedFile);
      }
    }
    
    // Fallback to manual path entry
    const { filePath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'filePath',
        message: 'Enter file path:',
        validate: async (input) => {
          if (!input) return 'File path is required';
          if (!await fs.pathExists(input)) return 'File does not exist';
          return true;
        }
      }
    ]);

    return await this.requirementReader.readFromFile(filePath);
  }

  async handleImageInput() {
    // First check if requirements/images directory exists and has files
    const imagesDir = path.join(process.cwd(), 'requirements', 'images');
    let availableFiles = [];
    
    if (await fs.pathExists(imagesDir)) {
      const files = await fs.readdir(imagesDir);
      availableFiles = files.filter(f => 
        f.toLowerCase().endsWith('.png') || 
        f.toLowerCase().endsWith('.jpg') || 
        f.toLowerCase().endsWith('.jpeg') || 
        f.toLowerCase().endsWith('.gif') || 
        f.toLowerCase().endsWith('.bmp')
      );
    }
    
    if (availableFiles.length > 0) {
      const { choice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'Choose an option:',
          choices: [
            { name: '🖼️  Select from available images', value: 'select' },
            { name: '📁 Enter custom image path', value: 'custom' }
          ]
        }
      ]);
      
      if (choice === 'select') {
        const { selectedFile } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedFile',
            message: 'Select an image file for OCR processing:',
            choices: availableFiles.map(file => ({
              name: `🖼️  ${file}`,
              value: path.join(imagesDir, file)
            }))
          }
        ]);
        
        return await this.requirementReader.readFromImage(selectedFile);
      }
    }
    
    // Fallback to manual path entry
    const { imagePath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'imagePath',
        message: 'Enter image file path:',
        validate: async (input) => {
          if (!input) return 'Image path is required';
          if (!await fs.pathExists(input)) return 'Image file does not exist';
          return true;
        }
      }
    ]);

    return await this.requirementReader.readFromImage(imagePath);
  }

  async handleUrlInput() {
    const { url } = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Enter URL:',
        validate: (input) => {
          if (!input) return 'URL is required';
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        }
      }
    ]);

    return await this.requirementReader.readFromUrl(url);
  }

  async handleSingleTextInput() {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'How would you like to enter your requirement?',
        choices: [
          { name: '✏️  Type directly here', value: 'direct' },
          { name: '📝 Open editor to write requirement', value: 'editor' }
        ]
      }
    ]);

    if (choice === 'direct') {
      const { text } = await inquirer.prompt([
        {
          type: 'input',
          name: 'text',
          message: 'Enter your requirement:',
          validate: (input) => input ? true : 'Requirement text is required'
        }
      ]);

      return { content: text, source: 'single-text-direct', type: 'text' };
    } else {
      // Create a timestamped file and open in editor
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
      const dateStr = timestamp[0];
      const timeStr = timestamp[1].split('.')[0];
      const fileName = `single-line-requirement-${dateStr}-${timeStr}.md`;
      const filePath = path.join(process.cwd(), 'requirements', 'text', fileName);
      
      await fs.ensureDir(path.dirname(filePath));
      
      const templateContent = `# Single Line Requirement - ${dateStr} ${timeStr.replace(/-/g, ':')}

## Requirement
Write your single line requirement below:

> [Enter your requirement here]

## Example
> As a user, I want to login to the system so that I can access my dashboard

---
**Instructions:** 
- Write a clear, concise requirement above
- Save the file (Ctrl+S / Cmd+S)
- Return to the CLI and select DONE when finished
`;

      await fs.writeFile(filePath, templateContent);
      logger.info(`📝 Opening editor for: ${fileName}`);
      
      await this.openEditor(filePath);
      
      const { confirmed } = await inquirer.prompt([
        {
          type: 'list',
          name: 'confirmed',
          message: 'Have you finished editing the requirement?',
          choices: [
            { name: '✅ DONE - Process the requirement', value: true },
            { name: '❌ Cancel', value: false }
          ]
        }
      ]);

      if (confirmed) {
        const content = await fs.readFile(filePath, 'utf8');
        return { 
          content, 
          source: filePath, 
          type: 'markdown',
          fileName: path.basename(filePath, '.md')
        };
      }
    }
  }

  async handleMultiTextInput() {
    logger.info('📝 Creating multi-line requirements template...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
    const dateStr = timestamp[0];
    const timeStr = timestamp[1].split('.')[0];
    const fileName = `multi-line-requirements-${dateStr}-${timeStr}.md`;
    const filePath = path.join(process.cwd(), 'requirements', 'text', fileName);
    
    await fs.ensureDir(path.dirname(filePath));
    
    const templateContent = `# Multi-line Requirements - ${dateStr} ${timeStr.replace(/-/g, ':')}

## Feature Description
*Describe the main feature or functionality*

## User Stories
*Write user stories in the format: As a [user type], I want [goal] so that [benefit]*

### User Story 1
**As a** user  
**I want** to [action]  
**So that** [benefit]

**Acceptance Criteria:**
- [ ] Given [initial context]
- [ ] When [action is performed]
- [ ] Then [expected outcome]

### User Story 2
**As a** [user type]  
**I want** [goal]  
**So that** [benefit]

**Acceptance Criteria:**
- [ ] Given [initial context]
- [ ] When [action is performed]
- [ ] Then [expected outcome]

## Test Scenarios

### Scenario 1: [Scenario Name]
**Given** [initial state]  
**When** [action performed]  
**Then** [expected result]

### Scenario 2: [Scenario Name]
**Given** [initial state]  
**When** [action performed]  
**Then** [expected result]

## Additional Requirements
*Add any additional functional or non-functional requirements*

1. The system shall...
2. The application must...
3. Users should be able to...

---
**Instructions:**
1. Fill in the sections above with your specific requirements
2. Remove any sections that don't apply
3. Add additional sections as needed
4. Save the file (Ctrl+S / Cmd+S)
5. Return to the CLI and select DONE when finished
`;

    await fs.writeFile(filePath, templateContent);
    logger.info(`📝 Opening editor for: ${fileName}`);
    
    await this.openEditor(filePath);

    const { confirmed } = await inquirer.prompt([
      {
        type: 'list',
        name: 'confirmed',
        message: 'Have you finished editing the requirements?',
        choices: [
          { name: '✅ DONE - Process the requirements', value: true },
          { name: '📝 Continue editing (reopen file)', value: 'continue' },
          { name: '❌ Cancel', value: false }
        ]
      }
    ]);

    if (confirmed === 'continue') {
      await this.openEditor(filePath);
      return await this.handleMultiTextInput(); // Recursive call for continue editing
    }

    if (confirmed) {
      const content = await fs.readFile(filePath, 'utf8');
      return { 
        content, 
        source: filePath, 
        type: 'markdown',
        fileName: path.basename(filePath, '.md')
      };
    }
  }

  async handleConfluenceInput() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'baseUrl',
        message: 'Enter Confluence base URL:',
        validate: (input) => input ? true : 'Base URL is required'
      },
      {
        type: 'input',
        name: 'pageId',
        message: 'Enter page ID or URL:',
        validate: (input) => input ? true : 'Page ID is required'
      },
      {
        type: 'input',
        name: 'username',
        message: 'Enter username (optional):'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter password/token (optional):'
      }
    ]);

    return await this.requirementReader.readFromConfluence(answers);
  }

  async handlePlaywrightInput() {
    const { filePath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'filePath',
        message: 'Enter Playwright codegen file path:',
        validate: async (input) => {
          if (!input) return 'File path is required';
          if (!await fs.pathExists(input)) return 'File does not exist';
          return true;
        }
      }
    ]);

    return await this.requirementReader.readFromPlaywright(filePath);
  }

  async handleCurlInput() {
    const { curlCommand } = await inquirer.prompt([
      {
        type: 'input',
        name: 'curlCommand',
        message: 'Enter cURL command:',
        validate: (input) => {
          if (!input) return 'cURL command is required';
          if (!input.toLowerCase().includes('curl')) return 'Please enter a valid cURL command';
          return true;
        }
      }
    ]);

    return await this.requirementReader.readFromCurl(curlCommand);
  }

  async openEditor(filePath) {
    return new Promise((resolve, reject) => {
      // Try VS Code first, then VS Code Insiders, then default editor
      const editors = ['code', 'code-insiders', process.env.EDITOR || 'nano'];
      
      const tryEditor = (editorIndex) => {
        if (editorIndex >= editors.length) {
          logger.warn('Could not open editor. Please edit the file manually:', filePath);
          return resolve();
        }

        const editor = spawn(editors[editorIndex], [filePath], { 
          stdio: 'inherit',
          detached: false 
        });

        editor.on('error', () => {
          tryEditor(editorIndex + 1);
        });

        editor.on('close', (code) => {
          resolve();
        });
      };

      tryEditor(0);
    });
  }

  async displayAndSaveRequirements(requirements) {
    logger.info('\n📋 Requirements Summary:');
    console.log('Source:', requirements.source);
    console.log('Type:', requirements.type);
    console.log('Content preview:', requirements.content.substring(0, 200) + '...');

    // If the requirements came from a newly created file, it's already saved
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
      } else if (nextAction === 'edit') {
        await this.openEditor(requirements.source);
        // Reload the file after editing
        const updatedContent = await fs.readFile(requirements.source, 'utf8');
        requirements.content = updatedContent;
        await this.displayAndSaveRequirements(requirements);
      }
      
      return;
    }

    const { save } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'save',
        message: 'Would you like to save these requirements?',
        default: true
      }
    ]);

    if (save) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `requirements-${timestamp}.md`;
      const filePath = path.join('./requirements/text', fileName);
      
      await fs.ensureDir('./requirements/text');
      await fs.writeFile(filePath, requirements.content);
      
      logger.success(`Requirements saved to: ${filePath}`);
      
      // Ask if they want to generate test artifacts
      const { generate } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'generate',
          message: 'Would you like to generate test artifacts now?',
          default: true
        }
      ]);

      if (generate) {
        await this.generateFromSavedFile(filePath);
      }
    }
  }

  async generateFromSavedFile(filePath) {
    try {
      logger.info('🛠️ Generating test artifacts...');
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

  // OLD METHOD REMOVED - Now handled by handleIntelligentGeneration
  // This provides a streamlined flow: select requirements → complete generation pipeline

  async handleRunTests() {
    const generatedDir = './generated';
    
    if (!await fs.pathExists(generatedDir)) {
      logger.warn('No generated tests found. Please generate tests first.');
      return;
    }

    const { format } = await inquirer.prompt([
      {
        type: 'list',
        name: 'format',
        message: 'Select report format:',
        choices: [
          { name: 'HTML Report', value: 'html' },
          { name: 'JSON Report', value: 'json' },
          { name: 'JUnit XML', value: 'junit' }
        ]
      }
    ]);

    logger.info('▶️ Running tests...');
    await this.testRunner.runTests(generatedDir, format);
    logger.success('✅ Tests completed successfully!');
  }

  async handleViewReports() {
    const reportsDir = './reports';
    
    if (!await fs.pathExists(reportsDir)) {
      logger.warn('No reports found. Please run tests first.');
      return;
    }

    const files = await fs.readdir(reportsDir);
    const reportFiles = files.filter(f => f.endsWith('.html') || f.endsWith('.json'));

    if (reportFiles.length === 0) {
      logger.warn('No report files found.');
      return;
    }

    const { selectedReport } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedReport',
        message: 'Select report to view:',
        choices: reportFiles
      }
    ]);

    const reportPath = path.join(reportsDir, selectedReport);
    logger.info(`📊 Opening report: ${reportPath}`);
    
    // Open report in default browser for HTML files
    if (selectedReport.endsWith('.html')) {
      const { spawn } = require('child_process');
      spawn('open', [reportPath], { stdio: 'ignore' });
    } else {
      const content = await fs.readFile(reportPath, 'utf8');
      console.log(content);
    }
  }

  async handleSettings() {
    const { setting } = await inquirer.prompt([
      {
        type: 'list',
        name: 'setting',
        message: 'Settings:',
        choices: [
          { name: '📁 Set default output directory', value: 'output-dir' },
          { name: '🎯 Configure test preferences', value: 'test-prefs' },
          { name: '🔧 View framework info', value: 'info' },
          { name: '🔙 Back to main menu', value: 'back' }
        ]
      }
    ]);

    switch (setting) {
      case 'info':
        logger.info('\n🔧 Auto-Coder Framework Information:');
        console.log('Version: 1.0.0');
        console.log('Built with: Node.js, JavaScript, Playwright, Cucumber');
        console.log('Supported inputs: Files, Images, URLs, Text, Confluence, Playwright, cURL');
        console.log('Generated outputs: Summary, Feature files, Step definitions, Page objects, Test scripts');
        break;
      case 'back':
        break;
      default:
        logger.info('Feature coming soon!');
    }
  }

  // NEW: Streamlined method that combines input selection with intelligent generation
  async handleIntelligentGeneration() {
    logger.info('🎯 Starting Intelligent Test Artifact Generation...');
    logger.info('📄 REQUIREMENTS → 📊 ANALYSIS → 📝 SUMMARY → 🎯 FEATURE → 🪜 STEPS → 📄 PAGES → 🧪 TESTS');
    console.log('');

    // Step 1: Select input source
    const { inputType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'inputType',
        message: 'Select requirements source:',
        choices: [
          { name: '📄 File (txt, md, pdf, docx)', value: 'file' },
          { name: '🖼️  Image (screenshot, png, jpg)', value: 'image' },
          { name: '🌐 URL (webpage, document link)', value: 'url' },
          { name: '✏️  Single line text', value: 'single-text' },
          { name: '📝 Multiple lines text', value: 'multi-text' },
          { name: '🔗 Confluence page', value: 'confluence' },
          { name: '🎭 Playwright codegen recording', value: 'playwright' },
          { name: '📡 cURL command', value: 'curl' },
          { name: '🔙 Back to main menu', value: 'back' }
        ]
      }
    ]);

    if (inputType === 'back') return;

    // Step 2: Get requirements from selected source
    let requirements;
    try {
      switch (inputType) {
        case 'file':
          requirements = await this.handleFileInput();
          break;
        case 'image':
          requirements = await this.handleImageInput();
          break;
        case 'url':
          requirements = await this.handleUrlInput();
          break;
        case 'single-text':
          requirements = await this.handleSingleTextInput();
          break;
        case 'multi-text':
          requirements = await this.handleMultiTextInput();
          break;
        case 'confluence':
          requirements = await this.handleConfluenceInput();
          break;
        case 'playwright':
          requirements = await this.handlePlaywrightInput();
          break;
        case 'curl':
          requirements = await this.handleCurlInput();
          break;
      }

      if (!requirements) {
        logger.warn('No requirements provided. Returning to main menu.');
        return;
      }

      // Step 3: Display requirements summary
      logger.info('📋 Requirements loaded successfully:');
      logger.info(`   Source: ${requirements.source}`);
      logger.info(`   Type: ${requirements.type}`);
      logger.info(`   Content length: ${requirements.content.length} characters`);
      console.log('');

      // Step 4: Run the complete intelligent generation pipeline
      logger.info('🚀 Starting intelligent generation pipeline...');
      
      const results = await this.testGenerator.generateFromRequirements(requirements);
      
      // Step 5: Display results
      console.log('');
      logger.success('✅ INTELLIGENT TEST GENERATION COMPLETED!');
      logger.info('🎉 All artifacts generated using content-aware analysis');
      console.log('');
      
      logger.info('📊 Analysis Results:');
      logger.info(`   🎯 Domain: ${results.analysis.domain}`);
      logger.info(`   🏗️  Main Feature: ${results.analysis.mainFeature}`);
      logger.info(`   📋 User Stories: ${results.analysis.userStories}`);
      logger.info(`   🧪 Test Scenarios: ${results.analysis.scenarios}`);
      logger.info(`   🔥 Complexity: ${results.analysis.complexity}`);
      console.log('');
      
      logger.info('📄 Generated Files:');
      Object.entries(results.files).forEach(([type, filePath]) => {
        const fileName = path.basename(filePath);
        logger.info(`   ✅ ${type.toUpperCase()}: ${fileName}`);
      });
      console.log('');

      // Step 6: Ask what to do next
      const { nextAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'nextAction',
          message: 'What would you like to do next?',
          choices: [
            { name: '▶️  Run the generated tests', value: 'run' },
            { name: '📁 Open generated files directory', value: 'open' },
            { name: '🎯 Generate from different requirements', value: 'generate-new' },
            { name: '🔙 Back to main menu', value: 'back' }
          ]
        }
      ]);

      switch (nextAction) {
        case 'run':
          await this.handleRunTests();
          break;
        case 'open':
          await this.openGeneratedDirectory();
          break;
        case 'generate-new':
          await this.handleIntelligentGeneration();
          break;
        case 'back':
          return;
      }

    } catch (error) {
      logger.error('❌ Generation failed:', error.message);
      console.log('');
      
      const { retryAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'retryAction',
          message: 'What would you like to do?',
          choices: [
            { name: '🔄 Try again', value: 'retry' },
            { name: '🔙 Back to main menu', value: 'back' }
          ]
        }
      ]);

      if (retryAction === 'retry') {
        await this.handleIntelligentGeneration();
      }
    }
  }

  async openGeneratedDirectory() {
    const generatedDir = path.join(process.cwd(), 'generated');
    try {
      const { spawn } = require('child_process');
      spawn('open', [generatedDir], { stdio: 'ignore' });
      logger.success('📁 Generated files directory opened!');
    } catch (error) {
      logger.info(`📂 Generated files are in: ${generatedDir}`);
    }
  }
}

module.exports = InteractiveCLI;
