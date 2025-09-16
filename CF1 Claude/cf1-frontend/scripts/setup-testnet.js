#!/usr/bin/env node

/**
 * CF1 Frontend - Testnet Setup Script
 *
 * This script helps set up the frontend for testnet development:
 * - Copies testnet environment configuration
 * - Validates configuration
 * - Sets up testnet-specific dependencies
 * - Provides setup instructions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logInfo(message) {
  log(`[INFO] ${message}`, colors.blue);
}

function logSuccess(message) {
  log(`[SUCCESS] ${message}`, colors.green);
}

function logWarning(message) {
  log(`[WARNING] ${message}`, colors.yellow);
}

function logError(message) {
  log(`[ERROR] ${message}`, colors.red);
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}\n`);
}

// Configuration files
const configFiles = {
  testnetEnv: path.join(projectRoot, '.env.testnet'),
  localEnv: path.join(projectRoot, '.env.local'),
  exampleEnv: path.join(projectRoot, '.env.local.example'),
  packageJson: path.join(projectRoot, 'package.json'),
};

// Check if running in CF1 frontend directory
function validateProjectStructure() {
  logInfo('Validating project structure...');

  if (!fs.existsSync(configFiles.packageJson)) {
    logError('package.json not found. Please run this script from the CF1 frontend directory.');
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(configFiles.packageJson, 'utf8'));
  if (packageJson.name !== 'cf1-frontend') {
    logError('This does not appear to be the CF1 frontend project.');
    process.exit(1);
  }

  logSuccess('Project structure validated');
}

// Copy testnet environment configuration
function setupEnvironmentConfig() {
  logInfo('Setting up environment configuration...');

  if (!fs.existsSync(configFiles.testnetEnv)) {
    logError('.env.testnet file not found. Please ensure the testnet configuration exists.');
    process.exit(1);
  }

  // Backup existing .env.local if it exists
  if (fs.existsSync(configFiles.localEnv)) {
    const backupPath = `${configFiles.localEnv}.backup.${Date.now()}`;
    fs.copyFileSync(configFiles.localEnv, backupPath);
    logWarning(`Existing .env.local backed up to: ${path.basename(backupPath)}`);
  }

  // Copy testnet config to .env.local
  fs.copyFileSync(configFiles.testnetEnv, configFiles.localEnv);
  logSuccess('Testnet environment configuration copied to .env.local');
}

// Validate environment variables
function validateEnvironmentConfig() {
  logInfo('Validating environment configuration...');

  const envContent = fs.readFileSync(configFiles.localEnv, 'utf8');
  const requiredVars = [
    'VITE_CHAIN_ID',
    'VITE_CHAIN_NAME',
    'VITE_RPC_URL',
    'VITE_REST_URL',
    'VITE_NETWORK',
  ];

  const missingVars = [];
  const warnings = [];

  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=(.+)$`, 'm');
    const match = envContent.match(regex);

    if (!match || !match[1] || match[1].trim() === '') {
      missingVars.push(varName);
    }
  });

  // Check for contract addresses (these will be empty until deployment)
  const contractVars = ['VITE_LAUNCHPAD_CONTRACT_ADDRESS', 'VITE_CW20_CODE_ID'];
  contractVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=(.*)$`, 'm');
    const match = envContent.match(regex);

    if (!match || !match[1] || match[1].trim() === '') {
      warnings.push(`${varName} is empty - will be set after contract deployment`);
    }
  });

  if (missingVars.length > 0) {
    logError(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  warnings.forEach(warning => logWarning(warning));
  logSuccess('Environment configuration validated');
}

// Check and install dependencies
function checkDependencies() {
  logInfo('Checking dependencies...');

  const packageJson = JSON.parse(fs.readFileSync(configFiles.packageJson, 'utf8'));
  const requiredDeps = [
    '@cosmjs/cosmwasm-stargate',
    '@cosmjs/stargate',
    '@keplr-wallet/types',
  ];

  const missingDeps = requiredDeps.filter(dep =>
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  );

  if (missingDeps.length > 0) {
    logError(`Missing required dependencies: ${missingDeps.join(', ')}`);
    logInfo('Please run: npm install');
    process.exit(1);
  }

  logSuccess('All required dependencies found');
}

// Create testnet-specific scripts
function setupTestnetScripts() {
  logInfo('Setting up testnet scripts...');

  const scriptsDir = path.join(projectRoot, 'scripts');
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  // Create testnet validation script
  const validationScript = `#!/usr/bin/env node

/**
 * Validate testnet configuration and connection
 */

import { NEUTRON_TESTNET_CHAIN_INFO, testnetUtils } from '../src/config/testnet.js';

