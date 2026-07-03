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

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, videosDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `${unique}${ext}`);
  }
});

const memoryStorage = multer.memoryStorage();

const hybridStorage = {
  _handleFile: (req, file, cb) => {
    if (file.fieldname === 'file') {
      diskStorage._handleFile(req, file, cb);
    } else if (file.fieldname === 'thumbnail') {
      memoryStorage._handleFile(req, file, cb);
    } else {
      cb(new Error('Unexpected field in hybrid upload'));
    }
  },
  _removeFile: (req, file, cb) => {
    if (file.fieldname === 'file') {
      diskStorage._removeFile(req, file, cb);
    } else if (file.fieldname === 'thumbnail') {
      memoryStorage._removeFile(req, file, cb);
    } else {
      cb(null);
    }
  }
};

const hybridUpload = multer({
  storage: hybridStorage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'file') {
      if (file.mimetype.startsWith('video/')) cb(null, true);
      else cb(new Error('Only video files are allowed for file field'));
    } else if (file.fieldname === 'thumbnail') {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Only image files are allowed for thumbnail field'));
    } else {
      cb(new Error(`Unexpected field: ${file.fieldname}`));
    }
  }
});

const videoUpload = multer({
  storage: diskStorage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only video files are allowed'));
  }
});

/** Single compressed WebP in uploads/images/ */
const optimizeImage = async (req, res, next) => {
  let file = req.file;
  if (!file && req.files && req.files.thumbnail && req.files.thumbnail[0]) {
    file = req.files.thumbnail[0];
  }
  if (!file) return next();

  if (file.fieldname === 'thumbnail' && file.size > 15 * 1024 * 1024) {
    return next(new Error('Thumbnail size exceeds limit of 15MB'));
  }

  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `image-${unique}.webp`;
  const diskPath = path.join(imagesDir, filename);
  const relativePath = path.posix.join('uploads', 'images', filename);

  try {
    const pipeline = sharp(file.buffer).rotate();
    const metadata = await pipeline.metadata();

    await sharp(file.buffer)
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
  let file = req.file;
  if (!file && req.files && req.files.file && req.files.file[0]) {
    file = req.files.file[0];
  }
  if (!file) return next();

  const relativePath = path.posix.join('uploads', 'videos', file.filename);

  req.optimizedVideo = {
    path: relativePath,
    mimeType: file.mimetype,
    size: file.size
  };

  next();
};

module.exports = {
  uploadRoot,
  imagesDir,
  videosDir,
  uploadImage: imageUpload,
  uploadVideo: videoUpload,
  hybridUpload,
  optimizeImage,
  optimizeVideo
};
