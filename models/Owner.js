module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Owner', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    domainName: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Network Marketing Professional'
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    whatsappNumber: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'nma_owners',
    timestamps: true
  });
};
