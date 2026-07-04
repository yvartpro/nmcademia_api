const { Country } = require('../models');

function normalizeFlagIcon(flagIcon, code) {
  const raw = (flagIcon || '').trim().toLowerCase();
  const iso = (code || '').trim().toLowerCase();

  if (raw) {
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length >= 2 && parts[0] === 'fi' && parts[1].startsWith('fi-')) {
      return `fi ${parts[1]}`;
    }
    if (parts.length >= 2 && parts[1] === 'fi' && /^[a-z]{2}$/.test(parts[0])) {
      return `fi fi-${parts[0]}`;
    }
    if (parts.length === 1 && parts[0].startsWith('fi-')) {
      return `fi ${parts[0]}`;
    }
    if (parts.length === 1 && /^[a-z]{2}$/.test(parts[0])) {
      return `fi fi-${parts[0]}`;
    }
  }

  if (/^[a-z]{2}$/.test(iso)) {
    return `fi fi-${iso}`;
  }
  return null;
}

exports.getAllCountries = async (req, res) => {
  try {
    const countries = await Country.findAll({
      where: { status: true },
      order: [['name', 'ASC']]
    });
    res.json(countries);
  } catch (error) {
    console.error('Get all countries error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.adminGetAllCountries = async (req, res) => {
  try {
    const countries = await Country.findAll({
      order: [['name', 'ASC']]
    });
    res.json(countries);
  } catch (error) {
    console.error('Admin get all countries error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createCountry = async (req, res) => {
  try {
    const { name, code, currency, currencySymbol, whatsappNumber, flagIcon, status } = req.body;
    if (!name || !code || !currency || !currencySymbol) {
      return res.status(400).json({ message: 'Name, code, currency and currency symbol are required' });
    }

    const country = await Country.create({
      name,
      code: code.toUpperCase(),
      currency,
      currencySymbol,
      whatsappNumber,
      flagIcon: normalizeFlagIcon(flagIcon, code) || `fi fi-${code.toLowerCase()}`,
      status: status !== undefined ? status : true
    });

    res.status(201).json(country);
  } catch (error) {
    console.error('Create country error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updateCountry = async (req, res) => {
  try {
    const { name, code, currency, currencySymbol, whatsappNumber, flagIcon, status } = req.body;
    const country = await Country.findByPk(req.params.id);
    if (!country) return res.status(404).json({ message: 'Country not found' });

    await country.update({
      name,
      code: code ? code.toUpperCase() : country.code,
      currency,
      currencySymbol,
      whatsappNumber,
      flagIcon: flagIcon !== undefined
        ? (normalizeFlagIcon(flagIcon, code || country.code) || country.flagIcon)
        : country.flagIcon,
      status: status !== undefined ? status : country.status
    });

    res.json(country);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteCountry = async (req, res) => {
  try {
    const country = await Country.findByPk(req.params.id);
    if (!country) return res.status(404).json({ message: 'Country not found' });
    await country.destroy();
    res.json({ message: 'Country deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
