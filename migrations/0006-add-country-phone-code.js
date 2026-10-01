'use strict';

const query = (queryInterface, sql, options) =>
  queryInterface.sequelize.query(sql, options);

const databaseName = (queryInterface) =>
  queryInterface.sequelize.getQueryInterface().sequelize.config.database;

const columnExists = async (queryInterface) => {
  const rows = await query(queryInterface,
    `SELECT COUNT(*) AS c FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
    { replacements: [databaseName(queryInterface), 'nma_countries', 'phoneCode'], type: 'SELECT' });
  return Number(rows[0].c) > 0;
};

module.exports = {
  async up(queryInterface) {
    if (await columnExists(queryInterface)) return;

    await query(queryInterface,
      "ALTER TABLE nma_countries ADD COLUMN `phoneCode` VARCHAR(16) NOT NULL DEFAULT ''");

    const phoneCodes = { NG: '+234', KE: '+254', BI: '+257', US: '+1' };
    for (const [code, phoneCode] of Object.entries(phoneCodes)) {
      await query(queryInterface,
        'UPDATE nma_countries SET `phoneCode` = ? WHERE `code` = ?',
        { replacements: [phoneCode, code] });
    }
  },

  async down(queryInterface) {
    if (await columnExists(queryInterface)) {
      await query(queryInterface, 'ALTER TABLE nma_countries DROP COLUMN `phoneCode`');
    }
  }
};