'use strict';

const columns = {
  imageKitUrl: { type: 'TEXT', allowNull: true },
  imageKitFileId: { type: 'STRING', allowNull: true },
  imageKitStreamUrl: { type: 'TEXT', allowNull: true },
  imageKitThumbnailUrl: { type: 'TEXT', allowNull: true },
  imageKitThumbnailFileId: { type: 'STRING', allowNull: true }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.describeTable('nma_mediaassets');
    await queryInterface.changeColumn('nma_mediaassets', 'filePath', {
      type: Sequelize.TEXT,
      allowNull: false
    });
    await queryInterface.changeColumn('nma_mediaassets', 'thumbnailPath', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    for (const [name, definition] of Object.entries(columns)) {
      if (!existing[name]) {
        await queryInterface.addColumn('nma_mediaassets', name, {
          type: Sequelize[definition.type],
          allowNull: definition.allowNull
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const existing = await queryInterface.describeTable('nma_mediaassets');
    const imageKitRows = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS count FROM nma_mediaassets WHERE imageKitUrl IS NOT NULL OR imageKitThumbnailUrl IS NOT NULL'
    );
    if (Number(imageKitRows[0][0].count) > 0) {
      throw new Error('Cannot roll back while ImageKit media rows still exist');
    }
    for (const name of Object.keys(columns).reverse()) {
      if (existing[name]) await queryInterface.removeColumn('nma_mediaassets', name);
    }
    await queryInterface.changeColumn('nma_mediaassets', 'filePath', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('nma_mediaassets', 'thumbnailPath', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};