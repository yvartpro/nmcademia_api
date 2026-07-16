const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffmpeg-installer/ffmpeg').path.replace(/ffmpeg$/, 'ffprobe');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const uploadRoot = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
const videosRoot = path.join(uploadRoot, 'videos');

if (!fs.existsSync(videosRoot)) {
  fs.mkdirSync(videosRoot, { recursive: true });
}

function toRelativeUploadPath(absolutePath) {
  const relative = path.relative(uploadRoot, absolutePath);
  return relative.split(path.sep).join('/');
}

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getVideoDuration(inputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      const duration = Number(metadata?.format?.duration || 0);
      resolve(Number.isFinite(duration) ? Math.round(duration) : 0);
    });
  });
}

async function transcodeVideoToHls({ sourcePath, originalname, title, description, excerpt, mimeType, size }) {
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    throw new Error('Source video was not found');
  }

  const videoId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const outputDir = path.join(videosRoot, videoId);
  ensureDirectory(outputDir);

  const hasAudio = await new Promise((resolve) => {
    ffmpeg.ffprobe(sourcePath, (err, metadata) => {
      if (err) {
        resolve(false);
        return;
      }
      const streams = metadata?.streams || [];
      resolve(streams.some((stream) => stream?.codec_type === 'audio'));
    });
  });

  const duration = await getVideoDuration(sourcePath);

  const playlistPath = path.join(outputDir, 'master.m3u8');
  const relativePlaylistPath = toRelativeUploadPath(playlistPath);
  const versions = {
    hls: {
      masterUrl: `uploads/videos/${videoId}/master.m3u8`,
      segmentDuration: 4,
      resolutions: {
        '360': `uploads/videos/${videoId}/stream_0.m3u8`,
        '720': `uploads/videos/${videoId}/stream_1.m3u8`
      }
    }
  };

  await new Promise((resolve, reject) => {
    const baseOptions = ['-filter_complex', '[0:v]split=2[v360][v720];[v360]scale=w=640:h=360[v360out];[v720]scale=w=1280:h=720[v720out]'];
    const v360Options = ['-map', '[v360out]', '-c:v:0', 'libx264', '-b:v:0', '400k', '-maxrate:v:0', '450k', '-bufsize:v:0', '600k'];
    const v720Options = ['-map', '[v720out]', '-c:v:1', 'libx264', '-b:v:1', '1500k', '-maxrate:v:1', '1600k', '-bufsize:v:1', '2200k'];

    if (hasAudio) {
      v360Options.push('-map', 'a:0', '-c:a:0', 'aac', '-b:a:0', '96k');
      v720Options.push('-map', 'a:0', '-c:a:1', 'aac', '-b:a:1', '128k');
    }

    const hlsOptions = ['-f', 'hls', '-hls_time', '4', '-hls_playlist_type', 'vod', '-master_pl_name', 'master.m3u8', '-hls_segment_filename', path.join(outputDir, 'stream_%v_%03d.ts')];
    const outputOptions = baseOptions.concat(v360Options, v720Options, hlsOptions);

    ffmpeg(sourcePath)
      .inputOptions('-threads 1')
      .outputOptions(outputOptions)
      .output(path.join(outputDir, 'stream_%v.m3u8'))
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });

  if (!fs.existsSync(playlistPath)) {
    throw new Error('Failed to create HLS playlist');
  }

  try {
    fs.unlinkSync(sourcePath);
  } catch (error) {
    console.warn('Could not remove source upload after transcoding:', error.message);
  }

  return {
    videoId,
    title: title || originalname || 'Uploaded video',
    description,
    excerpt,
    mimeType: mimeType || 'application/vnd.apple.mpegurl',
    size,
    duration,
    playlistPath: relativePlaylistPath,
    versions
  };
}

module.exports = {
  transcodeVideoToHls
};
