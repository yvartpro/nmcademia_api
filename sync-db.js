const { sequelize } = require('./models');

async function sync() {
  try {
    console.log('Syncing database schema...');
    await sequelize.sync({ alter: true });
    console.log('Database schema synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to sync database:', error);
    process.exit(1);
  }
}

sync();
