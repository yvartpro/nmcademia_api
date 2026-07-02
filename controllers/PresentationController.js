const { Presentation, MediaAsset, Country } = require('../models');

// GET /admin/presentations
exports.getAllPresentationsAdmin = async (req, res) => {
  try {
    const presentations = await Presentation.findAll({
      include: [
        { model: MediaAsset, as: 'media' },
        { model: Country, as: 'countries', attributes: ['id', 'code', 'name'] }
      ],
      order: [['order', 'ASC']]
    });
    res.json(presentations);
  } catch (err) {
    console.error('getAllPresentationsAdmin error:', err);
    res.status(500).json({ message: 'Failed to fetch presentations' });
  }
};

// GET /presentations/:countryCode (public - get presentation for a specific country)
exports.getPresentationByCountry = async (req, res) => {
  try {
    const { countryCode } = req.params;

    const country = await Country.findOne({
      where: { code: countryCode }
    });

    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    const presentation = await Presentation.findOne({
      include: [
        { 
          model: Country, 
          as: 'countries',
          where: { id: country.id },
          attributes: ['id', 'code', 'name'],
          through: { attributes: [] }
        },
        { model: MediaAsset, as: 'media' }
      ],
      where: { active: true }
    });

    res.json(presentation || null);
  } catch (err) {
    console.error('getPresentationByCountry error:', err);
    res.status(500).json({ message: 'Failed to fetch presentation' });
  }
};

// POST /admin/presentations
exports.createPresentation = async (req, res) => {
  try {
    const { title, description, mediaId, countryIds, order, active } = req.body;

    // Validate mediaId exists
    const media = await MediaAsset.findByPk(mediaId);
    if (!media) {
      return res.status(404).json({ message: 'Media asset not found' });
    }

    const presentation = await Presentation.create({
      title,
      description,
      mediaId,
      order: order ?? 0,
      active: active !== false
    });

    // Associate with countries
    if (countryIds && Array.isArray(countryIds) && countryIds.length > 0) {
      await presentation.addCountries(countryIds);
    }

    // Reload with associations
    const result = await Presentation.findByPk(presentation.id, {
      include: [
        { model: MediaAsset, as: 'media' },
        { model: Country, as: 'countries', attributes: ['id', 'code', 'name'] }
      ]
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('createPresentation error:', err);
    res.status(500).json({ message: 'Failed to create presentation' });
  }
};

// PUT /admin/presentations/:id
exports.updatePresentation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, mediaId, countryIds, order, active } = req.body;

    const presentation = await Presentation.findByPk(id);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found' });
    }

    // Validate mediaId if provided
    if (mediaId) {
      const media = await MediaAsset.findByPk(mediaId);
      if (!media) {
        return res.status(404).json({ message: 'Media asset not found' });
      }
    }

    await presentation.update({
      title: title !== undefined ? title : presentation.title,
      description: description !== undefined ? description : presentation.description,
      mediaId: mediaId || presentation.mediaId,
      order: order !== undefined ? order : presentation.order,
      active: active !== undefined ? active : presentation.active
    });

    // Update countries if provided
    if (countryIds && Array.isArray(countryIds)) {
      await presentation.setCountries(countryIds);
    }

    // Reload with associations
    const result = await Presentation.findByPk(presentation.id, {
      include: [
        { model: MediaAsset, as: 'media' },
        { model: Country, as: 'countries', attributes: ['id', 'code', 'name'] }
      ]
    });

    res.json(result);
  } catch (err) {
    console.error('updatePresentation error:', err);
    res.status(500).json({ message: 'Failed to update presentation' });
  }
};

// DELETE /admin/presentations/:id
exports.deletePresentation = async (req, res) => {
  try {
    const { id } = req.params;

    const presentation = await Presentation.findByPk(id);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found' });
    }

    await presentation.destroy();
    res.json({ message: 'Presentation deleted successfully' });
  } catch (err) {
    console.error('deletePresentation error:', err);
    res.status(500).json({ message: 'Failed to delete presentation' });
  }
};
