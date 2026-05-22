const { Product, MediaAsset } = require('../models');

const applyBasePath = (value, basePath) => {
  if (!value) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  const normalizedBase = basePath.startsWith('/') ? basePath : `/${basePath}`;
  const normalizedValue = value.startsWith('/') ? value : `/${value}`;
  if (normalizedValue.startsWith(normalizedBase + '/')) return normalizedValue;
  return normalizedBase + normalizedValue;
};

const withMediaPaths = (prod) => {
  if (!prod) return prod;
  const basePath = process.env.PUBLIC_BASE_PATH || '';
  const data = prod.toJSON ? prod.toJSON() : { ...prod };
  if (data.image) {
    data.image.filePath = applyBasePath(data.image.filePath, basePath);
    data.image.thumbnailPath = applyBasePath(data.image.thumbnailPath, basePath);
  }
  return data;
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: MediaAsset, as: 'image' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(products.map(withMediaPaths));
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: MediaAsset, as: 'image' }]
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(withMediaPaths(product));
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, slug, scientificName, category, description, price, featured, mediaAssetId } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' });
    }

    const product = await Product.create({
      name,
      slug,
      scientificName,
      category,
      description,
      price,
      featured,
      mediaAssetId
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, slug, scientificName, category, description, price, featured, mediaAssetId } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.update({
      name,
      slug,
      scientificName,
      category,
      description,
      price,
      featured,
      mediaAssetId
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
