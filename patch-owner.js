const { sequelize, Owner } = require('./models');
const bcrypt = require('bcryptjs');

async function patch() {
  try {
    console.log('Syncing database schema...');
    await sequelize.sync({ alter: true });
    
    console.log('Checking for default owner...');
    const count = await Owner.count();
    
    if (count === 0) {
      console.log('No owners found. Creating default admin owner...');
      const hashedPass = bcrypt.hashSync('password', 10);
      await Owner.create({
        domainName: 'localhost',
        username: 'admin',
        passwordHash: hashedPass,
        name: 'Default Administrator',
        bio: 'Welcome to the platform. Please update your profile.',
        whatsappNumber: '1234567890'
      });
      console.log('Default owner created: username "admin", password "password".');
    } else {
      console.log('Owners already exist. Skipping creation.');
    }
    
    console.log('Database patching completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to patch database:', error);
    process.exit(1);
  }
}

patch();
