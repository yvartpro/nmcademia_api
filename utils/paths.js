/**
 * Build web paths and absolute media URLs without double slashes.
 */

const collapseSlashes = (path) => path.replace(/\/\/+/g, '/');

const toWebPath = (value, basePath = '') => {
  if (!value) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;

  const path = collapseSlashes(value.startsWith('/') ? value : `/${value}`);
  const base = (basePath || '').trim().replace(/\/+$/, '');
  if (!base) return path;

  const normalizedBase = base.startsWith('/') ? base : `/${base}`;
  if (path === normalizedBase || path.startsWith(`${normalizedBase}/`)) return path;
  return collapseSlashes(`${normalizedBase}${path}`);
};

const toPublicUrl = (filePath, basePath = process.env.PUBLIC_BASE_PATH || '') => {
  if (!filePath) return '';
  const origin = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  const webPath = toWebPath(filePath, basePath);
  if (!origin) return webPath;
  return `${origin}${webPath}`;
};

module.exports = { toWebPath, toPublicUrl, collapseSlashes };
