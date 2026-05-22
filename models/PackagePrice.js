module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PackagePrice', {
    packageId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    countryCode: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    referralBonus: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    matchBonus: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  }, {
    tableName: 'nma_packageprices',
    timestamps: true
  });
};
