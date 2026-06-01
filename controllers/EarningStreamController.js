const { EarningStream } = require('../models');

// GET /admin/earning-streams (all, including inactive)
exports.getAllEarningStreamsAdmin = async (req, res) => {
  try {
    const streams = await EarningStream.findAll({
      order: [['order', 'ASC']]
    });
    res.json(streams);
  } catch (err) {
    console.error('getAllEarningStreamsAdmin error:', err);
    res.status(500).json({ message: 'Failed to fetch earning streams' });
  }
};

// GET /earning-streams (public)
exports.getAllEarningStreams = async (req, res) => {
  try {
    const streams = await EarningStream.findAll({
      where: { active: true },
      order: [['order', 'ASC']]
    });
    res.json(streams);
  } catch (err) {
    console.error('getAllEarningStreams error:', err);
    res.status(500).json({ message: 'Failed to fetch earning streams' });
  }
};

// POST /admin/earning-streams
exports.createEarningStream = async (req, res) => {
  try {
    const { slug, title, shortDescription, longDescription, icon, order, active } = req.body;
    const stream = await EarningStream.create({
      slug,
      title,
      shortDescription,
      longDescription,
      icon: icon || '💰',
      order,
      active
    });
    res.status(201).json(stream);
  } catch (err) {
    console.error('createEarningStream error:', err);
    res.status(500).json({ message: 'Failed to create earning stream' });
  }
};

// PUT /admin/earning-streams/:id
exports.updateEarningStream = async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, title, shortDescription, longDescription, icon, order, active } = req.body;
    const stream = await EarningStream.findByPk(id);
    if (!stream) return res.status(404).json({ message: 'Earning stream not found' });
    await stream.update({ slug, title, shortDescription, longDescription, icon, order, active });
    res.json(stream);
  } catch (err) {
    console.error('updateEarningStream error:', err);
    res.status(500).json({ message: 'Failed to update earning stream' });
  }
};

// DELETE /admin/earning-streams/:id
exports.deleteEarningStream = async (req, res) => {
  try {
    const { id } = req.params;
    await EarningStream.destroy({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteEarningStream error:', err);
    res.status(500).json({ message: 'Failed to delete earning stream' });
  }
};
