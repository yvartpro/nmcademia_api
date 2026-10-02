'use strict';

const { sequelize, Country } = require('../models');
const countries = require('../seed/countriesData');

async function seedCountries() {
  let created = 0;
  let updated = 0;

  await sequelize.transaction(async (transaction) => {
    for (const [name, code, currency, currencySymbol, hasOffice, phoneCode] of countries) {
      const values = {
        name,
        code,
        phoneCode,
        currency,
        currencySymbol,
        whatsappNumber: '',
        flagIcon: `fi fi-${code.toLowerCase()}`,
        status: true,
        hasOffice
      };
      let country = await Country.findOne({
        where: { code },
        paranoid: false,
        transaction
      });

      if (country) {
        if (country.deletedAt) await country.restore({ transaction });
        await country.update(values, { transaction });
        updated += 1;
      } else {
        country = await Country.create(values, { transaction });
        created += 1;
      }
    }
  });

  console.log(`Country seed complete: ${created} created, ${updated} updated.`);
}

seedCountries()
  .catch((error) => {
    console.error('Country seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
