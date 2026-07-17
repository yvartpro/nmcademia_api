const fs = require('fs');
const path = require('path');
const { MediaAsset } = require('../models');
const { uploadRoot } = require('../middleware/upload');
const { toWebPath, toPublicUrl } = require('../utils/paths');
const { enqueue: enqueueTranscode, getStatus: getQueueStatus } = require('../services/videoQueue');

const diskPathFromRelative = (relativePath) => {
  if (!relativePath) return null;
  const rel = relativePath.replace(/^uploads[/\\]/, '');
  return path.join(uploadRoot, rel);
};

const normalizeStoredPath = (relativePath) => {
  if (!relativePath) return relativePath;
  const normalized = String(relativePath).replace(/^\/+/, '');
  if (normalized.startsWith('uploads/')) return normalized;
  if (normalized.startsWith('videos/') || normalized.startsWith('images/')) {
    return `uploads/${normalized}`;
  }
  return normalized;
};

const withPublicUrls = (asset, req) => {
  const data = asset.toJSON ? asset.toJSON() : { ...asset };
  const basePath = process.env.PUBLIC_BASE_PATH || '';
  const rawPath = normalizeStoredPath(data.filePath);
  data.filePath = toWebPath(rawPath, basePath);

  let originOverride = null;
  if (req) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    originOverride = `${proto}://${host}`;
  }

  data.publicUrl = toPublicUrl(rawPath, basePath, originOverride);
  data.thumbnailPath = data.thumbnailPath
    ? toWebPath(normalizeStoredPath(data.thumbnailPath), basePath)
    : null;
  data.versions = data.versions || null;
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

