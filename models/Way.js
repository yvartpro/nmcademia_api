module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Way', {
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mediaType: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: {
          args: [['text', 'image', 'video']],
          msg: 'mediaType must be text, image, or video'
        }
      }
    },
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    body: {
      type: DataTypes.JSON,
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
    tableName: 'nma_ways',
    timestamps: true
  });
};
