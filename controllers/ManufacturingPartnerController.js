const { ManufacturingPartner, MediaAsset } = require('../models');

// GET /manufacturing-partners (public)
exports.getAllManufacturingPartners = async (req, res) => {
  try {
    const partners = await ManufacturingPartner.findAll({
      include: [{ model: MediaAsset, as: 'logo', attributes: ['id', 'filePath', 'thumbnailPath', 'title'] }],
      order: [['order', 'ASC']]
    });
    res.json(partners);
  } catch (err) {
    console.error('getAllManufacturingPartners error:', err);
    res.status(500).json({ message: 'Failed to fetch manufacturing partners' });
  }
};

// POST /admin/manufacturing-partners
exports.createManufacturingPartner = async (req, res) => {
  try {
    const { name, country, description, order, mediaAssetId } = req.body;
    const partner = await ManufacturingPartner.create({ name, country, description, order, mediaAssetId });
    res.status(201).json(partner);
  } catch (err) {
    console.error('createManufacturingPartner error:', err);
    res.status(500).json({ message: 'Failed to create manufacturing partner' });
  }
};

// PUT /admin/manufacturing-partners/:id
exports.updateManufacturingPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, country, description, order, mediaAssetId } = req.body;
    const partner = await ManufacturingPartner.findByPk(id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    await partner.update({ name, country, description, order, mediaAssetId });
    res.json(partner);
  } catch (err) {
    console.error('updateManufacturingPartner error:', err);
    res.status(500).json({ message: 'Failed to update manufacturing partner' });
  }
};

// DELETE /admin/manufacturing-partners/:id
exports.deleteManufacturingPartner = async (req, res) => {
  try {
    const { id } = req.params;
    await ManufacturingPartner.destroy({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteManufacturingPartner error:', err);
    res.status(500).json({ message: 'Failed to delete manufacturing partner' });
  }
};
