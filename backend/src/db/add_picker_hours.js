import { pool } from './pool.js';

async function main() {
  try {
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = 'invitation_platform' 
         AND TABLE_NAME = 'invitation_content' 
         AND COLUMN_NAME = 'picker_start_time'`
    );

    if (cols.length === 0) {
      await pool.query("ALTER TABLE invitation_content ADD COLUMN picker_start_time VARCHAR(50) NULL DEFAULT '6:00 PM' AFTER when_subtitle");
      console.log('Added picker_start_time column to invitation_content successfully');
    } else {
      console.log('picker_start_time column already exists');
    }

    const [endCols] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = 'invitation_platform' 
         AND TABLE_NAME = 'invitation_content' 
         AND COLUMN_NAME = 'picker_end_time'`
    );

    if (endCols.length === 0) {
      await pool.query("ALTER TABLE invitation_content ADD COLUMN picker_end_time VARCHAR(50) NULL DEFAULT '11:00 PM' AFTER picker_start_time");
      console.log('Added picker_end_time column to invitation_content successfully');
    } else {
      console.log('picker_end_time column already exists');
    }

    const [fields] = await pool.query('DESCRIBE invitation_content');
    console.log('invitation_content columns:', fields.map(f => f.Field));
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

main();
