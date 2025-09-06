/**
 * Direct database script to create test users for production
 * Run this with: node create_production_users.js
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'data/cf1.db');

// Test users data
const testUsers = [
  {
    firstName: 'Brock',
    lastName: 'Hardwick',
    email: 'brock@cf1platform.com',
    password: 'password123',
    role: 'super_admin',
    accountStatus: 'active',
    kycStatus: 'verified'
  },
  {
    firstName: 'Brian',
    lastName: 'Smith', 
    email: 'brian@cf1platform.com',
    password: 'password123',
    role: 'platform_admin',
    accountStatus: 'active',
    kycStatus: 'verified'
  },
  {
    firstName: 'Tim',
    lastName: 'Johnson',
    email: 'tim@cf1platform.com',
    password: 'password123',
    role: 'user',
    accountStatus: 'active',
    kycStatus: 'pending'
  }
];

async function createUsers() {
  console.log('🚀 Creating test users in production database...');
  console.log(`Database path: ${dbPath}`);
  
  const db = new sqlite3.Database(dbPath);
  
  try {
    // First, check if users table exists and show its structure
    await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='users';", (err, rows) => {
        if (err) reject(err);
        if (rows.length === 0) {
          console.log('❌ Users table not found!');
          reject(new Error('Users table not found'));
        } else {
          console.log('✅ Users table found');
          resolve();
        }
      });
    });

    // Get table schema
    await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(users);", (err, rows) => {
        if (err) reject(err);
        console.log('📋 Table schema:');
        rows.forEach(col => {
          console.log(`  - ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`);
        });
        resolve();
      });
    });
    
    // Check existing users
    await new Promise((resolve, reject) => {
      db.all("SELECT email, firstName, lastName, role FROM users;", (err, rows) => {
        if (err) reject(err);
        console.log(`\n👥 Existing users (${rows.length}):`);
        rows.forEach(user => {
          console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
        });
        resolve();
      });
    });

    // Create test users
    for (const userData of testUsers) {
      const userId = uuidv4();
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const walletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      const now = new Date().toISOString();
      
      console.log(`\n➕ Creating: ${userData.firstName} ${userData.lastName} (${userData.email})`);
      
      // Check if user already exists
      const exists = await new Promise((resolve, reject) => {
        db.get("SELECT id FROM users WHERE email = ?;", [userData.email], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
      
      if (exists) {
        console.log(`  ⚠️ User already exists, skipping...`);
        continue;
      }
      
      // Insert user
      await new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO users (
            id, email, passwordHash, firstName, lastName, displayName, 
            walletAddress, primaryAuthMethod, role, accountStatus, kycStatus,
            emailVerified, acceptedTerms, termsAcceptedAt, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
          userId,
          userData.email,
          passwordHash,
          userData.firstName,
          userData.lastName,
          `${userData.firstName} ${userData.lastName}`,
          walletAddress,
          'email',
          userData.role,
          userData.accountStatus,
          userData.kycStatus,
          1, // emailVerified = true
          1, // acceptedTerms = true  
          now, // termsAcceptedAt
          now, // createdAt
          now  // updatedAt
        ];
        
        db.run(sql, values, function(err) {
          if (err) {
            console.log(`  ❌ Error: ${err.message}`);
            reject(err);
          } else {
            console.log(`  ✅ Created successfully`);
            resolve();
          }
        });
      });
    }
    
    // Show final user list
    await new Promise((resolve, reject) => {
      db.all("SELECT email, firstName, lastName, role FROM users ORDER BY createdAt;", (err, rows) => {
        if (err) reject(err);
        console.log(`\n🎉 Final user list (${rows.length}):`);
        rows.forEach(user => {
          console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
        });
        resolve();
      });
    });
    
    console.log('\n📋 Login Credentials:');
    testUsers.forEach(user => {
      console.log(`  ${user.firstName} ${user.lastName}: ${user.email} / password123`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    db.close();
  }
}

createUsers();