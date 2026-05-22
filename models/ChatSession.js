module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ChatSession', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    visitorName: {
      type: DataTypes.STRING,
      defaultValue: 'Visitor'
    },
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('active', 'closed'),
      defaultValue: 'active',
      allowNull: false
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'nma_chatsessions',
    timestamps: true
  });
};
