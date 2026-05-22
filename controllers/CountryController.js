const { Country } = require('../models');

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
    const { name, code, currency, currencySymbol, whatsappNumber, status } = req.body;
    if (!name || !code || !currency || !currencySymbol) {
      return res.status(400).json({ message: 'Name, code, currency and currency symbol are required' });
    }

    const country = await Country.create({
      name,
      code: code.toUpperCase(),
      currency,
      currencySymbol,
      whatsappNumber,
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
    const { name, code, currency, currencySymbol, whatsappNumber, status } = req.body;
    const country = await Country.findByPk(req.params.id);
    if (!country) return res.status(404).json({ message: 'Country not found' });

    await country.update({
      name,
      code: code ? code.toUpperCase() : country.code,
      currency,
      currencySymbol,
      whatsappNumber,
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
