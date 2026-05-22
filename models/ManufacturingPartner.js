module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ManufacturingPartner', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    mediaAssetId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'nma_manufacturing_partners',
    timestamps: true
  });
};
