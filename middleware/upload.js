const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Ensure upload directories exist
const uploadRoot = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
const uploadDir = uploadRoot;
const mediaDir = path.join(uploadRoot, 'media');
const thumbDir = path.join(uploadRoot, 'thumbnails');
const versionsDir = path.join(uploadRoot, 'versions');
const videosDir = path.join(uploadRoot, 'videos');

[uploadDir, mediaDir, thumbDir, versionsDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mediaDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const optimizeImage = async (req, res, next) => {
  if (!req.file || !req.file.mimetype.startsWith('image/')) return next();

  const filePath = req.file.path;
  const publicOriginalPath = path.posix.join('uploads', 'media', req.file.filename);
  const fileName = path.parse(req.file.filename).name;
  const outputDir = path.join(uploadRoot, 'versions', fileName);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const metadata = await sharp(filePath).metadata();

    // Generate versions
    const versions = [
      { name: 'thumbnail', width: 300 },
      { name: 'medium', width: 800 },
      { name: 'large', width: 1600 }
    ];

    const results = await Promise.all(versions.map(async (v) => {
      const vPath = path.join(outputDir, `${v.name}.webp`);
      await sharp(filePath)
        .resize(v.width)
        .webp({ quality: 80 })
        .toFile(vPath);
      return { name: v.name, path: path.posix.join('uploads', 'versions', fileName, `${v.name}.webp`) };
    }));

    req.optimizedImage = {
      original: publicOriginalPath,
      versions: results,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: req.file.size
      }
    };

    next();
  } catch (error) {
    console.error('Image optimization error:', error);
    next(error);
  }
};

let ffmpegInstaller;
try {
  ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
} catch (err) {
  console.warn('@ffmpeg-installer/ffmpeg not found, video thumbnails will be disabled.');
}

const optimizeVideo = (req, res, next) => {
  if (!req.file || !req.file.mimetype.startsWith('video/')) return next();

  const filePath = req.file.path;
  const publicOriginalPath = path.posix.join('uploads', 'media', req.file.filename);
  const fileName = path.parse(req.file.filename).name;
  const outputDir = path.join(uploadRoot, 'videos', fileName);
  const thumbPath = path.join(uploadRoot, 'thumbnails', `${fileName}.jpg`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'optimized.mp4');
  const publicOptimizedPath = path.posix.join('uploads', 'videos', fileName, 'optimized.mp4');
  const publicThumbPath = path.posix.join('uploads', 'thumbnails', `${fileName}.jpg`);

  // Use the path from the installed ffmpeg-installer
  const ffmpegPath = ffmpegInstaller ? ffmpegInstaller.path : null;
  
  if (!ffmpegPath) {
    // FALLBACK: If ffmpeg is not available, use original file and skip thumbnail
    req.optimizedVideo = {
      original: publicOriginalPath,
      optimized: publicOriginalPath,
      thumbnail: null
    };
    return next();
  }

  const ffmpeg = spawn(ffmpegPath, [
    '-i', filePath,
    '-ss', '00:00:01',
    '-vframes', '1',
    thumbPath,
    '-vcodec', 'libx264',
    '-crf', '28',
    '-preset', 'fast',
    '-y', // Overwrite if exists
    outputPath
  ]);

  let errorOutput = '';
  ffmpeg.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  ffmpeg.on('close', (code) => {
    if (code !== 0) {
      console.error('FFmpeg failed with code:', code);
      console.error('FFmpeg error output:', errorOutput);
      
      // FALLBACK: If ffmpeg fails, use original file and skip thumbnail
      req.optimizedVideo = {
        original: publicOriginalPath,
        optimized: publicOriginalPath,
        thumbnail: null
      };
      return next();
    }

    req.optimizedVideo = {
      original: publicOriginalPath,
      optimized: publicOptimizedPath,
      thumbnail: publicThumbPath
    };
    next();
  });

  ffmpeg.on('error', (err) => {
    console.error('FFmpeg failed to start:', err);
    
    // FALLBACK: Use original file and skip thumbnail
    req.optimizedVideo = {
      original: publicOriginalPath,
      optimized: publicOriginalPath,
      thumbnail: null
    };
    next();
  });
};

module.exports = { upload, optimizeImage, optimizeVideo };
