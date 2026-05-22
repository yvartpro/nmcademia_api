module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Country', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    currencySymbol: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    whatsappNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'nma_countries',
    paranoid: true,
    timestamps: true
  });
};
