module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Lead', {
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profileType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    challenges: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Contacted', 'Joined', 'Closed'),
      defaultValue: 'Pending',
      allowNull: false
    },
    consent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    tableName: 'nma_leads',
    timestamps: true
  });
};
