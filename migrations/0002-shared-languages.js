'use strict';

const query = (queryInterface, sql, options) =>
  queryInterface.sequelize.query(sql, options);

const databaseName = (queryInterface) =>
  queryInterface.sequelize.config.database;

const tableExists = async (queryInterface, table) => {
  const rows = await query(
    queryInterface,
    `SELECT COUNT(*) AS c
     FROM information_schema.tables
     WHERE table_schema = ?
       AND table_name = ?`,
    {
      replacements: [databaseName(queryInterface), table],
      type: 'SELECT'
    }
  );

  return Number(rows[0].c) > 0;
};

const columnExists = async (queryInterface, table, column) => {
  const rows = await query(
    queryInterface,
    `SELECT COUNT(*) AS c
     FROM information_schema.columns
     WHERE table_schema = ?
       AND table_name = ?
       AND column_name = ?`,
    {
      replacements: [databaseName(queryInterface), table, column],
      type: 'SELECT'
    }
  );

  return Number(rows[0].c) > 0;
};

const indexExists = async (queryInterface, table, index) => {
  const rows = await query(
    queryInterface,
    `SELECT COUNT(*) AS c
     FROM information_schema.statistics
     WHERE table_schema = ?
       AND table_name = ?
       AND index_name = ?`,
    {
      replacements: [databaseName(queryInterface), table, index],
      type: 'SELECT'
    }
  );

  return Number(rows[0].c) > 0;
};

const foreignKeyExists = async (
  queryInterface,
  table,
  column,
  referencedTable
) => {
  const rows = await query(
    queryInterface,
    `SELECT DISTINCT constraint_name
     FROM information_schema.key_column_usage
     WHERE constraint_schema = ?
       AND table_name = ?
       AND column_name = ?
       AND referenced_table_name = ?`,
    {
      replacements: [
        databaseName(queryInterface),
        table,
        column,
        referencedTable
      ],
      type: 'SELECT'
    }
  );

  return rows.map(row => row.constraint_name);
};

