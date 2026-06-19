const { Way } = require('../models');

const parseBody = (body) => {
  if (!body) return null;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (err) {
      return { description: body };
    }
  }
  return body;
};

const normalizeWayBody = (way) => {
  if (!way) return way;
  const item = way.toJSON ? way.toJSON() : { ...way };
  if (item.body && typeof item.body === 'string') {
    try {
      item.body = JSON.parse(item.body);
    } catch (err) {
      item.body = { description: item.body };
    }
  }
  return item;
};

exports.getAllWays = async (req, res) => {
  try {
    const ways = await Way.findAll({
      where: { active: true },
      order: [['order', 'ASC']]
    });
    res.json(ways.map(normalizeWayBody));
  } catch (err) {
    console.error('getAllWays error:', err);
    res.status(500).json({ message: 'Failed to fetch ways of earning' });
  }
};

exports.getAllWaysAdmin = async (req, res) => {
  try {
    const ways = await Way.findAll({ order: [['order', 'ASC']] });
    res.json(ways.map(normalizeWayBody));
  } catch (err) {
    console.error('getAllWaysAdmin error:', err);
    res.status(500).json({ message: 'Failed to fetch ways of earning' });
  }
};

const normalizeMediaType = (type) => {
  const allowed = ['text', 'image', 'video'];
  if (!type) return null;
  const value = String(type).trim().toLowerCase();
  return allowed.includes(value) ? value : null;
};

exports.createWay = async (req, res) => {
  try {
    const { slug, title, subtitle, image, mediaType, mediaUrl, body, order, active } = req.body;
    const way = await Way.create({
      slug,
      title,
      subtitle,
      image,
      mediaType: normalizeMediaType(mediaType),
      mediaUrl: mediaUrl || null,
      body: parseBody(body),
      order,
      active
    });
    res.status(201).json(way);
  } catch (err) {
    console.error('createWay error:', err);
    res.status(500).json({ message: 'Failed to create way of earning' });
  }
};

exports.updateWay = async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, title, subtitle, image, mediaType, mediaUrl, body, order, active } = req.body;
    const way = await Way.findByPk(id);
    if (!way) return res.status(404).json({ message: 'Way of earning not found' });
    await way.update({
      slug,
      title,
      subtitle,
      image,
      mediaType: normalizeMediaType(mediaType),
      mediaUrl: mediaUrl || null,
      body: parseBody(body),
      order,
      active
    });
    res.json(way);
  } catch (err) {
    console.error('updateWay error:', err);
    res.status(500).json({ message: 'Failed to update way of earning' });
  }
};

exports.deleteWay = async (req, res) => {
  try {
    const { id } = req.params;
    await Way.destroy({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteWay error:', err);
    res.status(500).json({ message: 'Failed to delete way of earning' });
  }
};
