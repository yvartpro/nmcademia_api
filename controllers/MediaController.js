const fs = require('fs');
const path = require('path');
const { MediaAsset } = require('../models');
const { uploadRoot } = require('../middleware/upload');
const { toWebPath, toPublicUrl } = require('../utils/paths');

const diskPathFromRelative = (relativePath) => {
  if (!relativePath) return null;
  const rel = relativePath.replace(/^uploads[/\\]/, '');
  return path.join(uploadRoot, rel);
};

const withPublicUrls = (asset, req) => {
  const data = asset.toJSON ? asset.toJSON() : { ...asset };
  const basePath = process.env.PUBLIC_BASE_PATH || '';
  const rawPath = data.filePath;
  data.filePath = toWebPath(rawPath, basePath);

  let originOverride = null;
  if (req) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    originOverride = `${proto}://${host}`;
  }

  data.publicUrl = toPublicUrl(rawPath, basePath, originOverride);
  data.thumbnailPath = null;
  data.versions = null;
  return data;
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.optimizedImage) {
      return res.status(400).json({ error: 'No image uploaded or optimization failed' });
    }

    const { path: filePath, metadata, mimeType } = req.optimizedImage;

    const asset = await MediaAsset.create({
      type: 'image',
      title: req.body.title || req.file?.originalname || 'Image',
      description: req.body.description,
      excerpt: req.body.excerpt,
      filePath,
      thumbnailPath: null,
      mimeType,
      fileSize: metadata.size,
      width: metadata.width,
      height: metadata.height,
      versions: null
    });

    res.status(201).json(withPublicUrls(asset, req));
  } catch (error) {
    console.error('Error creating image asset:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.optimizedVideo) {
      return res.status(400).json({ error: 'No video uploaded' });
    }

    const { path: filePath, mimeType, size } = req.optimizedVideo;

    const asset = await MediaAsset.create({
      type: 'video',
      title: req.body.title || req.file?.originalname || 'Video',
      description: req.body.description,
      excerpt: req.body.excerpt,
      filePath,
      thumbnailPath: null,
      mimeType,
      fileSize: size,
      versions: null
    });

    res.status(201).json(withPublicUrls(asset, req));
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
    res.json(assets.map(asset => withPublicUrls(asset, req)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const asset = await MediaAsset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Media not found' });

    const diskPath = diskPathFromRelative(asset.filePath);
    if (diskPath && fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }

    await asset.destroy();
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
