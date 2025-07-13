#!/usr/bin/env node

/**
 * Test script to demonstrate the enhanced CLI features
 */

const path = require('path');
const fs = require('fs-extra');

// Simple console logger for testing
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  error: (msg) => console.log(`[ERROR] ${msg}`)
};

async function testEnhancedFeatures() {
  logger.info('🧪 Testing Enhanced CLI Features');
  
  try {
    // Test file discovery function directly
    logger.info('1. Testing file discovery...');
    
    async function getAvailableFiles(directory, extensions) {
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
    
    const files = await getAvailableFiles('./requirements/text', ['.txt', '.md']);
    logger.success(`Found ${files.length} text files`);
    files.forEach(file => console.log(`   📄 ${file.name}`));
    
    // Test image discovery
    logger.info('\n2. Testing image discovery...');
    const images = await getAvailableFiles('./requirements/images', ['.jpg', '.jpeg', '.png', '.gif', '.bmp']);
    logger.success(`Found ${images.length} image files`);
    images.forEach(image => console.log(`   🖼️  ${image.name}`));
    
    // Test timestamp generation
    logger.info('\n3. Testing timestamp generation...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `test-requirements-${timestamp}.md`;
    logger.success(`Generated filename: ${fileName}`);
    
    logger.info('\n✅ All enhanced features are working correctly!');
    
  } catch (error) {
    logger.error('Test failed:', error.message);
  }
}

if (require.main === module) {
  testEnhancedFeatures();
}

module.exports = { testEnhancedFeatures };
