require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: console.log
});

const q = (sql, replacements) => sequelize.query(sql, { replacements, type: Sequelize.QueryTypes.SELECT, raw: true });

const exec = (sql, replacements) => sequelize.query(sql, { replacements });

async function main() {
  console.log('--- Creating nma_owner_languages if not exists ---');
  await exec(`
    CREATE TABLE IF NOT EXISTS nma_owner_languages (
      id INT NOT NULL AUTO_INCREMENT,
      owner_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
      language_id INT NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY owner_language_unique (owner_id, language_id),
      CONSTRAINT fk_ol_owner FOREIGN KEY (owner_id) REFERENCES nma_owners(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_ol_lang FOREIGN KEY (language_id) REFERENCES nma_languages(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log('--- Backfilling OwnerLanguage rows for per-owner languages ---');
  const perOwner = await q(
    'SELECT id, code, ownerId, isDefault, isActive FROM nma_languages WHERE ownerId IS NOT NULL'
  );
  for (const lang of perOwner) {
    await exec(
      `INSERT IGNORE INTO nma_owner_languages (owner_id, language_id, is_active, is_default, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [lang.ownerId, lang.id, lang.isActive === 0 ? 0 : 1, lang.isDefault === 1 ? 1 : 0]
    );
  }

  console.log('--- Backfilling OwnerLanguage rows for shared languages on all owners ---');
  // For shared languages, give every existing owner an explicit row (defaults to active).
  const owners = await q('SELECT id FROM nma_owners');
  const shared = await q('SELECT id, isDefault FROM nma_languages WHERE ownerId IS NULL');
  for (const owner of owners) {
    for (const lang of shared) {
      await exec(
        `INSERT IGNORE INTO nma_owner_languages (owner_id, language_id, is_active, is_default, createdAt, updatedAt)
         VALUES (?, ?, 1, ?, NOW(), NOW())`,
        [owner.id, lang.id, lang.isDefault === 1 ? 1 : 0]
      );
    }
  }

  console.log('--- Normalizing languages to shared (ownerId -> NULL) ---');
  await exec('UPDATE nma_languages SET ownerId = NULL');

  console.log('--- Deduplicating language codes ---');
  const groups = await q('SELECT code, COUNT(*) AS c FROM nma_languages GROUP BY code HAVING c > 1');
  for (const g of groups) {
    const rows = await q('SELECT id FROM nma_languages WHERE code = ? ORDER BY id ASC', [g.code]);
    if (rows.length <= 1) continue;
    const keepId = rows[0].id;
    const dropIds = rows.slice(1).map((r) => r.id);
    console.log(`Merging duplicates for code "${g.code}": keeping #${keepId}, dropping ${dropIds.join(',')}`);
    // Re-point owner_language rows already created to the kept language
    for (const dropId of dropIds) {
      await exec(
        `INSERT IGNORE INTO nma_owner_languages (owner_id, language_id, is_active, is_default, createdAt, updatedAt)
         SELECT owner_id, ?, is_active, is_default, NOW(), NOW() FROM nma_owner_languages WHERE language_id = ?`,
        [keepId, dropId]
      );
    }
    // Re-point translations to the kept language
    await exec('UPDATE nma_translations SET language_id = ? WHERE language_id IN (?)', [keepId, dropIds]);
    await exec('DELETE FROM nma_languages WHERE id IN (?)', [dropIds]);
  }

  console.log('--- Adjusting indexes / columns on nma_languages ---');
  await exec('ALTER TABLE nma_languages DROP FOREIGN KEY IF EXISTS nma_languages_ownerId_foreign_idx');
  await exec('DROP INDEX IF EXISTS owner_code_unique ON nma_languages');
  await exec('ALTER TABLE nma_languages DROP COLUMN IF EXISTS ownerId');
  await exec('ALTER TABLE nma_languages DROP COLUMN IF EXISTS isActive');
  await exec('ALTER TABLE nma_languages DROP COLUMN IF EXISTS isDefault');
  await exec('DROP INDEX IF EXISTS code_2 ON nma_languages');
  await exec('DROP INDEX IF EXISTS code_3 ON nma_languages');
  await exec('ALTER TABLE nma_languages ADD UNIQUE KEY code_unique (code)');

  console.log('--- Verifying ---');
  const finalLangs = await q('SELECT id, code, name FROM nma_languages ORDER BY id');
  const counts = await q('SELECT language_id, is_active, is_default FROM nma_owner_languages ORDER BY language_id, owner_id');
  console.log('LANGUAGES:', JSON.stringify(finalLangs));
  console.log('OWNER_LANGUAGES:', JSON.stringify(counts));

  await sequelize.close();
  console.log('Migration complete.');
}

main().catch((e) => { console.error(e); process.exit(1); });
