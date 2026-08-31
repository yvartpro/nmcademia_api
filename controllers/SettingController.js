const { Setting, MediaAsset, Translation, Language } = require('../models');
const { getAllowedLanguageIds, getTranslationValue } = require('../utils/translations');
const { resolveOwnerId, getLanguagesForOwner } = require('../utils/ownerLanguages');

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    // Format as a simple key-value object
    const configMap = {};
    settings.forEach(s => {
      configMap[s.key] = s.value;
    });

    // Automatically resolve thumbnails for any settings that point to media video assets
    try {
      const videoAssets = await MediaAsset.findAll({
        where: { type: 'video' },
        attributes: ['filePath', 'thumbnailPath']
      });

      // Map filePath (normalized) to thumbnailPath
      const pathMap = {};
      videoAssets.forEach(asset => {
        if (asset.filePath) {
          // Normalize leading/trailing slashes and convert to lowercase for robust matching
          const normalized = asset.filePath.replace(/^\/+|\/+$/g, '').toLowerCase();
          if (asset.thumbnailPath) {
            pathMap[normalized] = asset.thumbnailPath;
          }
        }
      });

      // Match settings values against pathMap
      Object.entries(configMap).forEach(([key, val]) => {
        if (typeof val === 'string' && val.trim()) {
          const cleanVal = val.trim().replace(/^\/+|\/+$/g, '').toLowerCase();
          if (pathMap[cleanVal]) {
            // Automatically set corresponding thumbnail setting dynamically if not already set
            const thumbKey = `${key}_thumbnail`;
            if (!configMap[thumbKey]) {
              configMap[thumbKey] = pathMap[cleanVal];
            }
          }
        }
      });
    } catch (dbErr) {
      console.error('Failed to auto-resolve settings video thumbnails:', dbErr);
    }

    // If a language was requested, attempt to merge translations
    const requestedLang = (req.query.lang || req.query.language || '').toString().trim().toLowerCase() || null;

    // Determine default language for this owner (tenant)
    let defaultLangCode = null;
    try {
      const ownerId = resolveOwnerId(req);
      const active = await getLanguagesForOwner(ownerId, { onlyActive: true });
      const defLang = active.find((language) => language.isDefault) || active[0];
      if (defLang) defaultLangCode = (defLang.code || '').toString().toLowerCase();
    } catch (e) {
      console.error('Failed to resolve default language for owner:', e);
    }

    if (requestedLang) {
      try {
        const keys = Object.keys(configMap).map(k => String(k));
        const allowedLanguageIds = await getAllowedLanguageIds(req);
        const translations = await Translation.findAll({
          where: {
            modelName: 'Setting',
            recordId: keys,
            languageId: allowedLanguageIds.length ? allowedLanguageIds : [-1]
          },
          include: [{ model: Language, as: 'language' }]
        });

        // Merge translations per key
        keys.forEach(key => {
          const forKey = translations.filter(t => String(t.recordId) === String(key));
          const translated = getTranslationValue({ translations: forKey, languageCode: requestedLang, defaultLanguageCode: defaultLangCode, field: 'value', fallback: configMap[key] });
          configMap[key] = translated;
        });
      } catch (tErr) {
        console.error('Failed to merge setting translations:', tErr);
      }
    }

    res.json(configMap);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/** Admin: full list with descriptions for the CMS editor */
exports.getAllSettingsDetailed = async (req, res) => {
  try {
    const settings = await Setting.findAll({
      order: [['key', 'ASC']]
    });
    // Load translations for these settings to include in admin UI
    const keys = settings.map(s => String(s.key));
    const allowedLanguageIds = await getAllowedLanguageIds(req);
    const translations = await Translation.findAll({
      where: {
        modelName: 'Setting',
        recordId: keys,
        languageId: allowedLanguageIds.length ? allowedLanguageIds : [-1]
      },
      include: [{ model: Language, as: 'language' }]
    });

    const result = settings.map(s => {
      const t = translations.filter(tr => String(tr.recordId) === String(s.key)).map(tr => ({
        id: tr.id,
        field: tr.field,
        value: tr.value,
        languageId: tr.languageId,
        languageCode: tr.language?.code,
        languageName: tr.language?.name
      }));
      return {
        id: s.id,
        key: s.key,
        value: s.value,
        description: s.description,
        translations: t
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get detailed settings error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOne({ where: { key } });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    await setting.destroy();
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settingsMap = req.body; // e.g. { "whatsapp_link": "...", "video_url": "..." }
    if (!settingsMap || typeof settingsMap !== 'object') {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    for (const [key, value] of Object.entries(settingsMap)) {
      const [setting] = await Setting.findOrCreate({
        where: { key },
        defaults: { value, description: `Dynamic config for ${key}` }
      });
      if (setting.value !== value) {
        setting.value = value;
        await setting.save();
      }
    }

    // Return the updated settings map
    const allSettings = await Setting.findAll();
    const configMap = {};
    allSettings.forEach(s => {
      configMap[s.key] = s.value;
    });

    res.json({ message: 'Settings updated successfully', settings: configMap });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