async function validateTestnetConnection() {
  console.log('🔍 Validating testnet configuration...');

  // Check if testnet is enabled
  if (!testnetUtils.isTestnet()) {
    console.error('❌ Testnet mode not enabled. Check VITE_NETWORK and VITE_ENABLE_TESTNET');
    process.exit(1);
  }

  console.log('✅ Testnet mode enabled');

  // Check RPC endpoint
  try {
    const response = await fetch(NEUTRON_TESTNET_CHAIN_INFO.rpc + '/health');
    if (response.ok) {
      console.log('✅ RPC endpoint accessible');
    } else {
      console.warn('⚠️  RPC endpoint returned non-200 status');
    }
  } catch (error) {
    console.warn('⚠️  Could not reach RPC endpoint:', error.message);
  }

  // Check REST endpoint
  try {
    const response = await fetch(NEUTRON_TESTNET_CHAIN_INFO.rest + '/node_info');
    if (response.ok) {
      console.log('✅ REST endpoint accessible');
    } else {
      console.warn('⚠️  REST endpoint returned non-200 status');
    }
  } catch (error) {
    console.warn('⚠️  Could not reach REST endpoint:', error.message);
  }

  // Check contract deployment status
  const deploymentStatus = testnetUtils.getDeploymentStatus();
  if (deploymentStatus.allDeployed) {
    console.log('✅ All contracts deployed');
  } else {
    console.warn('⚠️  Some contracts not deployed yet:');
    if (!deploymentStatus.launchpad) console.warn('   - Launchpad contract missing');
    if (!deploymentStatus.cw20CodeId) console.warn('   - CW20 code ID missing');
  }

  console.log('\\n🎉 Testnet validation complete!');
}

validateTestnetConnection().catch(console.error);
`;

  const validationScriptPath = path.join(scriptsDir, 'validate-testnet.js');
  fs.writeFileSync(validationScriptPath, validationScript);

  // Make it executable
  try {
    fs.chmodSync(validationScriptPath, '755');
  } catch (error) {
    // Ignore chmod errors on Windows
  }

  logSuccess('Testnet scripts created');
}

// Generate setup report
function generateSetupReport() {
  const report = {
    timestamp: new Date().toISOString(),
    environment: 'testnet',
    configuration: {
      envFile: '.env.local (copied from .env.testnet)',
      network: 'pion-1 (Neutron Testnet)',
      rpc: 'https://rpc-falcron.pion-1.ntrn.tech',
      rest: 'https://rest-falcron.pion-1.ntrn.tech',
    },
    nextSteps: [
      'Deploy smart contracts to testnet',
      'Update contract addresses in .env.local',
      'Fund wallet with testnet tokens',
      'Run npm run dev to start development server',
      'Test contract interactions',
    ],
    resources: {
      faucet: 'https://discord.gg/neutronorg (#testnet-faucet)',
      explorer: 'https://neutron.celat.one/pion-1',
      docs: 'https://docs.neutron.org/',
    },
  };

  const reportPath = path.join(projectRoot, 'testnet-setup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return report;
}

// Display setup instructions
function displayInstructions(report) {
  logHeader('🚀 CF1 Testnet Setup Complete!');

  console.log(`${colors.green}Configuration:${colors.reset}`);
  console.log(`  • Environment: ${report.environment}`);
  console.log(`  • Network: ${report.configuration.network}`);
  console.log(`  • RPC: ${report.configuration.rpc}`);
  console.log(`  • Configuration file: ${report.configuration.envFile}`);

  console.log(`\n${colors.yellow}Next Steps:${colors.reset}`);
  report.nextSteps.forEach((step, index) => {
    console.log(`  ${index + 1}. ${step}`);
  });

  console.log(`\n${colors.cyan}Resources:${colors.reset}`);
  console.log(`  • Faucet: ${report.resources.faucet}`);
  console.log(`  • Explorer: ${report.resources.explorer}`);
  console.log(`  • Documentation: ${report.resources.docs}`);

  console.log(`\n${colors.magenta}Quick Commands:${colors.reset}`);
  console.log(`  • Start development: ${colors.bright}npm run dev${colors.reset}`);
  console.log(`  • Validate testnet: ${colors.bright}node scripts/validate-testnet.js${colors.reset}`);
  console.log(`  • Deploy contracts: ${colors.bright}cd ../CF1\\ Code/cf1-core && make deploy-testnet${colors.reset}`);

  console.log(`\n${colors.green}Setup report saved to: testnet-setup-report.json${colors.reset}\n`);
}

// Main setup function
async function main() {
  try {
    logHeader('CF1 Frontend - Testnet Setup');

    validateProjectStructure();
    setupEnvironmentConfig();
    validateEnvironmentConfig();
    checkDependencies();
    setupTestnetScripts();

    const report = generateSetupReport();
    displayInstructions(report);

    logSuccess('Testnet setup completed successfully!');
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
CF1 Frontend Testnet Setup

Usage: node scripts/setup-testnet.js [options]

Options:
  --help, -h    Show this help message

This script will:
1. Validate project structure
2. Copy testnet environment configuration
3. Validate configuration
4. Check dependencies
5. Create testnet-specific scripts
6. Generate setup report

Make sure to run this from the CF1 frontend directory.
  `);
  process.exit(0);
}

// Run main function
main().catch((error) => {
  logError(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});