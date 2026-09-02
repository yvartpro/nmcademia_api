'use strict';

const query = (queryInterface, sql, options) =>
  queryInterface.sequelize.query(sql, options);

const databaseName = () =>
  queryInterface => queryInterface.sequelize.getQueryInterface().sequelize.config.database;

const columnExists = async (queryInterface, table, column) => {
  const rows = await query(queryInterface,
    `SELECT COUNT(*) AS c FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
    { replacements: [databaseName()(queryInterface), table, column], type: 'SELECT' });
  return Number(rows[0].c) > 0;
};

module.exports = {
  async up(queryInterface) {
    // Add the dynamic "heads" (binary tree slots) count to packages.
    // Defaults to 3 so existing packages keep working until edited in admin.
    if (!await columnExists(queryInterface, 'nma_packages', 'heads')) {
      await query(queryInterface, `
        ALTER TABLE nma_packages
        ADD COLUMN heads INT NOT NULL DEFAULT 3
      `);
    }
  },

  async down(queryInterface) {
    if (await columnExists(queryInterface, 'nma_packages', 'heads')) {
      await query(queryInterface, 'ALTER TABLE nma_packages DROP COLUMN heads');
    }
  }
};