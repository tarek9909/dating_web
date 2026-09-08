import mysql from 'mysql2/promise';
import { config } from '../config/env.js';

async function migrateV2() {
  console.log('--- Running Migration V2: Dynamic Content & Scheduler Columns ---');
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
  });

  try {
    // Helper to safely add column if not exists
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

    // 1. Invitations: schedule_mode
    await addColumnIfNotExists('invitations', 'schedule_mode', "ENUM('strict', 'picker') NOT NULL DEFAULT 'strict'");

    // 2. Invitation Content: subtitles, category_type, dress_code_checklist
    await addColumnIfNotExists('invitation_content', 'location_subtitle', 'TEXT NULL');
    await addColumnIfNotExists('invitation_content', 'category_type', "VARCHAR(50) NOT NULL DEFAULT 'food'");
    await addColumnIfNotExists('invitation_content', 'food_subtitle', 'TEXT NULL');
    await addColumnIfNotExists('invitation_content', 'when_subtitle', 'TEXT NULL');
    await addColumnIfNotExists('invitation_content', 'dress_code_subtitle', 'TEXT NULL');
    await addColumnIfNotExists('invitation_content', 'dress_code_checklist', 'JSON NULL');

    // 3. Invitation Food Options: custom fields for non-food activities or custom food
    await addColumnIfNotExists('invitation_food_options', 'custom_name', 'VARCHAR(180) NULL');
    await addColumnIfNotExists('invitation_food_options', 'custom_description', 'TEXT NULL');
    await addColumnIfNotExists('invitation_food_options', 'custom_image_url', 'VARCHAR(1000) NULL');
    await addColumnIfNotExists('invitation_food_options', 'custom_emoji', 'VARCHAR(30) NULL');

    console.log('\n✓ Migration V2 completed successfully!');
  } catch (err) {
    console.error('Migration V2 error:', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

migrateV2();
