/**
 * IP Utilities for Node.js E-Commerce System
 * Extract client IP from request (handles proxies, load balancers, CDNs)
 */

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  if (!req) {
    return '0.0.0.0';
  }

  // Check various headers for real IP (behind proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip'];
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to connection remote address
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '0.0.0.0';
}

/**
 * Get user agent from request
 */
function getUserAgent(req) {
  if (!req) {
    return null;
  }
  return req.headers['user-agent'] || null;
}

/**
 * Validate IP address format
 */
function isValidIP(ip) {
  if (!ip) return false;
  
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 regex (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

module.exports = {
  getClientIP,
  getUserAgent,
  isValidIP
};

