const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const { logger } = require('../utils/logger');

class TestRunner {
  constructor() {
    this.reportsDir = './reports';
  }

  async runTests(testDir = './generated', format = 'html') {
    try {
      await fs.ensureDir(this.reportsDir);
      
      logger.info('🧪 Starting test execution...');
      
      // Check if test directory exists
      if (!await fs.pathExists(testDir)) {
        throw new Error(`Test directory not found: ${testDir}`);
      }

      // Run Cucumber tests if feature files exist
      const featuresDir = path.join(testDir, 'features');
      if (await fs.pathExists(featuresDir)) {
        const featureFiles = await fs.readdir(featuresDir);
        if (featureFiles.some(f => f.endsWith('.feature'))) {
          logger.info('🥒 Running Cucumber tests...');
          await this.runCucumberTests(testDir, format);
        }
      }

      // Run Playwright tests if test files exist
      const testsDir = path.join(testDir, 'tests');
      if (await fs.pathExists(testsDir)) {
        const testFiles = await fs.readdir(testsDir);
        if (testFiles.some(f => f.endsWith('.js'))) {
          logger.info('🎭 Running Playwright tests...');
          await this.runPlaywrightTests(testDir, format);
        }
      }

      await this.generateCombinedReport(format);
      logger.success('✅ Test execution completed!');
      
    } catch (error) {
      logger.error(`Test execution failed: ${error.message}`);
      throw error;
    }
  }

  async runCucumberTests(testDir, format) {
    return new Promise((resolve, reject) => {
      const configPath = path.join(testDir, 'cucumber.js');
      const featuresPath = path.join(testDir, 'features');
      const stepsPath = path.join(testDir, 'steps');
      
      const args = [
        '--require', stepsPath,
        '--format', 'progress',
        '--format', `html:${this.reportsDir}/cucumber-report.html`,
        '--format', `json:${this.reportsDir}/cucumber-results.json`,
        featuresPath
      ];

      const cucumber = spawn('npx', ['cucumber-js', ...args], {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: { ...process.env, NODE_PATH: path.join(testDir, 'node_modules') }
      });

      cucumber.on('close', (code) => {
        if (code === 0) {
          logger.success('✅ Cucumber tests completed successfully');
          resolve();
        } else {
          logger.warn(`⚠️ Cucumber tests completed with code ${code}`);
          resolve(); // Don't fail the entire process
        }
      });

      cucumber.on('error', (error) => {
        logger.error(`Cucumber execution error: ${error.message}`);
        resolve(); // Don't fail the entire process
      });
    });
  }

