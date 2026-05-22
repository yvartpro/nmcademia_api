const { Testimonial, MediaAsset } = require('../models');

// GET /testimonials (public)
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      where: { active: true },
      include: [{ model: MediaAsset, as: 'photo', attributes: ['id', 'filePath', 'thumbnailPath', 'title'] }],
      order: [['order', 'ASC']]
    });
    res.json(testimonials);
  } catch (err) {
    console.error('getAllTestimonials error:', err);
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
};

// POST /admin/testimonials
exports.createTestimonial = async (req, res) => {
  try {
    const { name, quote, lifestyleTag, order, mediaAssetId, active } = req.body;
    const testimonial = await Testimonial.create({ name, quote, lifestyleTag, order, mediaAssetId, active });
    res.status(201).json(testimonial);
  } catch (err) {
    console.error('createTestimonial error:', err);
    res.status(500).json({ message: 'Failed to create testimonial' });
  }
};

// PUT /admin/testimonials/:id
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quote, lifestyleTag, order, mediaAssetId, active } = req.body;
    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
    await testimonial.update({ name, quote, lifestyleTag, order, mediaAssetId, active });
    res.json(testimonial);
  } catch (err) {
    console.error('updateTestimonial error:', err);
    res.status(500).json({ message: 'Failed to update testimonial' });
  }
};

// DELETE /admin/testimonials/:id
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    await Testimonial.destroy({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteTestimonial error:', err);
    res.status(500).json({ message: 'Failed to delete testimonial' });
  }
};
