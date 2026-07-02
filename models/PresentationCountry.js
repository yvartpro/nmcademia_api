module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PresentationCountry', {
    presentationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'nma_presentations',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'nma_countries',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'nma_presentation_countries',
    timestamps: false
  });
};
