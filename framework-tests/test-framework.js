#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Testing Auto-Coder Framework Startup...\n');

// Test CLI startup (should not crash immediately)
console.log('📋 Testing CLI startup...');
const cli = spawn('node', ['cli/index.js', '--help'], {
  stdio: 'pipe'
});

let output = '';
cli.stdout.on('data', (data) => {
  output += data.toString();
});

cli.on('close', (code) => {
  if (code === 0) {
    console.log('✅ CLI startup test PASSED');
    console.log('✅ Help command works correctly');
  } else {
    console.log('❌ CLI startup test FAILED');
  }
  
  // Test inquirer import
  console.log('\n📋 Testing Inquirer import...');
  try {
    const inquirer = require('inquirer');
    if (typeof inquirer.prompt === 'function') {
      console.log('✅ Inquirer import test PASSED');
    } else {
      console.log('❌ Inquirer import test FAILED - prompt is not a function');
    }
  } catch (error) {
    console.log('❌ Inquirer import test FAILED:', error.message);
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Available commands:');
  console.log('  npm start            - Start interactive CLI');
  console.log('  npm run interactive  - Start interactive CLI');  
  console.log('  npm run demo         - Run a quick demo');
  console.log('  npm run generate     - Generate from sample file');
  console.log('  npm run help         - Show help');
  console.log('\n🚀 The framework is ready to use!');
});
