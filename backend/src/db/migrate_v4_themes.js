import mysql from 'mysql2/promise';
import { config } from '../config/env.js';

async function migrateV4() {
  console.log('--- Running Migration V4: Themes and Custom Theme Colors ---');
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

    await addColumnIfNotExists('invitation_content', 'theme_accent_color', 'VARCHAR(30) NULL');

    // Seed/Update 6 Luxury Themes
    const themesToSeed = [
      {
        name: 'Romantic Velvet',
        slug: 'romantic-velvet',
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
          borderSubtle: 'rgba(255, 180, 200, 0.18)',
          borderActive: 'rgba(255, 77, 109, 0.65)',
          glowPink: '0 0 25px rgba(255, 77, 109, 0.45)',
        }
      },
      {
        name: 'Midnight Sapphire',
        slug: 'midnight-sapphire',
        description: 'Deep navy midnight sky with glowing electric sapphire accents',
        primary_color: '#38bdf8',
        secondary_color: '#818cf8',
        background_color: '#030712',
        text_color: '#ffffff',
        font_family: 'Outfit',
        configuration: {
          wine: '#0c1938',
          burgundy: '#172554',
          cardBg: 'rgba(15, 23, 42, 0.78)',
          borderSubtle: 'rgba(147, 197, 253, 0.2)',
          borderActive: 'rgba(56, 189, 248, 0.7)',
          glowPink: '0 0 25px rgba(56, 189, 248, 0.5)',
        }
      },
      {
        name: 'Emerald Enchantment',
        slug: 'emerald-enchantment',
        description: 'Enchanted dark olive forest with vivid emerald glow & subtle gold',
        primary_color: '#10b981',
        secondary_color: '#34d399',
        background_color: '#021a0e',
        text_color: '#ffffff',
        font_family: 'Outfit',
        configuration: {
          wine: '#042f2e',
          burgundy: '#064e3b',
          cardBg: 'rgba(6, 78, 59, 0.72)',
          borderSubtle: 'rgba(167, 243, 208, 0.2)',
          borderActive: 'rgba(16, 185, 129, 0.7)',
          glowPink: '0 0 25px rgba(16, 185, 129, 0.5)',
        }
      },
      {
        name: 'Amethyst Dream',
        slug: 'amethyst-dream',
        description: 'Mystical obsidian violet with radiant starlight purple neon accents',
        primary_color: '#c084fc',
        secondary_color: '#e879f9',
        background_color: '#0c0217',
        text_color: '#ffffff',
        font_family: 'Outfit',
        configuration: {
          wine: '#2e1065',
          burgundy: '#3b0764',
          cardBg: 'rgba(46, 16, 101, 0.72)',
          borderSubtle: 'rgba(233, 213, 255, 0.2)',
          borderActive: 'rgba(192, 132, 252, 0.7)',
          glowPink: '0 0 25px rgba(192, 132, 252, 0.5)',
        }
      },
      {
        name: 'Golden Champagne',
        slug: 'golden-champagne',
        description: 'Warm candlelight amber and rich espresso velvet ambiance',
        primary_color: '#f59e0b',
        secondary_color: '#fbbf24',
        background_color: '#140a02',
        text_color: '#ffffff',
        font_family: 'Outfit',
        configuration: {
          wine: '#451a03',
          burgundy: '#78350f',
          cardBg: 'rgba(69, 26, 3, 0.72)',
          borderSubtle: 'rgba(254, 240, 138, 0.2)',
          borderActive: 'rgba(245, 158, 11, 0.7)',
          glowPink: '0 0 25px rgba(245, 158, 11, 0.5)',
        }
      },
      {
        name: 'Sunset Coral',
        slug: 'sunset-coral',
        description: 'Mediterranean warm sunset blush with rich terracotta tones',
        primary_color: '#f97316',
        secondary_color: '#fb923c',
        background_color: '#170503',
        text_color: '#ffffff',
        font_family: 'Outfit',
        configuration: {
          wine: '#431407',
          burgundy: '#7c2d12',
          cardBg: 'rgba(67, 20, 7, 0.72)',
          borderSubtle: 'rgba(254, 215, 170, 0.2)',
          borderActive: 'rgba(249, 115, 22, 0.7)',
          glowPink: '0 0 25px rgba(249, 115, 22, 0.5)',
        }
      },
    ];

    for (const t of themesToSeed) {
      const [existing] = await conn.execute('SELECT id FROM themes WHERE slug = ?', [t.slug]);
      if (existing.length === 0) {
        await conn.execute(
          `INSERT INTO themes (name, slug, description, primary_color, secondary_color, background_color, text_color, font_family, configuration, active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
          [
            t.name,
            t.slug,
            t.description,
            t.primary_color,
            t.secondary_color,
            t.background_color,
            t.text_color,
            t.font_family,
            JSON.stringify(t.configuration)
          ]
        );
        console.log(`✓ Inserted theme: ${t.name}`);
      } else {
        await conn.execute(
          `UPDATE themes
           SET name = ?, description = ?, primary_color = ?, secondary_color = ?, background_color = ?, text_color = ?, font_family = ?, configuration = ?
           WHERE slug = ?`,
          [
            t.name,
            t.description,
            t.primary_color,
            t.secondary_color,
            t.background_color,
            t.text_color,
            t.font_family,
            JSON.stringify(t.configuration),
            t.slug
          ]
        );
        console.log(`✓ Updated theme: ${t.name}`);
      }
    }

    console.log('\n✓ Migration V4 completed successfully!');
  } catch (err) {
    console.error('Migration V4 error:', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

migrateV4();
