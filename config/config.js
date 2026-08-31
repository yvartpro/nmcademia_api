require('dotenv').config();

const common = {
  dialect: 'mysql',
  timezone: '+00:00',
  dialectOptions: {
    charset: 'utf8mb4'
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
};

/**
 * Sequelize-CLI configuration.
 *
 * Kept separate from the runtime `config/database.js` because the CLI needs a
 * per-environment map while the app uses a single env-driven connection.
 *
 * All values come from the environment (see .env / .env.example). If a
 * DATABASE_URL is present it takes precedence (handy for managed DBs).
 */
module.exports = {
  development: {
    ...common,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || 'localhost',
    ...(process.env.DATABASE_URL ? { url: process.env.DATABASE_URL } : {})
  },
  test: {
    ...common,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: (process.env.DB_NAME || 'nmacademia_db') + '_test',
    host: process.env.DB_HOST || 'localhost',
    ...(process.env.DATABASE_URL ? { url: process.env.DATABASE_URL } : {})
  },
  production: {
    ...common,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || 'localhost',
    ...(process.env.DATABASE_URL ? { url: process.env.DATABASE_URL } : {})
  }
};
