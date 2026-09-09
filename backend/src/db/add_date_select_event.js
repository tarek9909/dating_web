import { pool } from './pool.js';

async function main() {
  console.log('Modifying invitation_events.event_type to include date_select...');
  await pool.execute(`
    ALTER TABLE invitation_events
    MODIFY COLUMN event_type ENUM('view', 'yes_click', 'no_click', 'location_select', 'food_select', 'date_select', 'share_click', 'rsvp_complete') NOT NULL
  `);
  console.log('Successfully updated invitation_events.event_type to include date_select!');
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
