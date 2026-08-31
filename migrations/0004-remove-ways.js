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

const COLUMN_DEFS = {
  slug: 'VARCHAR(255) NOT NULL',
  title: 'VARCHAR(255) NOT NULL',
  subtitle: 'VARCHAR(255) NULL',
  image: 'VARCHAR(255) NULL',
  mediaType: 'VARCHAR(255) NULL',
  mediaUrl: 'VARCHAR(255) NULL',
  body: 'JSON NULL',
  order: 'INTEGER NOT NULL DEFAULT 0',
  active: 'TINYINT(1) NOT NULL DEFAULT 1',
  createdAt: 'DATETIME NOT NULL',
  updatedAt: 'DATETIME NOT NULL'
};

module.exports = {
  async up(queryInterface) {
    // ------------------------------------------------------------------
    // "Ways of Earning" (nma_ways) was a legacy predecessor to the
    // "Earning Streams" feature that is actually displayed on the public
    // presentation. It is no longer used anywhere in the served content
    // and only existed as a separate admin editor, so the table is dropped.
    //
    // nma_way_translations is a legacy, empty child table (not referenced
    // anywhere in the code) that carries a foreign key to nma_ways, so it
    // must be removed first.
    // ------------------------------------------------------------------
    if (await tableExists(queryInterface, 'nma_way_translations')) {
      await query(queryInterface, 'DROP TABLE nma_way_translations');
    }
    if (await tableExists(queryInterface, 'nma_ways')) {
      await query(queryInterface, 'DROP TABLE nma_ways');
    }
  },

  async down(queryInterface) {
    // Best-effort recreation so the migration can be reversed cleanly.
    if (await tableExists(queryInterface, 'nma_way_translations')) return;
    await query(queryInterface, `
      CREATE TABLE nma_way_translations (
        id INT NOT NULL AUTO_INCREMENT,
        wayId INT NOT NULL,
        languageId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) DEFAULT NULL,
        body LONGTEXT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY nma_way_lang_unique (wayId, languageId),
        KEY languageId (languageId),
        CONSTRAINT nma_way_translations_ibfk_3 FOREIGN KEY (wayId) REFERENCES nma_ways (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT nma_way_translations_ibfk_4 FOREIGN KEY (languageId) REFERENCES nma_languages (id) ON DELETE NO ACTION ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    if (await tableExists(queryInterface, 'nma_ways')) return;

    const columns = Object.entries(COLUMN_DEFS)
      .map(([name, def]) => `\`${name}\` ${def}`)
      .join(',\n  ');

    await query(queryInterface, `
      CREATE TABLE nma_ways (
        id INT NOT NULL AUTO_INCREMENT,
        ${columns},
        PRIMARY KEY (id),
        UNIQUE KEY slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }
};
