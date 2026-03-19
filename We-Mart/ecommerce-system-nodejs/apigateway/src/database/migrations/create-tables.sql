-- API Gateway Database Schema

-- Route Configuration Table
CREATE TABLE IF NOT EXISTS route_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(255) NOT NULL UNIQUE,
  method VARCHAR(10) NOT NULL DEFAULT 'ALL',
  target_service VARCHAR(100) NOT NULL,
  target_url VARCHAR(500) NOT NULL,
  requires_auth BOOLEAN DEFAULT TRUE,
  rate_limit_max INT DEFAULT 100,
  rate_limit_window INT DEFAULT 900000,
  enabled BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_path_method (path, method),
  INDEX idx_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Allowed Domains Table
CREATE TABLE IF NOT EXISTS allowed_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- IP Whitelist Table
CREATE TABLE IF NOT EXISTS ip_whitelist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ip_address (ip_address),
  INDEX idx_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- IP Blacklist Table
CREATE TABLE IF NOT EXISTS ip_blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  reason TEXT,
  blocked_until DATETIME NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ip_address (ip_address),
  INDEX idx_enabled_blocked (enabled, blocked_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Rate Limits Table
CREATE TABLE IF NOT EXISTS rate_limits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  route VARCHAR(255) NOT NULL,
  count INT DEFAULT 1,
  window_start DATETIME NOT NULL,
  window_end DATETIME NOT NULL,
  blocked BOOLEAN DEFAULT FALSE,
  blocked_until DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_identifier_route_window (identifier, route, window_start),
  INDEX idx_identifier (identifier),
  INDEX idx_window_end (window_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- API Logs Table
CREATE TABLE IF NOT EXISTS api_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id VARCHAR(100) NOT NULL,
  method VARCHAR(10) NOT NULL,
  path VARCHAR(500) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  user_id INT NULL,
  status_code INT,
  response_time INT,
  request_body TEXT,
  response_body TEXT,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_request_id (request_id),
  INDEX idx_ip_address (ip_address),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_status_code (status_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default route
INSERT INTO route_configs (path, method, target_service, target_url, requires_auth, rate_limit_max, rate_limit_window, enabled, description)
VALUES ('/api/v1/*', 'ALL', 'ecommerce', 'http://localhost:3000/api/v1', TRUE, 100, 900000, TRUE, 'Default e-commerce API route')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

