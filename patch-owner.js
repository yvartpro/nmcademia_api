const { sequelize, Owner } = require('./models');
const bcrypt = require('bcryptjs');

async function patch() {
  try {
    console.log('Syncing database schema...');
    await sequelize.sync({ alter: true });
    
    console.log('Seeding test owners...');
    const hashedPass = bcrypt.hashSync('password', 10);
    
    // 1. Default fallback owner
    const [admin, adminCreated] = await Owner.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        domainName: 'localhost',
        passwordHash: hashedPass,
        name: 'Default Administrator',
        bio: 'Welcome to the platform. Please customize your profile.',
        whatsappNumber: '+2348030001111'
      }
    });
    if (adminCreated) {
      console.log('Created default admin owner: username "admin", password "password".');
    }
//create divine user
    const [divine, divineCreated] = await Owner.findOrCreate({
      where: { username: 'divine' },
      defaults: {
        domainName: 'divine.local',
        passwordHash: hashedPass,
        name: 'Divine IRADUKUNDA',
        bio: 'Hello! I am Divine, a senior team leader and distributor. I specialize in training automation and fast-track sales.',
        whatsappNumber: '+25769667239'
      }
    });
    if (divineCreated) {
      console.log('Created Divine local owner: username "divine", password "password" on nmacademia.bi.');
    }

    console.log('Database patching completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to patch database:', error);
    process.exit(1);
  }
}

patch();
