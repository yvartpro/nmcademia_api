module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Language', {
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    nativeName: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    tableName: 'nma_languages',
    timestamps: true
  });
};
