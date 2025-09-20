const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_AWqLG2Qskg7N@ep-snowy-poetry-adkcrji4.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
  });

  try {
    await client.connect();
    console.log('Connected to Neon database branch: feature/proposal-status-automated');

    // Check existing tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('Existing tables:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    if (tablesResult.rows.length === 0) {
      console.log('No tables found. Need to create base schema first.');
    }

  } catch (error) {
    console.error('Error checking tables:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();