module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Setting', {
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'nma_settings',
    timestamps: true
  });
};
