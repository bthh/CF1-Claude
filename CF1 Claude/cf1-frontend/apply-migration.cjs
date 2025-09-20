const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_AWqLG2Qskg7N@ep-snowy-poetry-adkcrji4.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
  });

  try {
    await client.connect();
    console.log('Connected to Neon database branch: feature/proposal-status-automated');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '002_add_proposal_status.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration:', migrationPath);
    console.log('SQL:', migrationSQL);

    // Execute the migration
    await client.query(migrationSQL);
    console.log('Migration applied successfully!');

    // Verify the migration by checking if the column exists
    const checkResult = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'proposals' AND column_name = 'status'
    `);

    if (checkResult.rows.length > 0) {
      console.log('Verification successful - status column added:', checkResult.rows[0]);
    } else {
      console.log('Warning: Could not verify migration (proposals table may not exist yet)');
    }

  } catch (error) {
    console.error('Error applying migration:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();