module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Language', {
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
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
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'nma_languages',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['code'],
        name: 'code_unique'
      }
    ]
  });
};
