import { pool } from './pool.js';

async function main() {
  console.log('Adding theme_accent_color to invitation_content...');
  try {
    await pool.execute(`
      ALTER TABLE invitation_content
      ADD COLUMN theme_accent_color VARCHAR(30) NULL DEFAULT NULL
    `);
    console.log('Column theme_accent_color successfully added to invitation_content!');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column theme_accent_color already exists.');
    } else {
      console.error('Migration failed:', err);
      process.exit(1);
    }
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
