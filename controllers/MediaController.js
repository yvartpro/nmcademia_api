const { MediaAsset } = require('../models');

const normalizeVersions = (versions) => {
  if (!versions) return [];
  if (Array.isArray(versions)) return versions;
  if (typeof versions === 'string') {
    try {
      return normalizeVersions(JSON.parse(versions));
    } catch {
      return [];
    }
  }
  return [];
};

const applyBasePath = (value, basePath) => {
  if (!value) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  const normalizedBase = basePath.startsWith('/') ? basePath : `/${basePath}`;
  const normalizedValue = value.startsWith('/') ? value : `/${value}`;
  if (normalizedValue.startsWith(normalizedBase + '/')) return normalizedValue;
  return normalizedBase + normalizedValue;
};

const withBasePath = (asset) => {
  const basePath = process.env.PUBLIC_BASE_PATH || '';
  const data = asset.toJSON ? asset.toJSON() : { ...asset };
  data.filePath = applyBasePath(data.filePath, basePath);
  data.thumbnailPath = applyBasePath(data.thumbnailPath, basePath);
  data.versions = normalizeVersions(data.versions).map(v => ({
    ...v,
    path: applyBasePath(v.path, basePath)
  }));
  return data;
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.optimizedImage) {
      return res.status(400).json({ error: 'No image uploaded or optimization failed' });
    }

    const { original, versions, metadata } = req.optimizedImage;

    const asset = await MediaAsset.create({
      type: 'image',
      title: req.body.title || req.file.originalname,
      description: req.body.description,
      excerpt: req.body.excerpt,
      filePath: original,
      thumbnailPath: versions.find(v => v.name === 'thumbnail')?.path,
      mimeType: req.file.mimetype,
      fileSize: metadata.size,
      width: metadata.width,
      height: metadata.height,
      versions: versions
    });

    res.status(201).json(withBasePath(asset));
  } catch (error) {
    console.error('Error creating image asset:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.optimizedVideo) {
      return res.status(400).json({ error: 'No video uploaded or optimization failed' });
    }

    const { original, optimized, thumbnail } = req.optimizedVideo;

    const asset = await MediaAsset.create({
      type: 'video',
      title: req.body.title || req.file.originalname,
      description: req.body.description,
      excerpt: req.body.excerpt,
      filePath: optimized,
      thumbnailPath: thumbnail,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      versions: [{ name: 'original', path: original }, { name: 'optimized', path: optimized }]
    });

    res.status(201).json(withBasePath(asset));
  } catch (error) {
    console.error('Error creating video asset:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllMedia = async (req, res) => {
  try {
    const assets = await MediaAsset.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(assets.map(withBasePath));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const asset = await MediaAsset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Media not found' });
    await asset.destroy();
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
