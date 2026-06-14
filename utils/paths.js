/**
 * Build web paths and absolute media URLs without double slashes.
 */

const collapseSlashes = (path) => path.replace(/\/\/+/g, '/');

const normalizeAbsoluteUrl = (value) => {
  if (!value) return value;
  const fixed = value.replace(/^(https?:)\/+/, '$1//');
  let normalized = fixed.replace(/([^:]\/)\/+/, '$1');
  normalized = normalized.replace(/^(https?:\/\/[^/]+)\/(?:https?:\/\/[^/]+)(\/.*)$/i, '$1$2');
  normalized = normalized.replace(/^(https?:\/\/[^/]+)\/(?:https?:\/[^/]+)(\/.*)$/i, '$1$2');
  return normalized;
};

const isAbsoluteUrl = (value) => /^(https?:\/\/|https?:\/[^/])/i.test(value);

const toWebPath = (value, basePath = '') => {
  if (!value) return value;
  if (isAbsoluteUrl(value)) return normalizeAbsoluteUrl(value);

  const path = collapseSlashes(value.startsWith('/') ? value : `/${value}`);
  const base = (basePath || '').trim().replace(/\/+$/, '');
  if (!base) return path;

  const normalizedBase = base.startsWith('/') ? base : `/${base}`;
  if (path === normalizedBase || path.startsWith(`${normalizedBase}/`)) return path;
  return collapseSlashes(`${normalizedBase}${path}`);
};

const toPublicUrl = (filePath, basePath = process.env.PUBLIC_BASE_PATH || '', originOverride) => {
  if (!filePath) return '';
  const origin = (originOverride || process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  const webPath = toWebPath(filePath, basePath);
  if (!origin) return webPath;
  if (isAbsoluteUrl(webPath)) return normalizeAbsoluteUrl(webPath);
  return `${origin}${webPath}`;
};

module.exports = { toWebPath, toPublicUrl, collapseSlashes };