  async runPlaywrightTests(testDir, format) {
    return new Promise((resolve, reject) => {
      const configPath = path.join(testDir, 'playwright.config.js');
      const testsPath = path.join(testDir, 'tests');
      
      const args = [
        'test',
        '--config', configPath,
        '--reporter', `html:${this.reportsDir}/playwright-report`,
        '--reporter', `json:${this.reportsDir}/playwright-results.json`,
        testsPath
      ];

      const playwright = spawn('npx', ['playwright', ...args], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      playwright.on('close', (code) => {
        if (code === 0) {
          logger.success('✅ Playwright tests completed successfully');
          resolve();
        } else {
          logger.warn(`⚠️ Playwright tests completed with code ${code}`);
          resolve(); // Don't fail the entire process
        }
      });

      playwright.on('error', (error) => {
        logger.error(`Playwright execution error: ${error.message}`);
        resolve(); // Don't fail the entire process
      });
    });
  }

  async generateCombinedReport(format) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const reportData = {
        timestamp,
        cucumber: await this.getCucumberResults(),
        playwright: await this.getPlaywrightResults()
      };

      if (format === 'html') {
        await this.generateHTMLReport(reportData);
      } else if (format === 'json') {
        await this.generateJSONReport(reportData);
      } else if (format === 'junit') {
        await this.generateJUnitReport(reportData);
      }

    } catch (error) {
      logger.error(`Report generation failed: ${error.message}`);
    }
  }

  async getCucumberResults() {
    try {
      const resultsPath = path.join(this.reportsDir, 'cucumber-results.json');
      if (await fs.pathExists(resultsPath)) {
        const results = await fs.readJSON(resultsPath);
        return this.processCucumberResults(results);
      }
    } catch (error) {
      logger.warn('Could not load Cucumber results');
    }
    return null;
  }

  async getPlaywrightResults() {
    try {
      const resultsPath = path.join(this.reportsDir, 'playwright-results.json');
      if (await fs.pathExists(resultsPath)) {
        const results = await fs.readJSON(resultsPath);
        return this.processPlaywrightResults(results);
      }
    } catch (error) {
      logger.warn('Could not load Playwright results');
    }
    return null;
  }

  processCucumberResults(results) {
    const stats = {
      features: results.length,
      scenarios: 0,
      steps: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    };

    results.forEach(feature => {
      if (feature.elements) {
        feature.elements.forEach(scenario => {
          stats.scenarios++;
          if (scenario.steps) {
            scenario.steps.forEach(step => {
              stats.steps++;
              if (step.result) {
                switch (step.result.status) {
                  case 'passed':
                    stats.passed++;
                    break;
                  case 'failed':
                    stats.failed++;
                    break;
                  case 'skipped':
                    stats.skipped++;
                    break;
                }
                stats.duration += step.result.duration || 0;
              }
            });
          }
        });
      }
    });

    return stats;
  }

  processPlaywrightResults(results) {
    const stats = {
      suites: results.suites?.length || 0,
      tests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: results.stats?.duration || 0
    };

    if (results.suites) {
      results.suites.forEach(suite => {
        if (suite.specs) {
          suite.specs.forEach(spec => {
            stats.tests++;
            if (spec.tests) {
              spec.tests.forEach(test => {
                switch (test.status) {
                  case 'passed':
                    stats.passed++;
                    break;
                  case 'failed':
                    stats.failed++;
                    break;
                  case 'skipped':
                    stats.skipped++;
                    break;
                }
              });
            }
          });
        }
      });
    }

    return stats;
  }

  async generateHTMLReport(reportData) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto-Coder Test Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
        }
        .timestamp {
            color: #7f8c8d;
            margin-top: 10px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .summary-card.cucumber {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        }
        .summary-card.playwright {
            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
        }
        .summary-card h3 {
            margin: 0 0 15px 0;
            font-size: 1.2em;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 15px;
        }
        .stat {
            text-align: center;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            display: block;
        }
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
        .status-indicators {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 15px;
        }
        .status-indicator {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }
        .passed { background: rgba(255,255,255,0.2); }
        .failed { background: rgba(244,67,54,0.3); }
        .skipped { background: rgba(255,193,7,0.3); }
        .no-results {
            text-align: center;
            padding: 40px;
            color: #7f8c8d;
            font-style: italic;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Auto-Coder Test Report</h1>
            <div class="timestamp">Generated on ${reportData.timestamp}</div>
        </div>

        <div class="summary">
            ${reportData.cucumber ? this.generateCucumberCard(reportData.cucumber) : ''}
            ${reportData.playwright ? this.generatePlaywrightCard(reportData.playwright) : ''}
        </div>

        ${!reportData.cucumber && !reportData.playwright ? 
          '<div class="no-results">No test results found. Please run tests first.</div>' : ''}

        <div class="footer">
            <p>Generated by Auto-Coder Framework v1.0.0</p>
            <p>Dynamic Test Automation Framework</p>
        </div>
    </div>
</body>
</html>`;

    await fs.writeFile(path.join(this.reportsDir, 'combined-report.html'), html);
    logger.success(`📊 HTML report generated: ${path.join(this.reportsDir, 'combined-report.html')}`);
  }

  generateCucumberCard(stats) {
    return `
        <div class="summary-card cucumber">
            <h3>🥒 Cucumber Results</h3>
            <div class="stats">
                <div class="stat">
                    <span class="stat-value">${stats.features}</span>
                    <span class="stat-label">Features</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${stats.scenarios}</span>
                    <span class="stat-label">Scenarios</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${stats.steps}</span>
                    <span class="stat-label">Steps</span>
                </div>
            </div>
            <div class="status-indicators">
                <span class="status-indicator passed">✓ ${stats.passed} Passed</span>
                <span class="status-indicator failed">✗ ${stats.failed} Failed</span>
                <span class="status-indicator skipped">⊘ ${stats.skipped} Skipped</span>
            </div>
        </div>`;
  }

  generatePlaywrightCard(stats) {
    return `
        <div class="summary-card playwright">
            <h3>🎭 Playwright Results</h3>
            <div class="stats">
                <div class="stat">
                    <span class="stat-value">${stats.suites}</span>
                    <span class="stat-label">Suites</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${stats.tests}</span>
                    <span class="stat-label">Tests</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${Math.round(stats.duration / 1000)}s</span>
                    <span class="stat-label">Duration</span>
                </div>
            </div>
            <div class="status-indicators">
                <span class="status-indicator passed">✓ ${stats.passed} Passed</span>
                <span class="status-indicator failed">✗ ${stats.failed} Failed</span>
                <span class="status-indicator skipped">⊘ ${stats.skipped} Skipped</span>
            </div>
        </div>`;
  }

  async generateJSONReport(reportData) {
    const jsonReport = {
      meta: {
        framework: 'Auto-Coder',
        version: '1.0.0',
        timestamp: reportData.timestamp,
        generator: 'test-runner'
      },
      summary: {
        cucumber: reportData.cucumber,
        playwright: reportData.playwright
      }
    };

    await fs.writeFile(
      path.join(this.reportsDir, 'combined-report.json'), 
      JSON.stringify(jsonReport, null, 2)
    );
    logger.success(`📊 JSON report generated: ${path.join(this.reportsDir, 'combined-report.json')}`);
  }

  async generateJUnitReport(reportData) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<testsuites>\n';

    if (reportData.cucumber) {
      xml += `  <testsuite name="Cucumber Tests" tests="${reportData.cucumber.steps}" failures="${reportData.cucumber.failed}" skipped="${reportData.cucumber.skipped}">\n`;
      xml += '  </testsuite>\n';
    }

    if (reportData.playwright) {
      xml += `  <testsuite name="Playwright Tests" tests="${reportData.playwright.tests}" failures="${reportData.playwright.failed}" skipped="${reportData.playwright.skipped}">\n`;
      xml += '  </testsuite>\n';
    }

    xml += '</testsuites>';

    await fs.writeFile(path.join(this.reportsDir, 'junit-report.xml'), xml);
    logger.success(`📊 JUnit report generated: ${path.join(this.reportsDir, 'junit-report.xml')}`);
  }

  async installDependencies(testDir) {
    return new Promise((resolve, reject) => {
      logger.info('📦 Installing test dependencies...');
      
      const npm = spawn('npm', ['install'], {
        cwd: testDir,
        stdio: 'inherit'
      });

      npm.on('close', (code) => {
        if (code === 0) {
          logger.success('✅ Dependencies installed successfully');
          resolve();
        } else {
          reject(new Error(`Dependency installation failed with code ${code}`));
        }
      });

      npm.on('error', (error) => {
        reject(new Error(`Dependency installation error: ${error.message}`));
      });
    });
  }
}

module.exports = TestRunner;
