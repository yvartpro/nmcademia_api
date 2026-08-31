require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

async function main() {
  const langs = await sequelize.query('SELECT id, code, name, sortOrder FROM nma_languages ORDER BY sortOrder, code', { type: 'SELECT' });
  console.log('LANGUAGES', JSON.stringify(langs, null, 2));

  const [tr] = await sequelize.query('SELECT COUNT(*) AS c FROM nma_translations');
  console.log('TRANSLATIONS COUNT', tr[0].c);

  const owners = await sequelize.query('SELECT id, name, domainName FROM nma_owners', { type: 'SELECT' });
  console.log('OWNERS', JSON.stringify(owners));

  const tByLang = await sequelize.query('SELECT language_id, COUNT(*) AS c FROM nma_translations GROUP BY language_id ORDER BY language_id', { type: 'SELECT' });
  console.log('TRANSLATIONS BY LANGUAGE', JSON.stringify(tByLang));

  const perOwner = await sequelize.query('SELECT owner_id, language_id, is_active, is_default FROM nma_owner_languages ORDER BY owner_id, language_id', { type: 'SELECT' });
  console.log('OWNER LANGUAGES', JSON.stringify(perOwner));
}

main().catch(e => { console.error(e); process.exit(1); });