const { createTemplate } = require('../utils/template-generator');
const fs = require('fs-extra');

async function testTemplateCreation() {
  console.log('🧪 Testing template creation...');
  
  try {
    const templatePath = await createTemplate();
    console.log('✅ Template created at:', templatePath);
    
    // Check if template exists
    const exists = await fs.pathExists(templatePath);
    console.log('✅ Template file exists:', exists);
    
    // Read template content
    const content = await fs.readFile(templatePath, 'utf8');
    console.log('✅ Template content length:', content.length);
    
    // Clean up
    await fs.remove(templatePath);
    console.log('✅ Template cleanup completed');
    
  } catch (error) {
    console.error('❌ Template test failed:', error.message);
  }
}

testTemplateCreation();
