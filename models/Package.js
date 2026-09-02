module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Package', {
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    heads: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3
    },
    mediaAssetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'nma_mediaassets', key: 'id' }
    }
  }, {
    tableName: 'nma_packages',
    paranoid: true,
    timestamps: true
  });
};
