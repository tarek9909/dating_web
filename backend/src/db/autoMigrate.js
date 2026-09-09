import { pool } from './pool.js';
import { config } from '../config/env.js';

export async function runAutoMigrations() {
  const dbName = config.db.name;

  async function addColumnIfNotExists(table, column, definition) {
    try {
      const [cols] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE (TABLE_SCHEMA = ? OR TABLE_SCHEMA = DATABASE()) 
           AND TABLE_NAME = ? 
           AND COLUMN_NAME = ?`,
        [dbName, table, column]
      );
      if (cols.length === 0) {
        await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
        console.log(`[AutoMigrate] ✓ Added column '${column}' to table '${table}'`);
      }
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        return; // Already exists
      }
      console.warn(`[AutoMigrate] Warning adding '${column}' to '${table}':`, err.message);
    }
  }

  try {
    // 1. invitation_locations.custom_tag
    await addColumnIfNotExists('invitation_locations', 'custom_tag', 'VARCHAR(100) NULL AFTER custom_description');

    // 2. invitation_food_options.custom_tag
    await addColumnIfNotExists('invitation_food_options', 'custom_tag', 'VARCHAR(100) NULL AFTER custom_description');

    // 3. invitation_content time picker & theme accent
    await addColumnIfNotExists('invitation_content', 'picker_start_time', "VARCHAR(50) NULL DEFAULT '6:00 PM'");
    await addColumnIfNotExists('invitation_content', 'picker_end_time', "VARCHAR(50) NULL DEFAULT '11:00 PM'");
    await addColumnIfNotExists('invitation_content', 'theme_accent_color', 'VARCHAR(30) NULL DEFAULT NULL');

    // 4. invitations claim status
    await addColumnIfNotExists('invitations', 'is_claimed', 'BOOLEAN NOT NULL DEFAULT FALSE');
    await addColumnIfNotExists('invitations', 'claimed_at', 'DATETIME NULL');
    await addColumnIfNotExists('invitations', 'claimed_payload', 'JSON NULL');

    // 5. invitation_events event_type ENUM expansion
    try {
      await pool.query(`
        ALTER TABLE invitation_events
        MODIFY COLUMN event_type ENUM('view', 'yes_click', 'no_click', 'location_select', 'food_select', 'date_select', 'share_click', 'rsvp_complete') NOT NULL
      `);
    } catch (err) {
      console.warn('[AutoMigrate] Notice on invitation_events ENUM update:', err.message);
    }

    console.log('[AutoMigrate] Schema checks completed successfully.');
  } catch (err) {
    console.error('[AutoMigrate] Migration run error:', err.message);
  }
}

// Allow standalone execution: node src/db/autoMigrate.js
if (process.argv[1] && process.argv[1].endsWith('autoMigrate.js')) {
  runAutoMigrations()
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
