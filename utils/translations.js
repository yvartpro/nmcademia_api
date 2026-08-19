const { Op } = require('sequelize');
const { Translation, Language } = require('../models');

const getAllowedLanguageIds = async (req) => {
  const ownerId = req?.owner?.id || req?.user?.ownerId || null;
  const where = ownerId ? { [Op.or]: [{ ownerId }, { ownerId: null }] } : { ownerId: null };

  const languages = await Language.findAll({
    attributes: ['id'],
    where
  });

  return languages.map(language => Number(language.id)).filter(Boolean);
};

const getTranslationValue = ({ translations = [], languageCode, defaultLanguageCode, field, fallback = '' }) => {
  if (!Array.isArray(translations) || !field) {
    return fallback;
  }

  const cleanLanguageCode = String(languageCode || '').trim().toLowerCase();
  const cleanDefaultLanguageCode = String(defaultLanguageCode || '').trim().toLowerCase();

  const lookup = translations
    .filter(item => item && item.field === field)
    .sort((a, b) => {
      const aOrder = Number(a?.language?.sortOrder ?? a?.sortOrder ?? 0);
      const bOrder = Number(b?.language?.sortOrder ?? b?.sortOrder ?? 0);
      return aOrder - bOrder;
    });

  const exact = lookup.find(item => String(item.languageCode || item.language?.code || '').trim().toLowerCase() === cleanLanguageCode);
  if (exact && (exact.value !== null && exact.value !== undefined && exact.value !== '')) return exact.value;

  const defaultMatch = lookup.find(item => String(item.languageCode || item.language?.code || '').trim().toLowerCase() === cleanDefaultLanguageCode);
  if (defaultMatch && (defaultMatch.value !== null && defaultMatch.value !== undefined && defaultMatch.value !== '')) return defaultMatch.value;

  const firstAvailable = lookup.find(item => item && (item.value !== null && item.value !== undefined && item.value !== ''));
  if (firstAvailable) return firstAvailable.value;

  return fallback;
};

const resolveTranslationContext = async (req) => {
  const requestedCode = (req?.query?.lang || req?.query?.language || '').toString().trim().toLowerCase();
  let defaultLanguageCode = '';

  try {
    const ownerId = req?.owner?.id || req?.user?.ownerId || null;
    let defLang = null;
    if (ownerId) {
      defLang = await Language.findOne({
        where: { ownerId, isDefault: true },
        order: [['sortOrder', 'ASC'], ['name', 'ASC']]
      });
    }
    if (!defLang) {
      defLang = await Language.findOne({
        where: { isDefault: true },
        order: [['sortOrder', 'ASC'], ['name', 'ASC']]
      });
    }
    if (defLang) {
      defaultLanguageCode = String(defLang.code || '').trim().toLowerCase();
    }
  } catch (error) {
    console.error('Failed to resolve default language for translations:', error);
  }

  return {
    languageCode: requestedCode || defaultLanguageCode,
    defaultLanguageCode
  };
};

const mergeTranslationsForRecords = async ({ req, records, modelName, fields = [], recordIdField = 'id' }) => {
  if (!Array.isArray(records) || !records.length || !modelName || !fields.length) {
    return records;
  }

  const { languageCode, defaultLanguageCode } = await resolveTranslationContext(req);
  if (!languageCode) {
    return records;
  }

  const ids = [...new Set(records
    .filter(Boolean)
    .map(record => String(record?.[recordIdField] ?? record?.id ?? ''))
    .filter(Boolean))];

  if (!ids.length) {
    return records;
  }

  const allowedLanguageIds = await getAllowedLanguageIds(req);
  if (!allowedLanguageIds.length) {
    return records;
  }

  const translations = await Translation.findAll({
    where: {
      modelName,
      recordId: ids,
      languageId: allowedLanguageIds
    },
    include: [{ model: Language, as: 'language' }]
  });

  return records.map((record) => {
    if (!record) return record;
    const next = record.toJSON ? record.toJSON() : { ...record };
    const recordId = String(record?.[recordIdField] ?? record?.id ?? '');
    const recordTranslations = translations.filter(item => String(item.recordId) === recordId);

    fields.forEach((field) => {
      next[field] = getTranslationValue({
        translations: recordTranslations,
        languageCode,
        defaultLanguageCode,
        field,
        fallback: next[field]
      });
    });

    return next;
  });
};

module.exports = {
  getAllowedLanguageIds,
  getTranslationValue,
  resolveTranslationContext,
  mergeTranslationsForRecords
};
