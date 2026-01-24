#!/usr/bin/env node

/**
 * Paymob Configuration Checker
 * يتحقق من صحة إعداد Paymob
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Paymob Configuration...\n');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

// Handle both Windows (\r\n) and Unix (\n) line endings
envContent.split(/\r?\n/).forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) return;

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        envVars[match[1].trim()] = match[2].trim();
    }
});

// Check required variables
const requiredVars = [
    'PAYMOB_API_KEY',
    'PAYMOB_INTEGRATION_ID',
    'PAYMOB_IFRAME_ID',
    'PAYMOB_HMAC_SECRET'
];

let allValid = true;

console.log('📋 Checking Environment Variables:\n');

requiredVars.forEach(varName => {
    const value = envVars[varName];

    if (!value) {
        console.log(`❌ ${varName}: Missing`);
        allValid = false;
    } else if (value.startsWith('your_')) {
        console.log(`⚠️  ${varName}: Using placeholder value`);
        allValid = false;
    } else {
        console.log(`✅ ${varName}: Set (${value.substring(0, 10)}...)`);
    }
});

console.log('\n📁 Checking Required Files:\n');

const requiredFiles = [
    'src/lib/paymob/client.ts',
    'src/lib/paymob/types.ts',
    'src/lib/paymob/webhook.ts',
    'src/app/api/checkout/route.ts',
    'src/app/api/webhooks/paymob/route.ts'
];

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file}: Missing`);
        allValid = false;
    }
});

console.log('\n📚 Documentation Files:\n');

const docFiles = [
    'PAYMOB_SETUP.md',
    'PAYMOB_TESTING.md',
    'PAYMOB_QUICKSTART.md'
];

docFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`⚠️  ${file}: Not found`);
    }
});

console.log('\n' + '='.repeat(50));

if (allValid) {
    console.log('\n✅ All checks passed! Paymob is ready to use.\n');
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000/checkout');
    console.log('3. Use test card: 4987654321098769\n');
} else {
    console.log('\n⚠️  Some issues found. Please review the output above.\n');
    console.log('For help, see: PAYMOB_SETUP.md\n');
}
