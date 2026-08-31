'use strict';

const query = (queryInterface, sql, options) =>
  queryInterface.sequelize.query(sql, options);

const databaseName = () =>
  queryInterface => queryInterface.sequelize.getQueryInterface().sequelize.config.database;

const tableExists = async (queryInterface, table) => {
  const rows = await query(queryInterface,
    `SELECT COUNT(*) AS c FROM information_schema.tables
     WHERE table_schema = ? AND table_name = ?`,
    { replacements: [databaseName()(queryInterface), table], type: 'SELECT' });
  return Number(rows[0].c) > 0;
};

const columnExists = async (queryInterface, table, column) => {
  const rows = await query(queryInterface,
    `SELECT COUNT(*) AS c FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
    { replacements: [databaseName()(queryInterface), table, column], type: 'SELECT' });
  return Number(rows[0].c) > 0;
};

const indexExists = async (queryInterface, table, index) => {
  const rows = await query(queryInterface,
    `SELECT COUNT(*) AS c FROM information_schema.statistics
     WHERE table_schema = ? AND table_name = ? AND index_name = ?`,
    { replacements: [databaseName()(queryInterface), table, index], type: 'SELECT' });
  return Number(rows[0].c) > 0;
};

module.exports = {
  async up(queryInterface, Sequelize) {
    // ------------------------------------------------------------------
    // 1. Create the per-owner language settings pivot table (shared langs)
    // ------------------------------------------------------------------
    const ownerLanguagesExists = await tableExists(queryInterface, 'nma_owner_languages');
    if (!ownerLanguagesExists) {
      await query(queryInterface, `
        CREATE TABLE nma_owner_languages (
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
    }

    const hasOwnerCol = await columnExists(queryInterface, 'nma_languages', 'ownerId');
    const hasDefaultCol = await columnExists(queryInterface, 'nma_languages', 'isDefault');
    const hasActiveCol = await columnExists(queryInterface, 'nma_languages', 'isActive');

    // ------------------------------------------------------------------
    // 2. Backfill settings from existing per-owner languages
    // ------------------------------------------------------------------
    if (hasOwnerCol) {
      const rows = await query(queryInterface,
        'SELECT id, ownerId, isDefault, isActive FROM nma_languages WHERE ownerId IS NOT NULL',
        { type: 'SELECT' });
      for (const lang of rows) {
        await query(queryInterface,
          `INSERT IGNORE INTO nma_owner_languages
             (owner_id, language_id, is_active, is_default, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          { replacements: [
            lang.ownerId,
            lang.id,
            Number(lang.isActive) === 0 ? 0 : 1,
            Number(lang.isDefault) === 1 ? 1 : 0
          ] });
      }
    }

    // ------------------------------------------------------------------
    // 3. Backfill shared languages for every owner (defaults to active)
    // ------------------------------------------------------------------
    const owners = await query(queryInterface, 'SELECT id FROM nma_owners', { type: 'SELECT' });
    const languages = await query(queryInterface, 'SELECT id FROM nma_languages', { type: 'SELECT' });
    for (const owner of owners) {
      for (const language of languages) {
        await query(queryInterface,
          `INSERT IGNORE INTO nma_owner_languages
             (owner_id, language_id, is_active, is_default, createdAt, updatedAt)
           VALUES (?, ?, 1, 0, NOW(), NOW())`,
          { replacements: [owner.id, language.id] });
      }
    }

    // ------------------------------------------------------------------
    // 4. Set a default (en) for any owner that has no default yet
    // ------------------------------------------------------------------
    const noDefaultOwners = await query(queryInterface,
      'SELECT id FROM nma_owners o WHERE NOT EXISTS (SELECT 1 FROM nma_owner_languages x WHERE x.owner_id = o.id AND x.is_default = 1)',
      { type: 'SELECT' });
    const enLang = await query(queryInterface,
      "SELECT id FROM nma_languages WHERE code = 'en' ORDER BY id ASC LIMIT 1",
      { type: 'SELECT' });
    if (enLang.length) {
      for (const owner of noDefaultOwners) {
        await query(queryInterface,
          'UPDATE nma_owner_languages SET is_default = 1 WHERE owner_id = ? AND language_id = ?',
          { replacements: [owner.id, enLang[0].id] });
      }
    }

    // ------------------------------------------------------------------
    // 5. Transform nma_languages: shared + globally unique code
    // ------------------------------------------------------------------
    await query(queryInterface, 'UPDATE nma_languages SET ownerId = NULL');

    // Drop FK that depends on ownerId (if the profile column/index still exist)
    const fkExists = await query(queryInterface,
      `SELECT COUNT(*) AS c FROM information_schema.key_column_usage
       WHERE table_schema = ? AND table_name = 'nma_languages' AND constraint_name = 'nma_languages_ownerId_foreign_idx'`,
      { replacements: [databaseName()(queryInterface)], type: 'SELECT' });
    if (Number(fkExists[0].c) > 0) {
      await query(queryInterface, 'ALTER TABLE nma_languages DROP FOREIGN KEY nma_languages_ownerId_foreign_idx');
    }

    // Normalize to a single globally-unique 'code' index
    if (await indexExists(queryInterface, 'nma_languages', 'owner_code_unique')) {
      await query(queryInterface, 'DROP INDEX owner_code_unique ON nma_languages');
    }
    if (await indexExists(queryInterface, 'nma_languages', 'code_2')) {
      await query(queryInterface, 'DROP INDEX code_2 ON nma_languages');
    }
    if (await indexExists(queryInterface, 'nma_languages', 'code_3')) {
      await query(queryInterface, 'DROP INDEX code_3 ON nma_languages');
    }
    if (!await indexExists(queryInterface, 'nma_languages', 'code_unique')) {
      await query(queryInterface, 'ALTER TABLE nma_languages ADD UNIQUE KEY code_unique (code)');
    }

    // Drop the now-obsolete per-owner columns if present
    if (hasOwnerCol) await query(queryInterface, 'ALTER TABLE nma_languages DROP COLUMN ownerId');
    if (hasDefaultCol) await query(queryInterface, 'ALTER TABLE nma_languages DROP COLUMN isDefault');
    if (hasActiveCol) await query(queryInterface, 'ALTER TABLE nma_languages DROP COLUMN isActive');
  },

  async down(queryInterface, Sequelize) {
    // Re-adding per-owner columns and duplicating language rows is destructive
    // and not generally reversible; guard the schema is still safe to operate.
    await query(queryInterface, "ALTER TABLE nma_languages ADD COLUMN ownerId CHAR(36) NULL");
    await query(queryInterface, "ALTER TABLE nma_languages ADD COLUMN isDefault TINYINT(1) DEFAULT 0");
    await query(queryInterface, "ALTER TABLE nma_languages ADD COLUMN isActive TINYINT(1) DEFAULT 1");
    await query(queryInterface, 'ALTER TABLE nma_languages ADD UNIQUE INDEX owner_code_unique (ownerId, code)');
    await query(queryInterface, 'DROP TABLE nma_owner_languages');
  }
};
