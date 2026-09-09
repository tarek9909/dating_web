import { pool } from './pool.js';
import { config } from '../config/env.js';

const ESSENTIAL_THEMES = [
  {
    id: 1,
    slug: 'romantic-velvet',
    name: 'Romantic Velvet',
    description: 'Deep burgundy luxury velvet palette with glowing rose accents and glassmorphism',
    primary_color: '#ff4d6d',
    secondary_color: '#ff758f',
    background_color: '#0f0207',
    text_color: '#ffffff',
    font_family: 'Outfit',
    configuration: {
      wine: '#220412',
      burgundy: '#3a0820',
      cardBg: 'rgba(35, 8, 22, 0.72)',
      cardHoverBg: 'rgba(55, 12, 35, 0.85)',
      cardSelectedBg: 'linear-gradient(160deg, rgba(65, 14, 40, 0.95), rgba(40, 8, 25, 0.95))',
      borderSubtle: 'rgba(255, 180, 200, 0.18)',
      borderActive: 'rgba(255, 77, 109, 0.65)',
      glowPink: '0 0 25px rgba(255, 77, 109, 0.45)',
      primaryRgb: '255, 77, 109',
      secondaryRgb: '255, 117, 143',
    }
  },
  {
    id: 2,
    slug: 'midnight-sapphire',
    name: 'Midnight Sapphire',
    description: 'Kohl leyl ma3 electric blue starlight romantic vibes',
    primary_color: '#38bdf8',
    secondary_color: '#818cf8',
    background_color: '#030712',
    text_color: '#ffffff',
    font_family: 'Outfit',
    configuration: {
      wine: '#0c1938',
      burgundy: '#172554',
      cardBg: 'rgba(8, 20, 48, 0.75)',
      cardHoverBg: 'rgba(12, 30, 70, 0.85)',
      cardSelectedBg: 'linear-gradient(160deg, rgba(14, 45, 95, 0.95), rgba(8, 25, 55, 0.95))',
      borderSubtle: 'rgba(129, 140, 248, 0.22)',
      borderActive: 'rgba(56, 189, 248, 0.75)',
      glowPink: '0 0 25px rgba(56, 189, 248, 0.5)',
      primaryRgb: '56, 189, 248',
      secondaryRgb: '129, 140, 248',
    }
  },
  {
    id: 3,
    slug: 'emerald-enchantment',
    name: 'Emerald Enchantment',
    description: 'Zomorrod ghame2 ma3 mint glow w touch dahabi',
    primary_color: '#10b981',
    secondary_color: '#34d399',
    background_color: '#021a0e',
    text_color: '#ffffff',
    font_family: 'Outfit',
    configuration: {
      wine: '#042f2e',
      burgundy: '#064e3b',
      cardBg: 'rgba(6, 40, 28, 0.75)',
      cardHoverBg: 'rgba(8, 60, 40, 0.85)',
      cardSelectedBg: 'linear-gradient(160deg, rgba(6, 78, 59, 0.95), rgba(4, 47, 46, 0.95))',
      borderSubtle: 'rgba(52, 211, 153, 0.22)',
      borderActive: 'rgba(16, 185, 129, 0.75)',
      glowPink: '0 0 25px rgba(16, 185, 129, 0.5)',
      primaryRgb: '16, 185, 129',
      secondaryRgb: '52, 211, 153',
    }
  },
  {
    id: 4,
    slug: 'amethyst-dream',
    name: 'Amethyst Dream',
    description: 'Violet malaki sa7er ma3 lavender starlight neon',
    primary_color: '#c084fc',
    secondary_color: '#e879f9',
    background_color: '#0c0217',
    text_color: '#ffffff',
    font_family: 'Outfit',
    configuration: {
      wine: '#2e1065',
      burgundy: '#3b0764',
      cardBg: 'rgba(38, 10, 68, 0.75)',
      cardHoverBg: 'rgba(55, 15, 95, 0.85)',
      cardSelectedBg: 'linear-gradient(160deg, rgba(74, 15, 115, 0.95), rgba(45, 8, 75, 0.95))',
      borderSubtle: 'rgba(232, 121, 249, 0.22)',
      borderActive: 'rgba(192, 132, 252, 0.75)',
      glowPink: '0 0 25px rgba(192, 132, 252, 0.5)',
      primaryRgb: '192, 132, 252',
      secondaryRgb: '232, 121, 249',
    }
  },
  {
    id: 5,
    slug: 'golden-champagne',
    name: 'Golden Champagne',
    description: 'Nour sham3a dafi ma3 espresso velvet fakhim',
    primary_color: '#f59e0b',
    secondary_color: '#fbbf24',
    background_color: '#140a02',
    text_color: '#ffffff',
    font_family: 'Outfit',
    configuration: {
      wine: '#451a03',
      burgundy: '#78350f',
      cardBg: 'rgba(45, 22, 5, 0.75)',
      cardHoverBg: 'rgba(65, 32, 8, 0.85)',
      cardSelectedBg: 'linear-gradient(160deg, rgba(95, 45, 10, 0.95), rgba(60, 25, 5, 0.95))',
      borderSubtle: 'rgba(251, 191, 36, 0.22)',
      borderActive: 'rgba(245, 158, 11, 0.75)',
      glowPink: '0 0 25px rgba(245, 158, 11, 0.5)',
      primaryRgb: '245, 158, 11',
      secondaryRgb: '251, 191, 36',
    }
  },
  {
    id: 6,
    slug: 'sunset-coral',
    name: 'Sunset Coral',
    description: 'Ghroub Batroun dafi ma3 terracotta w peachy blush',
    primary_color: '#f97316',
    secondary_color: '#fb923c',
    background_color: '#170503',
    text_color: '#ffffff',
    font_family: 'Outfit',
    configuration: {
      wine: '#431407',
      burgundy: '#7c2d12',
      cardBg: 'rgba(50, 15, 8, 0.75)',
      cardHoverBg: 'rgba(75, 25, 12, 0.85)',
      cardSelectedBg: 'linear-gradient(160deg, rgba(110, 35, 15, 0.95), rgba(70, 20, 8, 0.95))',
      borderSubtle: 'rgba(251, 146, 60, 0.22)',
      borderActive: 'rgba(249, 115, 22, 0.75)',
      glowPink: '0 0 25px rgba(249, 115, 22, 0.5)',
      primaryRgb: '249, 115, 22',
      secondaryRgb: '251, 146, 60',
    }
  }
];

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
        MODIFY COLUMN event_type ENUM('view', 'yes_click', 'no_click', 'location_select', 'food_select', 'date_select', 'share_click', 'rsvp_complete', 'button_click', 'restart_click') NOT NULL
      `);
    } catch (err) {
      console.warn('[AutoMigrate] Notice on invitation_events ENUM update:', err.message);
    }

    // 6. Ensure all 6 themes exist so foreign key constraint fk_invitations_theme never fails
    try {
      for (const t of ESSENTIAL_THEMES) {
        await pool.execute(
          `INSERT INTO themes (id, slug, name, description, primary_color, secondary_color, background_color, text_color, font_family, configuration, active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             slug = VALUES(slug),
             description = VALUES(description),
             primary_color = VALUES(primary_color),
             secondary_color = VALUES(secondary_color),
             background_color = VALUES(background_color),
             text_color = VALUES(text_color),
             font_family = VALUES(font_family),
             configuration = VALUES(configuration),
             active = TRUE`,
          [t.id, t.slug, t.name, t.description, t.primary_color, t.secondary_color, t.background_color, t.text_color, t.font_family, JSON.stringify(t.configuration)]
        );
      }
      console.log('[AutoMigrate] ✓ Verified & synced core themes (1-6).');
    } catch (err) {
      console.warn('[AutoMigrate] Notice syncing themes:', err.message);
    }

    // 7. Ensure default template exists
    try {
      const [tpls] = await pool.execute('SELECT id FROM templates LIMIT 1');
      if (tpls.length === 0) {
        await pool.execute(
          `INSERT INTO templates (id, theme_id, name, slug, description, preview_image_url, default_configuration, active, sort_order)
           VALUES (1, 1, 'Romantic Date Night', 'romantic-date-night', 'The playful runaway NO button, strike 3 angry alert, date planning, and WhatsApp RSVP ticket', '/gifs/final_date.gif', ?, TRUE, 1)
           ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [JSON.stringify({ sections: ['invitation', 'location', 'food', 'when', 'dress_code', 'final'], allowSound: true, allowParticles: true })]
        );
        console.log('[AutoMigrate] ✓ Seeded default template.');
      }
    } catch (err) {
      console.warn('[AutoMigrate] Notice syncing templates:', err.message);
    }

    console.log('[AutoMigrate] Schema and core data checks completed successfully.');
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
