const { Owner, MediaAsset } = require('../models');

/**
 * Middleware to resolve the tenant (Owner) based on the requesting domain.
 * This looks at the `Origin`, `Referer`, or `X-Forwarded-Host` headers.
 */
module.exports = async (req, res, next) => {
  try {
    // 1. Determine the domain
    // In production, the frontend will be served from a specific domain.
    // The API might be on api.nmacademia.com, so we look at Origin or a custom header.
    let host = req.headers['x-tenant-domain'] || req.headers.origin || req.headers.host;
    
    // Strip http:// or https:// and ports if present
    if (host) {
      host = host.replace(/^https?:\/\//, '').split(':')[0];
    }

    // 2. Find the owner matching the domain
    // If no host is found, or we are in dev, we might fallback to a default owner.
    let owner = null;
    
    if (host) {
      owner = await Owner.findOne({ 
        where: { domainName: host },
        include: [{ model: MediaAsset, as: 'photo' }]
      });
    }

    // Fallback for development / missing domains (grab the first owner)
    if (!owner) {
      owner = await Owner.findOne({
        include: [{ model: MediaAsset, as: 'photo' }]
      });
    }

    if (!owner) {
      return res.status(404).json({ message: 'Tenant not found. Please run the setup seed.' });
    }

    // 3. Attach to request
    req.owner = owner;
    next();
  } catch (err) {
    console.error('Tenant resolution error:', err);
    res.status(500).json({ message: 'Internal server error resolving tenant.' });
  }
};
