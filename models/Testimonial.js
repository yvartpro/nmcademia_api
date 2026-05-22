module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Testimonial', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quote: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    lifestyleTag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    mediaAssetId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'nma_testimonials',
    timestamps: true
  });
};
