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
      type: DataTypes.TEXT,
      allowNull: false
    },
    thumbnailPath: DataTypes.TEXT,
    imageKitUrl: DataTypes.TEXT,
    imageKitFileId: DataTypes.STRING,
    imageKitStreamUrl: DataTypes.TEXT,
    imageKitThumbnailUrl: DataTypes.TEXT,
    imageKitThumbnailFileId: DataTypes.STRING,
    mimeType: DataTypes.STRING,
    fileSize: DataTypes.INTEGER,
    width: DataTypes.INTEGER,
    height: DataTypes.INTEGER,
    duration: DataTypes.INTEGER,
    versions: DataTypes.JSON,
    processingStatus: {
      type: DataTypes.ENUM('pending', 'processing', 'ready', 'error'),
      defaultValue: 'ready'
    },
    processingError: DataTypes.TEXT
  }, {
    tableName: 'nma_mediaassets',
    paranoid: true,
    timestamps: true
  });
};
