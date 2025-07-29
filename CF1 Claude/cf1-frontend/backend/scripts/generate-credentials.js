#!/usr/bin/env node

/**
 * CF1 Security Credential Generator
 * Generates secure keys and hashes for production deployment
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function generateSecureKey(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateJWTSecret() {
  return crypto.randomBytes(32).toString('base64');
}

async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('🔐 CF1 Security Credential Generator');
  console.log('=====================================\n');
  
  // Generate secure keys
  const jwtSecret = generateJWTSecret();
  const apiKey = generateSecureKey(32);
  const webhookSecret = generateSecureKey(32);
  const csrfSecret = generateSecureKey(32);
  const encryptionKey = generateSecureKey(16); // 32 bytes for AES-256
  
  console.log('Generated secure keys:');
  console.log('----------------------');
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`ADMIN_API_KEY=${apiKey}`);
  console.log(`WEBHOOK_SECRET=${webhookSecret}`);
  console.log(`CSRF_SECRET=${csrfSecret}`);
  console.log(`ENCRYPTION_KEY=${encryptionKey}`);
  console.log('');
  
  // Get admin username
  const adminUsername = await new Promise((resolve) => {
    rl.question('Enter admin username: ', resolve);
  });
  
  // Get admin password
  const adminPassword = await new Promise((resolve) => {
    rl.question('Enter admin password (will be hashed): ', resolve);
  });
  
  // Hash the password
  const passwordHash = await hashPassword(adminPassword);
  
  console.log('\\nAdmin credentials:');
  console.log('------------------');
  console.log(`ADMIN_USERNAME=${adminUsername}`);
  console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
  console.log('');
  
  // Generate complete .env template
  console.log('Complete .env configuration:');
  console.log('============================');
  console.log(`NODE_ENV=production`);
  console.log(`PORT=3001`);
  console.log(`FRONTEND_URL=https://your-cf1-frontend-domain.com`);
  console.log(`BACKEND_URL=https://your-cf1-backend-domain.com`);
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`JWT_EXPIRES_IN=24h`);
  console.log(`ADMIN_API_KEY=${apiKey}`);
  console.log(`ADMIN_USERNAME=${adminUsername}`);
  console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
  console.log(`AI_SERVICE_URL=https://your-ai-service-domain.com`);
  console.log(`AI_SERVICE_API_KEY=your-secure-ai-service-api-key`);
  console.log(`WEBHOOK_SECRET=${webhookSecret}`);
  console.log(`DATABASE_URL=your-production-database-connection-string`);
  console.log(`CSRF_SECRET=${csrfSecret}`);
  console.log(`ENCRYPTION_KEY=${encryptionKey}`);
  console.log('');
  
  console.log('⚠️  IMPORTANT SECURITY REMINDERS:');
  console.log('- Store these values securely in your production environment');
  console.log('- Never commit the .env file to version control');
  console.log('- Use different keys for different environments');
  console.log('- Rotate keys regularly (every 90 days recommended)');
  console.log('- Consider using a key management service for production');
  
  rl.close();
}

main().catch(console.error);