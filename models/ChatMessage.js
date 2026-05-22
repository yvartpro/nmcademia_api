module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ChatMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chatSessionId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sender: {
      type: DataTypes.ENUM('guest', 'trainer'),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'nma_chatmessages',
    timestamps: true
  });
};
