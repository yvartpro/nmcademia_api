module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Package', {
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'nma_packages',
    paranoid: true,
    timestamps: true
  });
};
