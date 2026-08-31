/**
 * Baseline an existing database into the migration workflow WITHOUT re-running
 * any migrations, so existing data is preserved.
 *
 * An existing database (built previously via `sequelize.sync()`) already has the
 * schema that earlier migrations describe. If we ran those migrations they would
 * fail or touch existing tables, so we instead record them as "already applied"
 * in SequelizeMeta.
 *
 * Usage (from api/):
 *   node scripts/baseline.js migrations/0001-baseline.js migrations/0002-shared-languages.js
 *
 * - Development (already has the new shared-language schema):
 *     baseline 0001 + 0002
 * - Production (still has the old per-owner schema):
 *     baseline 0001 only, then run `npm run db:migrate` to apply 0002.
 * - Brand-new empty database:
 *     baseline NOTHING (create it empty), then run `npm run db:migrate`. Note a
 *     truly greenfield DB also needs the pre-migration tables; restore a dump
 *     from an existing environment rather than relying only on migrations.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false
});

const filenames = process.argv.slice(2).map((p) => p.replace(/\\/g, '/').split('/').pop());

async function main() {
  if (!filenames.length) {
    console.error('Usage: node scripts/baseline.js <migration-file> [migration-file ...]');
    process.exit(1);
  }

  await sequelize.query(
    'CREATE TABLE IF NOT EXISTS SequelizeMeta (name VARCHAR(255) NOT NULL UNIQUE, PRIMARY KEY (name))'
  );

  for (const name of filenames) {
    await sequelize.query(
      'INSERT IGNORE INTO SequelizeMeta (name) VALUES (?)',
      { replacements: [name] }
    );
    console.log(`Baselined as applied: ${name}`);
  }

  const existing = await sequelize.query('SELECT name FROM SequelizeMeta ORDER BY name', { type: 'SELECT' });
  console.log('\nSequelizeMeta now contains:');
  existing.forEach((r) => console.log('  -', r.name));

  await sequelize.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
