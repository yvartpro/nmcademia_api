module.exports = (sequelize, DataTypes) => {
  return sequelize.define('FAQ', {
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'General'
    }
  }, {
    tableName: 'nma_faqs',
    timestamps: true
  });
};
