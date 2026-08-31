const { Owner, MediaAsset } = require('../models');
const { mergeTranslationsForRecords } = require('../utils/translations');

// Fetch public profile for frontend based on resolved tenant
exports.getPublicProfile = async (req, res) => {
  try {
    const owner = req.owner;
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    const whatsappGroupLink = owner.whatsappGroupLink || owner.whatsapp_group_link || null;
    const base = {
      name: owner.name,
      bio: owner.bio || null,
      intro: owner.intro || null,
      whatsappNumber: owner.whatsappNumber,
      whatsappGroupLink,
      whatsapp_group_link: whatsappGroupLink,
      domainName: owner.domainName,
      photo: owner.photo || null
    };

    const [translated] = await mergeTranslationsForRecords({
      req,
      records: [{ ...base, id: owner.id }],
      modelName: 'Owner',
      fields: ['bio', 'intro'],
      recordIdField: 'id'
    });

    res.json({
      ...base,
      ...translated
    });
  } catch (error) {
    console.error('Error fetching public owner profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch full profile for logged-in admin
exports.getAdminProfile = async (req, res) => {
  try {
    const owner = await Owner.findByPk(req.user.ownerId, {
      include: [{ model: MediaAsset, as: 'photo' }]
    });

    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    // Don't send password hash
    const { passwordHash, ...ownerData } = owner.toJSON();
    res.json(ownerData);
  } catch (error) {
    console.error('Error fetching admin owner profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile by logged-in admin
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      intro,
      whatsappNumber,
      whatsappGroupLink,
      whatsapp_group_link,
      domainName,
      photoId
    } = req.body;
    
    const owner = await Owner.findByPk(req.user.ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    if (domainName && domainName !== owner.domainName) {
      // Check if domain is taken
      const existing = await Owner.findOne({ where: { domainName } });
      if (existing && existing.id !== owner.id) {
        return res.status(400).json({ message: 'Domain name is already mapped to another owner.' });
      }
    }

    const nextWhatsappGroupLink = whatsappGroupLink ?? whatsapp_group_link ?? owner.whatsappGroupLink;

    await owner.update({
      name,
      bio,
      intro,
      whatsappNumber,
      whatsappGroupLink: nextWhatsappGroupLink,
      domainName,
      photoId
    });

    const updated = await Owner.findByPk(req.user.ownerId, {
      include: [{ model: MediaAsset, as: 'photo' }]
    });
    
    const { passwordHash, ...ownerData } = updated.toJSON();
    res.json(ownerData);
  } catch (error) {
    console.error('Error updating owner profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
