#!/usr/bin/env node

/**
 * Midtrans Setup Checker
 * Validates Midtrans configuration and provides setup guidance
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 Chicha Mobile - Midtrans Setup Checker\n');
console.log('='.repeat(50) + '\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
let envExists = false;
let envContent = '';

if (fs.existsSync(envPath)) {
  envExists = true;
  envContent = fs.readFileSync(envPath, 'utf-8');
  console.log('✅ .env.local file found\n');
} else {
  console.log('❌ .env.local file NOT found\n');
  console.log('📝 Please create .env.local file in project root\n');
}

// Check Midtrans environment variables
const checks = {
  MIDTRANS_SERVER_KEY: {
    name: 'Server Key',
    required: true,
    example: 'SB-Mid-server-xxxxxxxxxxxx',
  },
  MIDTRANS_CLIENT_KEY: {
    name: 'Client Key',
    required: true,
    example: 'SB-Mid-client-xxxxxxxxxxxx',
  },
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: {
    name: 'Public Client Key',
    required: true,
    example: 'SB-Mid-client-xxxxxxxxxxxx',
  },
  MIDTRANS_IS_PRODUCTION: {
    name: 'Production Mode',
    required: true,
    example: 'false (for testing)',
  },
  NEXT_PUBLIC_APP_URL: {
    name: 'App URL',
    required: true,
    example: 'http://localhost:3000',
  },
};

console.log('📋 Checking Environment Variables:\n');

let allPassed = true;
const missing = [];

for (const [key, config] of Object.entries(checks)) {
  const value = process.env[key];
  const inFile = envContent.includes(key);
  
  if (value || inFile) {
    const displayValue = value || (inFile ? '(set in file)' : '');
    console.log(`✅ ${config.name.padEnd(20)} ${key}`);
    if (value) {
      const masked = value.includes('server') || value.includes('client') 
        ? value.substring(0, 20) + '...' 
        : value;
      console.log(`   Value: ${masked}`);
    }
  } else {
    console.log(`❌ ${config.name.padEnd(20)} ${key}`);
    console.log(`   Example: ${config.example}`);
    allPassed = false;
    missing.push(key);
  }
  console.log('');
}

console.log('='.repeat(50) + '\n');

// Summary
if (allPassed) {
  console.log('✅ All Midtrans configuration looks good!\n');
  console.log('📝 Next Steps:\n');
  console.log('1. Restart your development server:');
  console.log('   npm run dev\n');
  console.log('2. Setup localtunnel for local testing:');
  console.log('   npm install -g localtunnel');
  console.log('   lt --port 3000 --subdomain chicha-mobile-test\n');
  console.log('3. Configure Midtrans Dashboard:');
  console.log('   - Go to Settings → Configuration');
  console.log('   - Set Notification URL to your localtunnel URL + /api/payment/notification\n');
  console.log('4. Test payment with test credit card:');
  console.log('   Card: 4811 1111 1111 1114');
  console.log('   CVV: 123');
  console.log('   Exp: 01/30');
  console.log('   OTP: 112233\n');
  console.log('📚 For detailed guide, see: SETUP-MIDTRANS-LENGKAP.md\n');
} else {
  console.log('❌ Midtrans configuration incomplete!\n');
  console.log('📝 Missing variables:\n');
  missing.forEach(key => {
    console.log(`   - ${key}`);
  });
  console.log('\n💡 To fix:\n');
  console.log('1. Get your Midtrans credentials:');
  console.log('   https://dashboard.midtrans.com/settings/config_info\n');
  console.log('2. Add to .env.local file:\n');
  console.log('   MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_KEY');
  console.log('   MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_KEY');
  console.log('   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_KEY');
  console.log('   MIDTRANS_IS_PRODUCTION=false');
  console.log('   NEXT_PUBLIC_APP_URL=http://localhost:3000\n');
  console.log('3. Restart your development server\n');
  console.log('📚 For detailed guide, see: SETUP-MIDTRANS-LENGKAP.md\n');
}

// Check package.json for midtrans-client
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const hasMidtrans = packageJson.dependencies && packageJson.dependencies['midtrans-client'];
  
  console.log('='.repeat(50) + '\n');
  console.log('📦 Dependency Check:\n');
  
  if (hasMidtrans) {
    console.log('✅ midtrans-client package installed');
    console.log(`   Version: ${packageJson.dependencies['midtrans-client']}\n`);
  } else {
    console.log('❌ midtrans-client package NOT installed\n');
    console.log('💡 Install it with:');
    console.log('   npm install midtrans-client\n');
  }
}

console.log('='.repeat(50) + '\n');
console.log('🔗 Useful Links:\n');
console.log('- Midtrans Dashboard: https://dashboard.midtrans.com/');
console.log('- Midtrans Docs: https://docs.midtrans.com/');
console.log('- Test Cards: https://docs.midtrans.com/en/technical-reference/sandbox-test');
console.log('- Setup Guide: SETUP-MIDTRANS-LENGKAP.md\n');

process.exit(allPassed ? 0 : 1);
