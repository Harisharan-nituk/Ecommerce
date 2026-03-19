const ip = require('ip');
const geoip = require('geoip-lite');

/**
 * Get client IP address from request
 */
function getClientIP(req) {
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
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
}

/**
 * Check if IP is in CIDR range
 */
function isIPInRange(ipAddress, cidr) {
  try {
    return ip.cidrSubnet(cidr).contains(ipAddress);
  } catch (error) {
    return false;
  }
}

/**
 * Check if IP is in allowed list
 */
function isIPAllowed(ipAddress, allowedIPs) {
  if (!allowedIPs || allowedIPs.length === 0) {
    return true; // No restrictions
  }
  
  for (const allowed of allowedIPs) {
    // Check exact match
    if (allowed === ipAddress) {
      return true;
    }
    
    // Check CIDR range
    if (allowed.includes('/') && isIPInRange(ipAddress, allowed)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if IP is blocked
 */
function isIPBlocked(ipAddress, blockedIPs) {
  if (!blockedIPs || blockedIPs.length === 0) {
    return false; // No blocks
  }
  
  for (const blocked of blockedIPs) {
    // Check exact match
    if (blocked === ipAddress) {
      return true;
    }
    
    // Check CIDR range
    if (blocked.includes('/') && isIPInRange(ipAddress, blocked)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get IP geolocation info
 */
function getIPInfo(ipAddress) {
  try {
    const geo = geoip.lookup(ipAddress);
    return {
      country: geo?.country || 'Unknown',
      region: geo?.region || 'Unknown',
      city: geo?.city || 'Unknown',
      timezone: geo?.timezone || 'Unknown',
      coordinates: geo?.ll || [0, 0]
    };
  } catch (error) {
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'Unknown',
      coordinates: [0, 0]
    };
  }
}

/**
 * Validate IP address format
 */
function isValidIP(ipAddress) {
  return ip.isV4Format(ipAddress) || ip.isV6Format(ipAddress);
}

module.exports = {
  getClientIP,
  isIPAllowed,
  isIPBlocked,
  isIPInRange,
  getIPInfo,
  isValidIP
};

