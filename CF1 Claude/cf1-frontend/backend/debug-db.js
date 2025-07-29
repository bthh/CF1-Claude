#!/usr/bin/env node

/**
 * Debug Database - Check Analysis Records
 */

const { DataSource } = require('typeorm');
const path = require('path');

async function checkDatabase() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: path.join(__dirname, 'data/cf1.db'),
    entities: [],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('🔍 Database connection established');

    const result = await dataSource.query(`
      SELECT proposalId, status, errorMessage, createdAt, updatedAt 
      FROM proposal_ai_analyses 
      ORDER BY createdAt DESC 
      LIMIT 5
    `);

    console.log('\n📊 Recent Analysis Records:');
    result.forEach((record, index) => {
      console.log(`\n${index + 1}. Proposal: ${record.proposalId}`);
      console.log(`   Status: ${record.status}`);
      console.log(`   Error: ${record.errorMessage || 'None'}`);
      console.log(`   Created: ${record.createdAt}`);
      console.log(`   Updated: ${record.updatedAt}`);
    });

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

checkDatabase();