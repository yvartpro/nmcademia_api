/**
 * videoQueue.js
 *
 * A simple in-memory queue for video transcoding jobs.
 * Guarantees only ONE ffmpeg process runs at a time, which is critical
 * for a single-core 1GB RAM VPS. Jobs are processed sequentially (FIFO).
 */
const { transcodeVideoToHls } = require('./videoHlsService');

const queue = [];
let isProcessing = false;

/**
 * Add a new transcoding job to the queue.
 *
 * @param {Object} job
 * @param {string} job.assetId       - The MediaAsset DB row id to update when done
 * @param {string} job.sourcePath    - Absolute path to the raw uploaded video file
 * @param {string} job.originalname  - Original filename from the user's upload
 * @param {string} job.title
 * @param {string} job.description
 * @param {string} job.excerpt
 * @param {string} job.mimeType
 * @param {number} job.size
 * @param {string|null} job.thumbnailPath - Relative path of the already-saved thumbnail (or null)
 */
function enqueue(job) {
  queue.push(job);
  console.log(`[VideoQueue] Job added for asset ${job.assetId}. Queue length: ${queue.length}`);
  // Kick off processing if not already running
  processNext();
}

function processNext() {
  if (isProcessing || queue.length === 0) return;

  isProcessing = true;
  const job = queue.shift(); // take the first job

  console.log(`[VideoQueue] Starting transcoding for asset ${job.assetId}. Remaining queue: ${queue.length}`);

  _processJob(job)
    .then(() => {
      console.log(`[VideoQueue] Transcoding DONE for asset ${job.assetId}`);
    })
    .catch((err) => {
      console.error(`[VideoQueue] Transcoding FAILED for asset ${job.assetId}:`, err.message);
    })
    .finally(() => {
      isProcessing = false;
      // Process the next job in the queue
      processNext();
    });
}

async function _processJob(job) {
  const { MediaAsset } = require('../models');

  // Mark as 'processing' in the DB
  await MediaAsset.update(
    { processingStatus: 'processing' },
    { where: { id: job.assetId } }
  );

  try {
    const encoded = await transcodeVideoToHls({
      sourcePath: job.sourcePath,
      originalname: job.originalname,
      title: job.title,
      description: job.description,
      excerpt: job.excerpt,
      mimeType: job.mimeType,
      size: job.size
    });

    // Update the DB record with the final HLS paths and mark as 'ready'
    await MediaAsset.update(
      {
        filePath: encoded.playlistPath,
        mimeType: encoded.mimeType,
        fileSize: encoded.size,
        duration: encoded.duration,
        versions: encoded.versions,
        processingStatus: 'ready',
        processingError: null
      },
      { where: { id: job.assetId } }
    );
  } catch (err) {
    // Mark as 'error' so the frontend can show a meaningful message
    await MediaAsset.update(
      {
        processingStatus: 'error',
        processingError: err.message
      },
      { where: { id: job.assetId } }
    ).catch(() => {}); // best-effort
    throw err;
  }
}

/**
 * Get the current queue status (useful for a status endpoint).
 */
function getStatus() {
  return {
    isProcessing,
    queueLength: queue.length,
    pendingAssetIds: queue.map((j) => j.assetId)
  };
}

module.exports = { enqueue, getStatus };
