import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('--- Starting Database Migration ---');
  console.log(`Target: ${config.db.host}:${config.db.port}, Database: ${config.db.name}`);

  // Step 1: Connect to server without database to create it if needed
  const adminConn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  try {
    await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database \`${config.db.name}\` confirmed/created.`);
  } finally {
    await adminConn.end();
  }

  // Step 2: Connect to the specific database and run schema statements
  const dbConn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    multipleStatements: true,
  });

  try {
    const schemaSqlPath = path.resolve(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');

    console.log('Applying schema tables...');
    await dbConn.query(schemaSql);
    console.log('Schema tables applied successfully.');

    // Step 3: Verify created tables
    const [tables] = await dbConn.query('SHOW TABLES;');
    console.log(`Total tables present: ${tables.length}`);
    tables.forEach((t) => {
      const tableName = Object.values(t)[0];
      console.log(` - ${tableName}`);
    });

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await dbConn.end();
  }

  console.log('--- Migration Finished Successfully ---');
}

runMigration();
