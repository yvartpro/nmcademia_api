module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Founder', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    initials: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
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
    tableName: 'nma_founders',
    timestamps: true
  });
};
