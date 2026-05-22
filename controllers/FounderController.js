const { Founder, MediaAsset } = require('../models');

// GET /founders (public)
exports.getAllFounders = async (req, res) => {
  try {
    const founders = await Founder.findAll({
      include: [{ model: MediaAsset, as: 'photo', attributes: ['id', 'filePath', 'thumbnailPath', 'title'] }],
      order: [['order', 'ASC']]
    });
    res.json(founders);
  } catch (err) {
    console.error('getAllFounders error:', err);
    res.status(500).json({ message: 'Failed to fetch founders' });
  }
};

// POST /admin/founders
exports.createFounder = async (req, res) => {
  try {
    const { name, initials, role, title, bio, order, mediaAssetId } = req.body;
    const founder = await Founder.create({ name, initials, role, title, bio, order, mediaAssetId });
    res.status(201).json(founder);
  } catch (err) {
    console.error('createFounder error:', err);
    res.status(500).json({ message: 'Failed to create founder' });
  }
};

// PUT /admin/founders/:id
exports.updateFounder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, initials, role, title, bio, order, mediaAssetId } = req.body;
    const founder = await Founder.findByPk(id);
    if (!founder) return res.status(404).json({ message: 'Founder not found' });
    await founder.update({ name, initials, role, title, bio, order, mediaAssetId });
    res.json(founder);
  } catch (err) {
    console.error('updateFounder error:', err);
    res.status(500).json({ message: 'Failed to update founder' });
  }
};

// DELETE /admin/founders/:id
exports.deleteFounder = async (req, res) => {
  try {
    const { id } = req.params;
    await Founder.destroy({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteFounder error:', err);
    res.status(500).json({ message: 'Failed to delete founder' });
  }
};
