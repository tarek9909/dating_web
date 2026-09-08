import mysql from 'mysql2/promise';
import { config } from '../config/env.js';

async function migrateV4() {
  console.log('--- Running Migration V4: Anti-Reuse "Burn After RSVP" Columns in invitations ---');
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
  });

  try {
    async function addColumnIfNotExists(table, column, definition) {
      const [cols] = await conn.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [config.db.name, table, column]
      );
      if (cols.length === 0) {
        console.log(`Adding ${column} to ${table}...`);
        await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
        console.log(`✓ Added ${column} to ${table}`);
      } else {
        console.log(`- Column ${column} already exists in ${table}`);
      }
    }

    await addColumnIfNotExists('invitations', 'is_claimed', 'BOOLEAN NOT NULL DEFAULT FALSE');
    await addColumnIfNotExists('invitations', 'claimed_at', 'DATETIME NULL');
    await addColumnIfNotExists('invitations', 'claimed_payload', 'JSON NULL');

    console.log('\n✓ Migration V4 completed successfully!');
  } catch (err) {
    console.error('Migration V4 error:', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

migrateV4();
