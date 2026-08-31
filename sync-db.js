const { sequelize } = require('./models');

/**
 * Database connectivity / readiness check.
 *
 * This project now manages schema via Sequelize migrations (`npm run db:migrate`)
 * instead of `sequelize.sync({ alter: true })`, because alter-based syncing can
 * produce errors and unexpected index changes on an existing database.
 *
 * This script no longer alters the schema — it only verifies the connection
 * and reports any pending migrations so you know what still needs applying.
 */
async function sync() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully (no schema changes made).');

    const { QueryTypes } = require('sequelize');
    const applied = await sequelize.query(
      'SELECT name FROM SequelizeMeta ORDER BY name',
      { type: QueryTypes.SELECT, logging: false }
    ).catch(() => []);
    const appliedSet = new Set((applied || []).map((r) => r.name));

    const { readdirSync, statSync } = require('fs');
    const path = require('path');
    const migrationsDir = path.join(__dirname, 'migrations');
    let pending = [];
    try {
      const files = readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.js'))
        .sort();
      pending = files.filter((f) => !appliedSet.has(f));
    } catch (e) {
      console.warn('Could not read migrations directory:', e.message);
    }

    if (pending.length) {
      console.log(`Pending migrations (${pending.length}):`);
      pending.forEach((m) => console.log('  -', m));
      console.log('Run `npm run db:migrate` to apply them.');
    } else {
      console.log('No pending migrations. Schema is up to date.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

sync();
