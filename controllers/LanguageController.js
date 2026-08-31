const { Language, OwnerLanguage } = require('../models');
const { Op } = require('sequelize');
const {
  resolveOwnerId,
  getLanguagesForOwner,
  upsertOwnerLanguage
} = require('../utils/ownerLanguages');

const clearOwnerDefault = async (ownerId, excludeLanguageId) => {
  await OwnerLanguage.update({ isDefault: false }, {
    where: {
      ownerId,
      isDefault: true,
      languageId: { [Op.ne]: excludeLanguageId }
    }
  });
};

exports.getAllLanguages = async (req, res) => {
  try {
    const ownerId = resolveOwnerId(req);
    const languages = await getLanguagesForOwner(ownerId);
    res.json(languages);
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getPublicLanguages = async (req, res) => {
  try {
    const ownerId = resolveOwnerId(req);
    const languages = await getLanguagesForOwner(ownerId, { onlyActive: true });
    res.json(languages);
  } catch (error) {
    console.error('Get public languages error:', error);
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

    const existing = await Language.findOne({ where: { code } });
    if (existing) {
      return res.status(409).json({ message: 'Language code already exists', code });
    }

    const ownerId = resolveOwnerId(req);

    const language = await Language.create({
      code,
      name,
      nativeName,
      sortOrder: Number(sortOrder || 0)
    });

    if (ownerId) {
      await upsertOwnerLanguage({
        ownerId,
        languageId: language.id,
        isActive: isActive !== false,
        isDefault: !!isDefault
      });

      if (isDefault) {
        await clearOwnerDefault(ownerId, language.id);
      }
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

    const { isActive, isDefault, ...shared } = req.body;
    const payload = { ...shared };
    if (payload.code) payload.code = String(payload.code).trim().toLowerCase();
    if (payload.name) payload.name = String(payload.name).trim();
    if (payload.nativeName !== undefined) payload.nativeName = payload.nativeName ? String(payload.nativeName).trim() : null;
    if (payload.sortOrder !== undefined) payload.sortOrder = Number(payload.sortOrder || 0);

    const ownerId = resolveOwnerId(req);

    // Code uniqueness is global now
    if (payload.code && payload.code !== language.code) {
      const codeTaken = await Language.findOne({ where: { code: payload.code, id: { [Op.ne]: language.id } } });
      if (codeTaken) {
        return res.status(409).json({ message: 'Language code already exists', code: payload.code });
      }
    }

    await language.update(payload);

    if (ownerId && (isActive !== undefined || isDefault !== undefined)) {
      await upsertOwnerLanguage({
        ownerId,
        languageId: language.id,
        isActive,
        isDefault
      });

      if (isDefault) {
        await clearOwnerDefault(ownerId, language.id);
      }
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
