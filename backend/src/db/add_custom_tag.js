import { pool } from './pool.js';

async function main() {
  try {
    const [cols] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'invitation_platform' AND TABLE_NAME = 'invitation_locations' AND COLUMN_NAME = 'custom_tag'"
    );

    if (cols.length === 0) {
      await pool.query('ALTER TABLE invitation_locations ADD COLUMN custom_tag VARCHAR(100) NULL AFTER custom_description');
      console.log('Added custom_tag column to invitation_locations successfully');
    } else {
      console.log('custom_tag column already exists in invitation_locations');
    }

    const [foodCols] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'invitation_platform' AND TABLE_NAME = 'invitation_food_options' AND COLUMN_NAME = 'custom_tag'"
    );

    if (foodCols.length === 0) {
      await pool.query('ALTER TABLE invitation_food_options ADD COLUMN custom_tag VARCHAR(100) NULL AFTER custom_description');
      console.log('Added custom_tag column to invitation_food_options successfully');
    } else {
      console.log('custom_tag column already exists in invitation_food_options');
    }

    const [fields] = await pool.query('DESCRIBE invitation_locations');
    console.log('invitation_locations columns:', fields.map(f => f.Field));
    const [foodFields] = await pool.query('DESCRIBE invitation_food_options');
    console.log('invitation_food_options columns:', foodFields.map(f => f.Field));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
