module.exports = (sequelize, DataTypes) => {
  return sequelize.define('MediaAsset', {
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    excerpt: DataTypes.TEXT,
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    thumbnailPath: DataTypes.STRING,
    mimeType: DataTypes.STRING,
    fileSize: DataTypes.INTEGER,
    width: DataTypes.INTEGER,
    height: DataTypes.INTEGER,
    duration: DataTypes.INTEGER,
    versions: DataTypes.JSON
  }, {
    tableName: 'nma_mediaassets',
    paranoid: true,
    timestamps: true
  });
};
