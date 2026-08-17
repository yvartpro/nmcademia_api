module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Translation', {
    modelName: {
      type: DataTypes.STRING(80),
      allowNull: false,
      field: 'model_name'
    },
    recordId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'record_id'
    },
    field: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    languageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'language_id'
    }
  }, {
    tableName: 'nma_translations',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['model_name', 'record_id', 'field', 'language_id']
      }
    ]
  });
};
