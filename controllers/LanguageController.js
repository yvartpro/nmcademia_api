const { Language, Owner } = require('../models');

exports.getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.findAll({
      include: [{ model: Owner, as: 'owner' }],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json(languages);
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.createLanguage = async (req, res) => {
  try {
    let { code, name, nativeName, isDefault, isActive, sortOrder } = req.body;

    if (!code || !name) {
      return res.status(400).json({ message: 'Language code and name are required' });
    }

    code = String(code).trim().toLowerCase();
    name = String(name).trim();
    nativeName = nativeName ? String(nativeName).trim() : null;

    // Prevent duplicate codes for the same owner (or global)
    const ownerId = req.user?.ownerId || null;
    let existing = null;
    try {
      existing = await Language.findOne({ where: { code, ownerId } });
    } catch (lookupErr) {
      console.error('Language lookup failed:', lookupErr);
      return res.status(500).json({ message: 'Failed to validate language uniqueness', error: lookupErr.message });
    }

    if (existing) {
      return res.status(409).json({ message: 'Language code already exists for this owner', code });
    }

    const language = await Language.create({
      code,
      name,
      nativeName,
      isDefault: !!isDefault,
      isActive: isActive !== false,
      sortOrder: Number(sortOrder || 0),
      ownerId
    });

    if (language.isDefault) {
      await Language.update({ isDefault: false }, {
        where: {
          id: { [require('sequelize').Op.ne]: language.id },
          ownerId
        }
      });
    }

    res.status(201).json(language);
  } catch (error) {
    console.error('Create language error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updateLanguage = async (req, res) => {
  try {
    const language = await Language.findByPk(req.params.id);
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }

    const payload = { ...req.body };
    if (payload.code) payload.code = String(payload.code).trim().toLowerCase();
    if (payload.name) payload.name = String(payload.name).trim();
    if (payload.nativeName !== undefined) payload.nativeName = payload.nativeName ? String(payload.nativeName).trim() : null;
    if (payload.sortOrder !== undefined) payload.sortOrder = Number(payload.sortOrder || 0);

    await language.update(payload);

    if (payload.isDefault) {
      await Language.update({ isDefault: false }, {
        where: {
          id: { [require('sequelize').Op.ne]: language.id },
          ownerId: language.ownerId || null
        }
      });
    }

    res.json(language);
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.deleteLanguage = async (req, res) => {
  try {
    const language = await Language.findByPk(req.params.id);
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }

    await language.destroy();
    res.json({ message: 'Language deleted successfully' });
  } catch (error) {
    console.error('Delete language error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
