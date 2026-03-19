const geoip = require('geoip-lite');

/**
 * Get client IP address from request
 */
const getClientIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    '0.0.0.0'
  );
};

/**
 * Get IP information (country, city)
 */
const getIPInfo = (ip) => {
  try {
    const geo = geoip.lookup(ip);
    return {
      ip,
      country: geo?.country || 'Unknown',
      city: geo?.city || 'Unknown',
      region: geo?.region || 'Unknown',
    };
  } catch (error) {
    return {
      ip,
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
    };
  }
};

module.exports = {
  getClientIP,
  getIPInfo,
};

