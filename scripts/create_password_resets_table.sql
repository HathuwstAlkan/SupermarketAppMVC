-- Migration: Add password_resets table for OTP persistence
-- This replaces the in-memory otpStore in AdminController.js
-- Run this in MySQL Workbench to create the table

CREATE TABLE IF NOT EXISTS password_resets (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  otp CHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email_otp (email, otp),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Auto-cleanup of expired OTPs (optional event - requires EVENT scheduler enabled)
-- To enable: SET GLOBAL event_scheduler = ON;
DELIMITER $$
CREATE EVENT IF NOT EXISTS cleanup_expired_otps
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
  DELETE FROM password_resets WHERE expires_at < NOW() OR used = TRUE AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
END$$
DELIMITER ;
