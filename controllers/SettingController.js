const { Setting } = require('../models');

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    // Format as a simple key-value object
    const configMap = {};
    settings.forEach(s => {
      configMap[s.key] = s.value;
    });
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
    res.json(settings.map(s => ({
      id: s.id,
      key: s.key,
      value: s.value,
      description: s.description
    })));
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
