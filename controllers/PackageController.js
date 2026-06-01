const { Package, PackagePrice, MediaAsset } = require('../models');
const { toWebPath } = require('../utils/paths');

const withMediaPaths = (pkg) => {
  if (!pkg) return pkg;
  const basePath = process.env.PUBLIC_BASE_PATH || '';
  const data = pkg.toJSON ? pkg.toJSON() : { ...pkg };
  if (data.image) {
    data.image.filePath = toWebPath(data.image.filePath, basePath);
    data.image.thumbnailPath = data.image.thumbnailPath
      ? toWebPath(data.image.thumbnailPath, basePath)
      : null;
  }
  return data;
};

exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.findAll({
      include: [
        { model: PackagePrice, as: 'prices' },
        { model: MediaAsset, as: 'image' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(packages.map(withMediaPaths));
  } catch (error) {
    console.error('Get all packages error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findByPk(req.params.id, {
      include: [
        { model: PackagePrice, as: 'prices' },
        { model: MediaAsset, as: 'image' }
      ]
    });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json(withMediaPaths(pkg));
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createPackage = async (req, res) => {
  try {
    const { name, slug, description, featured, mediaAssetId, prices } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' });
    }

    const pkg = await Package.create({
      name,
      slug,
      description,
      featured,
      mediaAssetId
    });

    if (prices && Array.isArray(prices)) {
      for (const pr of prices) {
        await PackagePrice.create({
          packageId: pkg.id,
          countryCode: pr.countryCode,
          price: pr.price,
          currency: pr.currency,
          referralBonus: pr.referralBonus,
          matchBonus: pr.matchBonus
        });
      }
    }

    const completedPkg = await Package.findByPk(pkg.id, {
      include: [{ model: PackagePrice, as: 'prices' }]
    });

    res.status(201).json(completedPkg);
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const { name, slug, description, featured, mediaAssetId, prices } = req.body;
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    await pkg.update({
      name,
      slug,
      description,
      featured,
      mediaAssetId
    });

    if (prices && Array.isArray(prices)) {
      // Simple strategy: recreate pricing structure
      await PackagePrice.destroy({ where: { packageId: pkg.id } });
      for (const pr of prices) {
        await PackagePrice.create({
          packageId: pkg.id,
          countryCode: pr.countryCode,
          price: pr.price,
          currency: pr.currency,
          referralBonus: pr.referralBonus,
          matchBonus: pr.matchBonus
        });
      }
    }

    const completedPkg = await Package.findByPk(pkg.id, {
      include: [{ model: PackagePrice, as: 'prices' }]
    });

    res.json(completedPkg);
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    await pkg.destroy();
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
