const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
let ffmpegPath = '/usr/bin/ffmpeg';
let ffprobePath = '/usr/bin/ffprobe';

if (!fs.existsSync(ffmpegPath)) {
  try {
    ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  } catch (err) {
    ffmpegPath = 'ffmpeg';
  }
}

if (!fs.existsSync(ffprobePath)) {
  try {
    ffprobePath = require('@ffprobe-installer/ffprobe').path;
  } catch (error) {
    const fallback = ffmpegPath.replace(/ffmpeg$/, 'ffprobe');
    if (fs.existsSync(fallback)) {
      ffprobePath = fallback;
    } else {
      ffprobePath = 'ffprobe';
    }
  }
}

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const uploadRoot = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
const videosRoot = path.join(uploadRoot, 'videos');

if (!fs.existsSync(videosRoot)) {
  fs.mkdirSync(videosRoot, { recursive: true });
}

function toRelativeUploadPath(absolutePath) {
  const relative = path.relative(uploadRoot, absolutePath).split(path.sep).join('/');
  return path.posix.join('uploads', relative);
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
    },
    stream: {
      status: 'ready',
      streamType: 'hls',
      streamingMode: 'adaptive',
      segmentDuration: 4,
      qualityLevels: ['360', '720'],
      manifestUrl: `uploads/videos/${videoId}/master.m3u8`
    }
  };

  await new Promise((resolve, reject) => {
    // Build filter_complex to split input into two scaled outputs
    const filterComplex = '[0:v]split=2[v360][v720];[v360]scale=w=640:h=360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2[v360out];[v720]scale=w=1280:h=720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[v720out]';

    const outputOptions = [
      '-filter_complex', filterComplex,
      // --- 360p stream (index 0) ---
      // Force yuv420p so libx264 works with any source pixel format (yuv444p, etc.)
      '-map', '[v360out]',
      '-c:v:0', 'libx264', '-pix_fmt:v:0', 'yuv420p', '-preset:v:0', 'fast',
      '-crf:v:0', '23', '-b:v:0', '400k', '-maxrate:v:0', '450k', '-bufsize:v:0', '600k',
      // --- 720p stream (index 1) ---
      '-map', '[v720out]',
      '-c:v:1', 'libx264', '-pix_fmt:v:1', 'yuv420p', '-preset:v:1', 'fast',
      '-crf:v:1', '23', '-b:v:1', '1500k', '-maxrate:v:1', '1600k', '-bufsize:v:1', '2200k',
    ];

    // Audio mapping per stream
    if (hasAudio) {
      outputOptions.push(
        '-map', 'a:0', '-c:a:0', 'aac', '-b:a:0', '96k',
        '-map', 'a:0', '-c:a:1', 'aac', '-b:a:1', '128k',
      );
    }

    // HLS muxer options
    outputOptions.push(
      '-f', 'hls',
      '-hls_time', '4',
      '-hls_playlist_type', 'vod',
      '-hls_flags', 'independent_segments',
      '-master_pl_name', 'master.m3u8',
      '-hls_segment_filename', path.join(outputDir, 'stream_%v_%03d.ts'),
      // Map stream 0 → v:0 a:0, stream 1 → v:1 a:1
      '-var_stream_map', hasAudio ? 'v:0,a:0 v:1,a:1' : 'v:0 v:1',
    );

    const args = [
      '-threads', '2',
      '-i', sourcePath,
      '-y',
      ...outputOptions,
      path.join(outputDir, 'stream_%v.m3u8')
    ];

    const child = spawn(ffmpegPath, args);
    let stderrData = '';

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}. Stderr: ${stderrData}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
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
    status: 'ready',
    streamType: 'hls',
    streamingMode: 'adaptive',
    playlistPath: relativePlaylistPath,
    manifestUrl: relativePlaylistPath,
    versions
  };
}

module.exports = {
  transcodeVideoToHls
};
