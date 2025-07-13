#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs-extra');
const InteractiveCLI = require('./interactive-cli');
const TestGenerator = require('../services/test-generator');
const TestRunner = require('../services/test-runner');
const { logger } = require('../utils/logger');

// Set up CLI program
program
  .name('auto-coder')
  .description('Dynamic test automation framework that reads, understands, and generates test artifacts')
  .version('1.0.0');

// Interactive mode (default)
program
  .command('interactive')
  .alias('i')
  .description('Start interactive CLI mode')
  .action(async () => {
    try {
      const cli = new InteractiveCLI();
      await cli.start();
    } catch (error) {
      logger.error('Interactive mode failed:', error.message);
      process.exit(1);
    }
  });

// Generate tests from file
program
  .command('generate')
  .alias('g')
  .description('Generate test artifacts from input source')
  .option('-i, --input <path>', 'Input file or URL')
  .option('-t, --type <type>', 'Input type (file|url|image|text|confluence|curl)')
  .option('-o, --output <path>', 'Output directory', './generated')
  .action(async (options) => {
    try {
      if (!options.input) {
        logger.error('Input source is required. Use --input option.');
        process.exit(1);
      }

      const generator = new TestGenerator();
      
      // Handle text input differently
      if (options.type === 'text') {
        await generator.generateFromText(options.input, options.output);
      } else {
        await generator.generateFromSource(options.input, options.type, options.output);
      }
      
      logger.success('Test artifacts generated successfully!');
    } catch (error) {
      logger.error('Generation failed:', error.message);
      process.exit(1);
    }
  });

// Run tests
program
  .command('run')
  .alias('r')
  .description('Run generated test scripts')
  .option('-p, --path <path>', 'Path to test files', './generated')
  .option('-f, --format <format>', 'Report format (html|json|junit)', 'html')
  .action(async (options) => {
    try {
      const runner = new TestRunner();
      await runner.runTests(options.path, options.format);
      logger.success('Tests executed successfully!');
    } catch (error) {
      logger.error('Test execution failed:', error.message);
      process.exit(1);
    }
  });

// Default to interactive mode if no command specified
if (!process.argv.slice(2).length) {
  const cli = new InteractiveCLI();
  cli.start().catch(error => {
    logger.error('Application failed:', error.message);
    process.exit(1);
  });
} else {
  program.parse();
}
