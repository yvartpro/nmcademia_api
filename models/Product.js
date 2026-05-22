module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Product', {
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    scientificName: DataTypes.STRING,
    category: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'nma_products',
    paranoid: true,
    timestamps: true
  });
};