module.exports = {
  async up(queryInterface, Sequelize) {
    // ------------------------------------------------------------------
    // 1. Create the shared owner/language pivot table
    // ------------------------------------------------------------------

    const ownerLanguagesExists = await tableExists(
      queryInterface,
      'nma_owner_languages'
    );

    if (!ownerLanguagesExists) {
      await query(
        queryInterface,
        `
        CREATE TABLE nma_owner_languages (
          id INT NOT NULL AUTO_INCREMENT,
          owner_id CHAR(36)
            CHARACTER SET utf8mb4
            COLLATE utf8mb4_bin NOT NULL,
          language_id INT NOT NULL,
          is_active TINYINT(1) NOT NULL DEFAULT 1,
          is_default TINYINT(1) NOT NULL DEFAULT 0,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL,

          PRIMARY KEY (id),

          UNIQUE KEY owner_language_unique (
            owner_id,
            language_id
          ),

          CONSTRAINT fk_ol_owner
            FOREIGN KEY (owner_id)
            REFERENCES nma_owners(id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,

          CONSTRAINT fk_ol_lang
            FOREIGN KEY (language_id)
            REFERENCES nma_languages(id)
            ON DELETE CASCADE
            ON UPDATE CASCADE

        ) ENGINE=InnoDB
          DEFAULT CHARSET=utf8mb4
          COLLATE=utf8mb4_unicode_ci
        `
      );
    }

    // ------------------------------------------------------------------
    // 2. Detect the old per-owner columns
    // ------------------------------------------------------------------

    const hasOwnerCol = await columnExists(
      queryInterface,
      'nma_languages',
      'ownerId'
    );

    const hasDefaultCol = await columnExists(
      queryInterface,
      'nma_languages',
      'isDefault'
    );

    const hasActiveCol = await columnExists(
      queryInterface,
      'nma_languages',
      'isActive'
    );

    // ------------------------------------------------------------------
    // 3. Backfill existing per-owner language settings
    // ------------------------------------------------------------------

    if (hasOwnerCol) {
      const rows = await query(
        queryInterface,
        `
        SELECT
          id,
          ownerId,
          isDefault,
          isActive
        FROM nma_languages
        WHERE ownerId IS NOT NULL
        `,
        {
          type: 'SELECT'
        }
      );

      for (const lang of rows) {
        await query(
          queryInterface,
          `
          INSERT IGNORE INTO nma_owner_languages
            (
              owner_id,
              language_id,
              is_active,
              is_default,
              createdAt,
              updatedAt
            )
          VALUES (?, ?, ?, ?, NOW(), NOW())
          `,
          {
            replacements: [
              lang.ownerId,
              lang.id,
              Number(lang.isActive) === 0 ? 0 : 1,
              Number(lang.isDefault) === 1 ? 1 : 0
            ]
          }
        );
      }
    }

    // ------------------------------------------------------------------
    // 4. Add every shared language to every owner
    // ------------------------------------------------------------------

    const owners = await query(
      queryInterface,
      `SELECT id FROM nma_owners`,
      {
        type: 'SELECT'
      }
    );

    const languages = await query(
      queryInterface,
      `SELECT id FROM nma_languages`,
      {
        type: 'SELECT'
      }
    );

    for (const owner of owners) {
      for (const language of languages) {
        await query(
          queryInterface,
          `
          INSERT IGNORE INTO nma_owner_languages
            (
              owner_id,
              language_id,
              is_active,
              is_default,
              createdAt,
              updatedAt
            )
          VALUES (?, ?, 1, 0, NOW(), NOW())
          `,
          {
            replacements: [
              owner.id,
              language.id
            ]
          }
        );
      }
    }

    // ------------------------------------------------------------------
    // 5. Ensure every owner has a default English language
    // ------------------------------------------------------------------

    const enLang = await query(
      queryInterface,
      `
      SELECT id
      FROM nma_languages
      WHERE code = 'en'
      ORDER BY id ASC
      LIMIT 1
      `,
      {
        type: 'SELECT'
      }
    );

    if (enLang.length) {
      const noDefaultOwners = await query(
        queryInterface,
        `
        SELECT o.id
        FROM nma_owners o
        WHERE NOT EXISTS (
          SELECT 1
          FROM nma_owner_languages x
          WHERE x.owner_id = o.id
            AND x.is_default = 1
        )
        `,
        {
          type: 'SELECT'
        }
      );

      for (const owner of noDefaultOwners) {
        await query(
          queryInterface,
          `
          UPDATE nma_owner_languages
          SET is_default = 1
          WHERE owner_id = ?
            AND language_id = ?
          `,
          {
            replacements: [
              owner.id,
              enLang[0].id
            ]
          }
        );
      }
    }

    // ------------------------------------------------------------------
    // 6. Remove old ownerId FK
    //
    // IMPORTANT:
    // Do not assume the FK name.
    //
    // Your current database uses:
    //   nma_languages_ibfk_1
    //
    // Older Sequelize-generated schemas may use another name.
    // ------------------------------------------------------------------

    const ownerForeignKeys = await foreignKeyExists(
      queryInterface,
      'nma_languages',
      'ownerId',
      'nma_owners'
    );

    for (const fkName of ownerForeignKeys) {
      await query(
        queryInterface,
        `ALTER TABLE nma_languages DROP FOREIGN KEY \`${fkName}\``
      );
    }

    // ------------------------------------------------------------------
    // 7. Make ownerId nullable before removing the old structure
    // ------------------------------------------------------------------

    if (hasOwnerCol) {
      await query(
        queryInterface,
        `
        UPDATE nma_languages
        SET ownerId = NULL
        WHERE ownerId IS NOT NULL
        `
      );
    }

    // ------------------------------------------------------------------
    // 8. Remove the old owner/code unique index
    //
    // This MUST happen after the ownerId FK has been removed.
    // ------------------------------------------------------------------

    if (
      await indexExists(
        queryInterface,
        'nma_languages',
        'owner_code_unique'
      )
    ) {
      await query(
        queryInterface,
        `
        DROP INDEX owner_code_unique
        ON nma_languages
        `
      );
    }

    // ------------------------------------------------------------------
    // 9. Remove possible duplicate code indexes
    // ------------------------------------------------------------------

    for (const indexName of ['code_2', 'code_3']) {
      if (
        await indexExists(
          queryInterface,
          'nma_languages',
          indexName
        )
      ) {
        await query(
          queryInterface,
          `
          DROP INDEX \`${indexName}\`
          ON nma_languages
          `
        );
      }
    }

    // ------------------------------------------------------------------
    // 10. Make language code globally unique
    // ------------------------------------------------------------------

    if (
      !(await indexExists(
        queryInterface,
        'nma_languages',
        'code_unique'
      ))
    ) {
      await query(
        queryInterface,
        `
        ALTER TABLE nma_languages
        ADD UNIQUE KEY code_unique (code)
        `
      );
    }

    // ------------------------------------------------------------------
    // 11. Remove obsolete per-owner columns
    // ------------------------------------------------------------------

    if (hasOwnerCol) {
      await query(
        queryInterface,
        `
        ALTER TABLE nma_languages
        DROP COLUMN ownerId
        `
      );
    }

    if (hasDefaultCol) {
      await query(
        queryInterface,
        `
        ALTER TABLE nma_languages
        DROP COLUMN isDefault
        `
      );
    }

    if (hasActiveCol) {
      await query(
        queryInterface,
        `
        ALTER TABLE nma_languages
        DROP COLUMN isActive
        `
      );
    }

    // ------------------------------------------------------------------
    // Migration completed
    // ------------------------------------------------------------------
  },

  async down(queryInterface, Sequelize) {
    // ------------------------------------------------------------------
    // NOTE:
    // The migration is intentionally not fully reversible because
    // converting per-owner languages into shared languages can merge
    // data and therefore cannot safely recreate the original rows.
    // ------------------------------------------------------------------

    const hasOwnerCol = await columnExists(
      queryInterface,
      'nma_languages',
      'ownerId'
    );

    if (!hasOwnerCol) {
      await query(
        queryInterface,
        `
        ALTER TABLE nma_languages
        ADD COLUMN ownerId CHAR(36)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_bin
        NULL
        `
      );
    }

    const hasDefaultCol = await columnExists(
      queryInterface,
      'nma_languages',
      'isDefault'
    );

    if (!hasDefaultCol) {
      await query(
        queryInterface,
        `
        ALTER TABLE nma_languages
        ADD COLUMN isDefault TINYINT(1)
        DEFAULT 0
        `
      );
    }

    const hasActiveCol = await columnExists(
      queryInterface,
      'nma_languages',
      'isActive'
    );

    if (!hasActiveCol) {
      await query(
        queryInterface,
        `
        ALTER TABLE nma_languages
        ADD COLUMN isActive TINYINT(1)
        DEFAULT 1
        `
      );
    }

    // Remove global code uniqueness before recreating owner/code uniqueness.
    if (
      await indexExists(
        queryInterface,
        'nma_languages',
        'code_unique'
      )
    ) {
      await query(
        queryInterface,
        `
        DROP INDEX code_unique
        ON nma_languages
        `
      );
    }

    // Recreate the old owner/code unique index.
    if (
      !(await indexExists(
        queryInterface,
        'nma_languages',
        'owner_code_unique'
      ))
    ) {
      await query(
        queryInterface,
        `
        ALTER TABLE nma_languages
        ADD UNIQUE KEY owner_code_unique (ownerId, code)
        `
      );
    }

    // Recreate the owner FK if it does not exist.
    const ownerForeignKeys = await foreignKeyExists(
      queryInterface,
      'nma_languages',
      'ownerId',
      'nma_owners'
    );

    if (ownerForeignKeys.length === 0) {
      await query(
        queryInterface,
        `
        ALTER TABLE nma_languages
        ADD CONSTRAINT nma_languages_owner_fk
        FOREIGN KEY (ownerId)
        REFERENCES nma_owners(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        `
      );
    }

    // Remove the new pivot table.
    if (
      await tableExists(
        queryInterface,
        'nma_owner_languages'
      )
    ) {
      await query(
        queryInterface,
        `
        DROP TABLE nma_owner_languages
        `
      );
    }
  }
};
