const fs = require('fs-extra');
const path = require('path');
const { logger } = require('../utils/logger');
const RequirementAnalyzer = require('./requirement-analyzer');
const IntelligentTemplateGenerator = require('../utils/template-generator');
const RequirementReader = require('./requirement-reader');

class TestGenerator {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'generated');
    this.analyzer = new RequirementAnalyzer();
    this.templateGenerator = new IntelligentTemplateGenerator();
    this.requirementReader = new RequirementReader();
    this.ensureDirectoriesExist();
  }

  async ensureDirectoriesExist() {
    const dirs = ['features', 'steps', 'pages', 'tests', 'summary'];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(this.outputDir, dir));
    }
  }

  // NEW: Intelligent generation from requirements
  async generateFromRequirements(requirements) {
    logger.info('🎯 Starting intelligent test generation from requirements...');
    
    const baseFileName = this.createBaseFileName(requirements.source);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
      // SEQUENTIAL PIPELINE: Each step uses output from previous
      logger.info('🔍 Step 1: Analyzing requirements content...');
      const analysis = await this.analyzer.analyzeContent(requirements.content);
      
      logger.info('📝 Step 2: Generating intelligent summary...');
      const summaryPath = await this.generateSummary(requirements, baseFileName, analysis);
      const summaryContent = await fs.readFile(summaryPath, 'utf8');
      
      logger.info('🎯 Step 3: Generating BDD feature from summary...');
      const featurePath = await this.generateFeature(baseFileName, summaryContent);
      const featureContent = await fs.readFile(featurePath, 'utf8');
      
      logger.info('🪜 Step 4: Generating step definitions from feature...');
      const stepsPath = await this.generateSteps(baseFileName, featureContent);
      const stepsContent = await fs.readFile(stepsPath, 'utf8');
      
      logger.info('📄 Step 5: Generating page object from steps...');
      const pagesPath = await this.generatePages(baseFileName, stepsContent);
      const pagesContent = await fs.readFile(pagesPath, 'utf8');
      
      logger.info('🧪 Step 6: Generating Playwright tests from pages...');
      const testsPath = await this.generateTests(baseFileName, pagesContent);

      const results = {
        timestamp,
        baseFileName,
        analysis: {
          domain: analysis.domain,
          complexity: analysis.complexity,
          mainFeature: analysis.mainFeature,
          userStories: analysis.userStories.length,
          scenarios: analysis.scenarios.length,
          businessRules: analysis.businessRules.length
        },
        files: {
          summary: summaryPath,
          feature: featurePath,
          steps: stepsPath,
          pages: pagesPath,
          tests: testsPath
        }
      };

      logger.info('✅ Intelligent test generation completed successfully');
      logger.info(`📊 Generated artifacts for domain: ${analysis.domain}`);
      logger.info(`🎯 Main feature: ${analysis.mainFeature}`);
      logger.info(`📋 User stories: ${analysis.userStories.length}`);
      logger.info(`🧪 Test scenarios: ${analysis.scenarios.length}`);
      
      return results;
    } catch (error) {
      logger.error('❌ Test generation failed:', error.message);
      throw error;
    }
  }

  async generateSummary(requirements, baseFileName, analysis) {
    logger.info('📝 Generating content-aware summary...');
    
    const summaryContent = this.templateGenerator.generateSummaryFromAnalysis(analysis, requirements);
    const filePath = path.join(this.outputDir, 'summary', `${baseFileName}.md`);
    
    await fs.writeFile(filePath, summaryContent);
    logger.info(`📄 Intelligent summary generated: ${filePath}`);
    logger.info(`   Domain: ${analysis.domain} | Complexity: ${analysis.complexity}`);
    logger.info(`   User Stories: ${analysis.userStories.length} | Scenarios: ${analysis.scenarios.length}`);
    
    return filePath;
  }

  async generateFeature(baseFileName, summaryContent) {
    logger.info('🎯 Generating BDD feature from summary analysis...');
    
    const featureContent = this.templateGenerator.generateFeatureFromSummary(summaryContent);
    const filePath = path.join(this.outputDir, 'features', `${baseFileName}.feature`);
    
    await fs.writeFile(filePath, featureContent);
    logger.info(`🎯 Content-aware feature generated: ${filePath}`);
    
    return filePath;
  }

  async generateSteps(baseFileName, featureContent) {
    logger.info('🪜 Generating step definitions from feature content...');
    
    const stepsContent = this.templateGenerator.generateStepsFromFeature(featureContent, baseFileName);
    const filePath = path.join(this.outputDir, 'steps', `${baseFileName}-steps.js`);
    
    await fs.writeFile(filePath, stepsContent);
    logger.info(`🪜 Intelligent step definitions generated: ${filePath}`);
    
    return filePath;
  }

  async generatePages(baseFileName, stepsContent) {
    logger.info('📄 Generating page object from step analysis...');
    
    const pagesContent = this.templateGenerator.generatePageFromSteps(stepsContent, baseFileName);
    const filePath = path.join(this.outputDir, 'pages', `${baseFileName}-page.js`);
    
    await fs.writeFile(filePath, pagesContent);
    logger.info(`📄 Domain-aware page object generated: ${filePath}`);
    
    return filePath;
  }

  async generateTests(baseFileName, pagesContent) {
    logger.info('🧪 Generating Playwright tests from page analysis...');
    
    const testsContent = this.templateGenerator.generateTestsFromPages(pagesContent, baseFileName);
    const filePath = path.join(this.outputDir, 'tests', `${baseFileName}.spec.js`);
    
    await fs.writeFile(filePath, testsContent);
    logger.info(`🧪 Comprehensive tests generated: ${filePath}`);
    
    return filePath;
  }

  // Enhanced file naming to handle complex requirements
  createBaseFileName(source) {
    if (!source) return 'default-test';
    
    let baseName = path.basename(source, path.extname(source));
    
    // Handle common patterns in requirement files
    baseName = baseName
      .replace(/requirement[s]?[-_]/gi, '')
      .replace(/[-_]requirement[s]?/gi, '')
      .replace(/user[-_]?stor(y|ies)/gi, 'story')
      .replace(/test[-_]?case[s]?/gi, 'case')
      .replace(/spec[-_]?/gi, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return baseName || 'parsed-requirement';
  }

  // LEGACY COMPATIBILITY METHODS (for backward compatibility)
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

    return await this.generateFromRequirements(requirements);
  }

  async generateFromFile(filePath, outputDir) {
    const requirements = await this.requirementReader.readFromFile(filePath);
    return await this.generateFromRequirements(requirements);
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

    return await this.generateFromRequirements(requirements);
  }

  // Method to validate generated artifacts
  async validateGeneratedArtifacts(results) {
    logger.info('🔍 Validating generated artifacts...');
    
    const validations = [];
    
    for (const [type, filePath] of Object.entries(results.files)) {
      try {
        const exists = await fs.pathExists(filePath);
        const stats = exists ? await fs.stat(filePath) : null;
        const size = stats ? stats.size : 0;
        
        validations.push({
          type,
          path: filePath,
          exists,
          size,
          valid: exists && size > 100 // Minimum file size check
        });
        
        if (exists && size > 100) {
          logger.info(`   ✅ ${type}: ${size} bytes`);
        } else {
          logger.warn(`   ⚠️  ${type}: ${exists ? 'too small' : 'missing'}`);
        }
      } catch (error) {
        logger.error(`   ❌ ${type}: validation failed - ${error.message}`);
        validations.push({
          type,
          path: filePath,
          exists: false,
          size: 0,
          valid: false,
          error: error.message
        });
      }
    }
    
    const validCount = validations.filter(v => v.valid).length;
    const totalCount = validations.length;
    
    logger.info(`📊 Validation complete: ${validCount}/${totalCount} artifacts valid`);
    
    return {
      validCount,
      totalCount,
      success: validCount === totalCount,
      details: validations
    };
  }

  // Utility method for legacy compatibility
  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/^[a-z]/, (g) => g.toUpperCase());
  }
}

module.exports = TestGenerator;
