const getTranslationValue = ({ translations = [], languageCode, defaultLanguageCode, field, fallback = '' }) => {
  if (!Array.isArray(translations) || !field) {
    return fallback;
  }

  const cleanLanguageCode = String(languageCode || '').trim().toLowerCase();
  const cleanDefaultLanguageCode = String(defaultLanguageCode || '').trim().toLowerCase();

  const lookup = translations.filter(item => item && item.field === field);
  const exact = lookup.find(item => String(item.languageCode || item.language?.code || '').trim().toLowerCase() === cleanLanguageCode);
  if (exact && (exact.value !== null && exact.value !== undefined && exact.value !== '')) return exact.value;

  const defaultMatch = lookup.find(item => String(item.languageCode || item.language?.code || '').trim().toLowerCase() === cleanDefaultLanguageCode);
  if (defaultMatch && (defaultMatch.value !== null && defaultMatch.value !== undefined && defaultMatch.value !== '')) return defaultMatch.value;

  const firstAvailable = lookup.find(item => item && (item.value !== null && item.value !== undefined && item.value !== ''));
  if (firstAvailable) return firstAvailable.value;

  return fallback;
};

module.exports = {
  getTranslationValue
};
