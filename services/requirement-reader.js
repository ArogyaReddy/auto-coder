const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const { logger } = require('../utils/logger');

class RequirementReader {
  constructor() {
    this.supportedFileTypes = ['.txt', '.md', '.pdf', '.docx'];
    this.supportedImageTypes = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];
  }

  async readFromFile(filePath) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath, ext);
      
      logger.info(`📖 Reading file: ${filePath}`);

      let content;
      
      switch (ext) {
        case '.txt':
        case '.md':
          content = await fs.readFile(filePath, 'utf8');
          break;
        case '.pdf':
          content = await this.readPdfFile(filePath);
          break;
        case '.docx':
          content = await this.readDocxFile(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${ext}`);
      }

      return {
        content,
        source: filePath,
        type: ext.substring(1),
        fileName,
        metadata: {
          size: (await fs.stat(filePath)).size,
          modified: (await fs.stat(filePath)).mtime
        }
      };
    } catch (error) {
      logger.error(`Error reading file: ${error.message}`);
      throw error;
    }
  }

  async readFromImage(imagePath) {
    try {
      const ext = path.extname(imagePath).toLowerCase();
      const fileName = path.basename(imagePath, ext);
      
      if (!this.supportedImageTypes.includes(ext)) {
        throw new Error(`Unsupported image type: ${ext}`);
      }

      logger.info(`🖼️ Processing image with OCR: ${imagePath}`);
      
      const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            logger.info(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      return {
        content: text,
        source: imagePath,
        type: 'image-ocr',
        fileName,
        metadata: {
          imageType: ext,
          extractedTextLength: text.length
        }
      };
    } catch (error) {
      logger.error(`Error reading image: ${error.message}`);
      throw error;
    }
  }

  async readFromUrl(url) {
    try {
      logger.info(`🌐 Fetching content from URL: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Auto-Coder Framework 1.0.0'
        }
      });

      const contentType = response.headers['content-type'] || '';
      let content;

      if (contentType.includes('text/html')) {
        const $ = cheerio.load(response.data);
        
        // Remove script and style elements
        $('script, style').remove();
        
        // Extract text content
        content = $('body').text().replace(/\s+/g, ' ').trim();
        
        // Try to get title
        const title = $('title').text();
        if (title) {
          content = `# ${title}\n\n${content}`;
        }
      } else {
        content = response.data;
      }

      return {
        content,
        source: url,
        type: 'url',
        fileName: this.getFileNameFromUrl(url),
        metadata: {
          contentType,
          contentLength: content.length,
          statusCode: response.status
        }
      };
    } catch (error) {
      logger.error(`Error reading from URL: ${error.message}`);
      throw error;
    }
  }

  async readFromConfluence(config) {
    try {
      const { baseUrl, pageId, username, password } = config;
      
      logger.info(`🔗 Fetching Confluence page: ${pageId}`);
      
      const auth = username && password ? {
        username,
        password
      } : undefined;

      // Construct API URL
      let apiUrl;
      if (pageId.startsWith('http')) {
        // Extract page ID from URL
        const match = pageId.match(/pages\/(\d+)/);
        if (match) {
          apiUrl = `${baseUrl}/rest/api/content/${match[1]}?expand=body.storage`;
        } else {
          throw new Error('Could not extract page ID from URL');
        }
      } else {
        apiUrl = `${baseUrl}/rest/api/content/${pageId}?expand=body.storage`;
      }

      const response = await axios.get(apiUrl, {
        auth,
        timeout: 30000,
        headers: {
          'Accept': 'application/json'
        }
      });

      const page = response.data;
      const htmlContent = page.body.storage.value;
      
      // Convert HTML to plain text
      const $ = cheerio.load(htmlContent);
      const content = $.text().replace(/\s+/g, ' ').trim();

      return {
        content: `# ${page.title}\n\n${content}`,
        source: `confluence:${pageId}`,
        type: 'confluence',
        fileName: page.title.replace(/[^a-zA-Z0-9]/g, '_'),
        metadata: {
          pageId: page.id,
          title: page.title,
          version: page.version.number,
          lastModified: page.version.when
        }
      };
    } catch (error) {
      logger.error(`Error reading from Confluence: ${error.message}`);
      throw error;
    }
  }

  async readFromPlaywright(filePath) {
    try {
      logger.info(`🎭 Reading Playwright codegen file: ${filePath}`);
      
      const content = await fs.readFile(filePath, 'utf8');
      const fileName = path.basename(filePath, path.extname(filePath));
      
      // Parse Playwright code to extract test scenarios
      const scenarios = this.parsePlaywrightCode(content);
      
      const requirements = this.convertPlaywrightToRequirements(scenarios);

      return {
        content: requirements,
        source: filePath,
        type: 'playwright',
        fileName,
        metadata: {
          originalCodeLength: content.length,
          scenariosExtracted: scenarios.length
        }
      };
    } catch (error) {
      logger.error(`Error reading Playwright file: ${error.message}`);
      throw error;
    }
  }

  async readFromCurl(curlCommand) {
    try {
      logger.info(`📡 Processing cURL command`);
      
      const parsedCurl = this.parseCurlCommand(curlCommand);
      
      const response = await axios({
        method: parsedCurl.method,
        url: parsedCurl.url,
        headers: parsedCurl.headers,
        data: parsedCurl.data,
        timeout: 30000
      });

      let content;
      const contentType = response.headers['content-type'] || '';

      if (contentType.includes('application/json')) {
        content = JSON.stringify(response.data, null, 2);
      } else if (contentType.includes('text/html')) {
        const $ = cheerio.load(response.data);
        content = $('body').text().replace(/\s+/g, ' ').trim();
      } else {
        content = response.data.toString();
      }

      return {
        content,
        source: 'curl',
        type: 'curl',
        fileName: `curl_response_${Date.now()}`,
        metadata: {
          method: parsedCurl.method,
          url: parsedCurl.url,
          statusCode: response.status,
          contentType
        }
      };
    } catch (error) {
      logger.error(`Error processing cURL command: ${error.message}`);
      throw error;
    }
  }

  async readPdfFile(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to read PDF: ${error.message}`);
    }
  }

  async readDocxFile(filePath) {
    // For now, return a placeholder. In a real implementation,
    // you would use a library like mammoth.js to extract text from DOCX
    throw new Error('DOCX support not yet implemented. Please convert to PDF or text format.');
  }

  parsePlaywrightCode(code) {
    const scenarios = [];
    const lines = code.split('\n');
    
    let currentScenario = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect test scenarios
      if (trimmed.includes('test(') || trimmed.includes('test.only(')) {
        const match = trimmed.match(/test\(['"`]([^'"`]+)['"`]/);
        if (match) {
          if (currentScenario) {
            scenarios.push(currentScenario);
          }
          currentScenario = {
            name: match[1],
            steps: []
          };
        }
      }
      
      // Extract actions
      if (currentScenario && (
        trimmed.includes('page.goto(') ||
        trimmed.includes('page.click(') ||
        trimmed.includes('page.fill(') ||
        trimmed.includes('page.type(') ||
        trimmed.includes('expect(')
      )) {
        currentScenario.steps.push(trimmed);
      }
    }
    
    if (currentScenario) {
      scenarios.push(currentScenario);
    }
    
    return scenarios;
  }

  convertPlaywrightToRequirements(scenarios) {
    let requirements = '# Test Requirements from Playwright Recording\n\n';
    
    scenarios.forEach((scenario, index) => {
      requirements += `## Scenario ${index + 1}: ${scenario.name}\n\n`;
      requirements += 'As a user\n';
      requirements += 'I want to perform the following actions\n';
      requirements += 'So that the application behaves as expected\n\n';
      
      requirements += '### Steps:\n';
      scenario.steps.forEach((step, stepIndex) => {
        requirements += `${stepIndex + 1}. ${this.convertPlaywrightStepToRequirement(step)}\n`;
      });
      
      requirements += '\n';
    });
    
    return requirements;
  }

  convertPlaywrightStepToRequirement(step) {
    if (step.includes('page.goto(')) {
      const match = step.match(/page\.goto\(['"`]([^'"`]+)['"`]/);
      return match ? `Navigate to ${match[1]}` : 'Navigate to a page';
    }
    
    if (step.includes('page.click(')) {
      const match = step.match(/page\.click\(['"`]([^'"`]+)['"`]/);
      return match ? `Click on element: ${match[1]}` : 'Click on an element';
    }
    
    if (step.includes('page.fill(')) {
      const match = step.match(/page\.fill\(['"`]([^'"`]+)['"`].*?['"`]([^'"`]+)['"`]/);
      return match ? `Fill field "${match[1]}" with "${match[2]}"` : 'Fill a form field';
    }
    
    if (step.includes('expect(')) {
      return 'Verify the expected result';
    }
    
    return step;
  }

  parseCurlCommand(curlCommand) {
    const parsed = {
      method: 'GET',
      url: '',
      headers: {},
      data: null
    };

    // Basic parsing - this can be enhanced for more complex cURL commands
    const parts = curlCommand.split(' ');
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part === '-X' || part === '--request') {
        parsed.method = parts[i + 1];
        i++;
      } else if (part === '-H' || part === '--header') {
        const header = parts[i + 1].replace(/['"]/g, '');
        const [key, value] = header.split(':');
        if (key && value) {
          parsed.headers[key.trim()] = value.trim();
        }
        i++;
      } else if (part === '-d' || part === '--data') {
        parsed.data = parts[i + 1].replace(/['"]/g, '');
        i++;
      } else if (part.startsWith('http')) {
        parsed.url = part.replace(/['"]/g, '');
      }
    }

    return parsed;
  }

  getFileNameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const parts = pathname.split('/');
      const lastPart = parts[parts.length - 1];
      
      if (lastPart && lastPart.includes('.')) {
        return lastPart.split('.')[0];
      }
      
      return urlObj.hostname.replace(/\./g, '_');
    } catch {
      return 'url_content';
    }
  }
}

module.exports = RequirementReader;
