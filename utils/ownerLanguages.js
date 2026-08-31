const { Language, OwnerLanguage } = require('../models');

const resolveOwnerId = (req) => (req?.owner?.id || req?.user?.ownerId || null);

// Returns all shared languages with the given owner's settings (isActive/isDefault) merged.
// A missing OwnerLanguage row is treated as "active by default, not default".
const getLanguagesForOwner = async (ownerId, { onlyActive = false } = {}) => {
  const languages = await Language.findAll({
    order: [['sortOrder', 'ASC'], ['name', 'ASC']]
  });

  let settings = {};
  if (ownerId) {
    const rows = await OwnerLanguage.findAll({ where: { ownerId } });
    settings = Object.fromEntries(rows.map((row) => [String(row.languageId), row]));
  }

  const merged = languages.map((language) => {
    const setting = settings[String(language.id)];
    const json = language.toJSON();
    return {
      ...json,
      isActive: setting ? !!setting.isActive : true,
      isDefault: setting ? !!setting.isDefault : false
    };
  });

  if (onlyActive) return merged.filter((language) => language.isActive);
  return merged;
};

// IDs of languages that are active for an owner (shared catalog, per-owner toggle).
const getActiveLanguageIdsForOwner = async (ownerId) => {
  const languages = await getLanguagesForOwner(ownerId, { onlyActive: true });
  return languages.map((language) => Number(language.id)).filter(Boolean);
};

// Upserts the owner's settings row for a given language.
const upsertOwnerLanguage = async ({ ownerId, languageId, isActive, isDefault }) => {
  const [row, created] = await OwnerLanguage.findOrCreate({
    where: { ownerId, languageId },
    defaults: {
      isActive: isActive !== false,
      isDefault: !!isDefault
    }
  });

  if (!created) {
    if (isActive !== undefined) await row.update({ isActive: isActive !== false });
    if (isDefault !== undefined) await row.update({ isDefault: !!isDefault });
  }

  return row;
};

module.exports = {
  resolveOwnerId,
  getLanguagesForOwner,
  getActiveLanguageIdsForOwner,
  upsertOwnerLanguage
};
