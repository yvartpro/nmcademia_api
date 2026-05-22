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
