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

module.exports = {
  async up(queryInterface) {
    // ------------------------------------------------------------------
    // Owner profile translations were historically saved under a shared,
    // non-owner-specific record_id ('profile'). Because every owner used the
    // same record_id, all owners ended up reading the same translated bio.
    // This migration re-keys those rows to the first owner (by id), matching
    // how the tenant fallback resolves an unmatched domain. Other owners will
    // fall back to their own `bio` field until they save per-owner translations.
    // ------------------------------------------------------------------
    if (!(await tableExists(queryInterface, 'nma_translations'))) return;
    if (!(await columnExists(queryInterface, 'nma_translations', 'record_id'))) return;
    if (!(await tableExists(queryInterface, 'nma_owners'))) return;

    const owners = await query(queryInterface,
      'SELECT id FROM nma_owners ORDER BY id ASC LIMIT 1',
      { type: 'SELECT' });
    if (!owners.length) return;

    const targetOwnerId = owners[0].id;

    // Only re-key if there are multiple owners (when >1 owner exists the
    // shared 'profile' record would cause the cross-owner bio collision).
    const ownerCount = await query(queryInterface,
      'SELECT COUNT(*) AS c FROM nma_owners',
      { type: 'SELECT' });
    if (Number(ownerCount[0].c) < 2) return;

    await query(queryInterface,
      `UPDATE nma_translations
       SET record_id = ?
       WHERE model_name = 'Owner' AND record_id = 'profile'`,
      { replacements: [targetOwnerId] });
  },

  async down(queryInterface) {
    // The previous state (record_id='profile' for all owners) is ambiguous —
    // rows were merged across owners. Best-effort: move them back to 'profile'.
    if (!(await tableExists(queryInterface, 'nma_translations'))) return;
    if (!(await columnExists(queryInterface, 'nma_translations', 'record_id'))) return;

    await query(queryInterface,
      `UPDATE nma_translations
       SET record_id = 'profile'
       WHERE model_name = 'Owner'`);
  }
};