exports.uploadVideoHls = async (req, res) => {
  const { sequelize } = require('../models');

  try {
    const videoFile = req.file || req.files?.file?.[0];
    if (!videoFile) {
      return res.status(400).json({ error: 'No video uploaded' });
    }

    // --- Step 1: Save the thumbnail image immediately (fast, no ffmpeg needed) ---
    let thumbnailPath = null;
    if (req.optimizedImage) {
      const { path: imgPath, mimeType: imgMimeType, metadata } = req.optimizedImage;
      const imageAsset = await MediaAsset.create({
        type: 'image',
        title: req.body.thumbnailTitle || req.body.title || 'Thumbnail',
        description: req.body.thumbnailDescription || req.body.description,
        excerpt: req.body.excerpt,
        filePath: imgPath,
        thumbnailPath: null,
        mimeType: imgMimeType,
        fileSize: metadata.size,
        width: metadata.width,
        height: metadata.height,
        versions: null,
        processingStatus: 'ready'
      });
      thumbnailPath = imageAsset.filePath;
    }

    // --- Step 2: Immediately create the video DB record with processingStatus='pending' ---
    // We use a temporary placeholder for filePath (the real m3u8 path will be updated after transcoding)
    const title = req.body.title || videoFile.originalname || 'Video';
    const asset = await MediaAsset.create({
      type: 'video',
      title,
      description: req.body.description,
      excerpt: req.body.excerpt,
      filePath: `uploads/videos/pending_${Date.now()}.mp4`, // placeholder, updated after transcode
      thumbnailPath,
      mimeType: videoFile.mimetype,
      fileSize: videoFile.size,
      duration: null,
      versions: null,
      processingStatus: 'pending'
    });

    // --- Step 3: Immediately respond to the browser — no more 504 timeouts! ---
    res.status(202).json({
      ...withPublicUrls(asset, req),
      processingStatus: 'pending',
      message: 'Upload received. Video is being processed in the background.'
    });

    // --- Step 4: Push the heavy ffmpeg work to the background queue ---
    enqueueTranscode({
      assetId: asset.id,
      sourcePath: videoFile.path,
      originalname: videoFile.originalname,
      title,
      description: req.body.description,
      excerpt: req.body.excerpt,
      mimeType: videoFile.mimetype,
      size: videoFile.size
    });

  } catch (error) {
    console.error('Error creating HLS video asset:', error);
    // Only send response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

// Poll the processing status of a specific media asset
exports.getMediaStatus = async (req, res) => {
  try {
    const asset = await MediaAsset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Media not found' });

    const data = withPublicUrls(asset, req);
    return res.json({
      id: asset.id,
      processingStatus: asset.processingStatus,
      processingError: asset.processingError || null,
      filePath: data.filePath,
      publicUrl: data.publicUrl,
      thumbnailPath: data.thumbnailPath,
      duration: asset.duration,
      versions: asset.versions,
      queue: getQueueStatus()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload video with optional thumbnail image; both saved in a single DB transaction
exports.uploadVideoWithThumbnail = async (req, res) => {
  const { sequelize } = require('../models');

  try {
    if (!req.optimizedVideo) {
      return res.status(400).json({ error: 'No video uploaded' });
    }

    const videoFile = req.file || req.files?.file?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    const t = await sequelize.transaction();
    try {
      let thumbnailPath = null;

      // If a thumbnail was uploaded and optimized, create an image MediaAsset first
      if (req.optimizedImage) {
        const { path: imgPath, mimeType, metadata } = req.optimizedImage;
        const imageAsset = await MediaAsset.create({
          type: 'image',
          title: req.body.thumbnailTitle || req.body.title || thumbnailFile?.originalname || 'Thumbnail',
          description: req.body.thumbnailDescription || req.body.description,
          excerpt: req.body.excerpt,
          filePath: imgPath,
          thumbnailPath: null,
          mimeType,
          fileSize: metadata.size,
          width: metadata.width,
          height: metadata.height,
          versions: null
        }, { transaction: t });

        thumbnailPath = imageAsset.filePath;
      }

      // Create video asset and reference the thumbnailPath (can be null)
      const { path: filePath, mimeType, size } = req.optimizedVideo;
      const videoAsset = await MediaAsset.create({
        type: 'video',
        title: req.body.title || videoFile?.originalname || 'Video',
        description: req.body.description,
        excerpt: req.body.excerpt,
        filePath,
        thumbnailPath: thumbnailPath,
        mimeType,
        fileSize: size,
        versions: null
      }, { transaction: t });

      await t.commit();

      res.status(201).json(withPublicUrls(videoAsset, req));
    } catch (err) {
      await t.rollback();
      // Cleanup files written to disk when transaction fails
      try {
        if (req.optimizedVideo && req.optimizedVideo.path) {
          const videoDisk = diskPathFromRelative(req.optimizedVideo.path);
          if (videoDisk && fs.existsSync(videoDisk)) fs.unlinkSync(videoDisk);
        }
        if (req.optimizedImage && req.optimizedImage.path) {
          const imgDisk = diskPathFromRelative(req.optimizedImage.path);
          if (imgDisk && fs.existsSync(imgDisk)) fs.unlinkSync(imgDisk);
        }
      } catch (cleanupErr) {
        console.error('Error during cleanup after failed transactional upload:', cleanupErr);
      }

      console.error('Transactional upload failed:', err);
      res.status(500).json({ error: 'Failed to save media assets' });
    }
  } catch (error) {
    console.error('Error processing upload:', error);
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
      if (diskPath.endsWith('.m3u8')) {
        const hlsDir = path.dirname(diskPath);
        fs.rmSync(hlsDir, { recursive: true, force: true });
      } else {
        fs.unlinkSync(diskPath);
      }
    }

    // Also delete the thumbnail image file and its DB record if it exists
    if (asset.thumbnailPath) {
      const thumbDisk = diskPathFromRelative(asset.thumbnailPath);
      if (thumbDisk && fs.existsSync(thumbDisk)) {
        try { fs.unlinkSync(thumbDisk); } catch (_) {}
      }
    }

    await asset.destroy();
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Replace the thumbnail of an existing video asset
exports.updateThumbnail = async (req, res) => {
  try {
    const asset = await MediaAsset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Media not found' });
    if (asset.type !== 'video') {
      return res.status(400).json({ error: 'Thumbnail can only be updated on video assets' });
    }
    if (!req.optimizedImage) {
      return res.status(400).json({ error: 'No thumbnail image uploaded' });
    }

    // Delete the old thumbnail file from disk (best-effort)
    if (asset.thumbnailPath) {
      const oldThumbDisk = diskPathFromRelative(asset.thumbnailPath);
      if (oldThumbDisk && fs.existsSync(oldThumbDisk)) {
        try { fs.unlinkSync(oldThumbDisk); } catch (_) {}
      }
    }

    const { path: imgPath, mimeType, metadata } = req.optimizedImage;

    // Create a new image MediaAsset for the thumbnail
    const imageAsset = await MediaAsset.create({
      type: 'image',
      title: req.body.title || asset.title || 'Thumbnail',
      description: req.body.description || asset.description,
      excerpt: null,
      filePath: imgPath,
      thumbnailPath: null,
      mimeType,
      fileSize: metadata.size,
      width: metadata.width,
      height: metadata.height,
      versions: null
    });

    // Update the video asset to reference the new thumbnail
    await asset.update({ thumbnailPath: imageAsset.filePath });

    res.json(withPublicUrls(asset, req));
  } catch (error) {
    console.error('Error updating thumbnail:', error);
    res.status(500).json({ error: error.message });
  }
};

