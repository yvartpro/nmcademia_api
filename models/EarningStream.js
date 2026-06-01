module.exports = (sequelize, DataTypes) => {
  return sequelize.define('EarningStream', {
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    longDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      // No DB default: MySQL rejects emoji in DEFAULT on latin1 / strict hosts.
      // Use seed data or app fallback (PresentationPage: stream.icon || '💰').
      type: DataTypes.STRING(32),
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'nma_earning_streams',
    timestamps: true
  });
};
