const { Owner, MediaAsset } = require('../models');

// Fetch public profile for frontend based on resolved tenant
exports.getPublicProfile = async (req, res) => {
  try {
    const owner = req.owner;
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    res.json({
      name: owner.name,
      bio: owner.bio,
      whatsappNumber: owner.whatsappNumber,
      domainName: owner.domainName,
      photo: owner.photo || null
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
    const { name, bio, whatsappNumber, domainName, photoId } = req.body;
    
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

    await owner.update({
      name,
      bio,
      whatsappNumber,
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
