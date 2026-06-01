const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadRoot = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
const imagesDir = path.join(uploadRoot, 'images');
const videosDir = path.join(uploadRoot, 'videos');

[imagesDir, videosDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, videosDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname) || '.mp4';
      cb(null, `${unique}${ext}`);
    }
  }),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only video files are allowed'));
  }
});

/** Single compressed WebP in uploads/images/ */
const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `image-${unique}.webp`;
  const diskPath = path.join(imagesDir, filename);
  const relativePath = path.posix.join('uploads', 'images', filename);

  try {
    const pipeline = sharp(req.file.buffer).rotate();
    const metadata = await pipeline.metadata();

    await sharp(req.file.buffer)
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 82 })
      .toFile(diskPath);

    const stat = fs.statSync(diskPath);

    req.optimizedImage = {
      path: relativePath,
      mimeType: 'image/webp',
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: 'webp',
        size: stat.size
      }
    };

    next();
  } catch (error) {
    console.error('Image optimization error:', error);
    next(error);
  }
};

/** Video saved as-is in uploads/videos/ */
const optimizeVideo = (req, res, next) => {
  if (!req.file) return next();

  const relativePath = path.posix.join('uploads', 'videos', req.file.filename);

  req.optimizedVideo = {
    path: relativePath,
    mimeType: req.file.mimetype,
    size: req.file.size
  };

  next();
};

module.exports = {
  uploadRoot,
  imagesDir,
  videosDir,
  uploadImage: imageUpload,
  uploadVideo: videoUpload,
  optimizeImage,
  optimizeVideo
};
