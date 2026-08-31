const { Translation, Language } = require('../models');
const { resolveOwnerId, getActiveLanguageIdsForOwner } = require('../utils/ownerLanguages');

const normalizeRecordId = (value) => String(value ?? '');

const getAllowedLanguageIds = async (req) => {
  const ownerId = resolveOwnerId(req);
  return getActiveLanguageIdsForOwner(ownerId);
};

exports.getTranslations = async (req, res) => {
  try {
    const { modelName, recordId, languageId } = req.query;
    const where = {};

    if (modelName) where.modelName = String(modelName);
    if (recordId) where.recordId = normalizeRecordId(recordId);

    const allowedLanguageIds = await getAllowedLanguageIds(req);
    if (!allowedLanguageIds.length) {
      return res.json([]);
    }

    if (languageId) {
      const requestedLanguageId = Number(languageId);
      if (!allowedLanguageIds.includes(requestedLanguageId)) {
        return res.json([]);
      }
      where.languageId = requestedLanguageId;
    } else {
      where.languageId = allowedLanguageIds;
    }

    const translations = await Translation.findAll({
      where,
      include: [{ model: Language, as: 'language' }],
      order: [['field', 'ASC']]
    });

    res.json(translations);
  } catch (error) {
    console.error('Get translations error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.upsertTranslation = async (req, res) => {
  try {
    const { modelName, recordId, field, value, languageId } = req.body;

    if (!modelName || !recordId || !field || !languageId) {
      return res.status(400).json({ message: 'modelName, recordId, field, and languageId are required' });
    }

    const safeRecordId = normalizeRecordId(recordId);
    const safeLanguageId = Number(languageId);
    const allowedLanguageIds = await getAllowedLanguageIds(req);

    if (allowedLanguageIds.length && !allowedLanguageIds.includes(safeLanguageId)) {
      return res.status(403).json({ message: 'This language is not available for the current owner.' });
    }

    const [translation] = await Translation.findOrCreate({
      where: {
        modelName: String(modelName),
        recordId: safeRecordId,
        field: String(field),
        languageId: safeLanguageId
      },
      defaults: {
        value: value ?? null,
        modelName: String(modelName),
        recordId: safeRecordId,
        field: String(field),
        languageId: safeLanguageId
      }
    });

    if (translation.value !== value) {
      translation.value = value ?? null;
      await translation.save();
    }

    res.status(200).json(translation);
  } catch (error) {
    console.error('Upsert translation error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.bulkUpsertTranslations = async (req, res) => {
  try {
    const { modelName, recordId, languageId, translations = [] } = req.body;

    if (!modelName || !recordId || !languageId || !Array.isArray(translations)) {
      return res.status(400).json({ message: 'modelName, recordId, languageId, and translations array are required' });
    }

    const safeLanguageId = Number(languageId);
    const allowedLanguageIds = await getAllowedLanguageIds(req);

    if (allowedLanguageIds.length && !allowedLanguageIds.includes(safeLanguageId)) {
      return res.status(403).json({ message: 'This language is not available for the current owner.' });
    }

    const createdItems = [];
    for (const item of translations) {
      const { field, value } = item;
      if (!field) continue;

      const [translation] = await Translation.findOrCreate({
        where: {
          modelName: String(modelName),
          recordId: normalizeRecordId(recordId),
          field: String(field),
          languageId: safeLanguageId
        },
        defaults: {
          value: value ?? null,
          modelName: String(modelName),
          recordId: normalizeRecordId(recordId),
          field: String(field),
          languageId: safeLanguageId
        }
      });

      if (translation.value !== value) {
        translation.value = value ?? null;
        await translation.save();
      }

      createdItems.push(translation);
    }

    res.status(200).json(createdItems);
  } catch (error) {
    console.error('Bulk upsert translations error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
