module.exports = (sequelize, DataTypes) => {
  return sequelize.define('OwnerLanguage', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'owner_id'
    },
    languageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'language_id'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_default'
    }
  }, {
    tableName: 'nma_owner_languages',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['owner_id', 'language_id'],
        name: 'owner_language_unique'
      }
    ]
  });
};
