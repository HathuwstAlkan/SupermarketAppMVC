-- Phase 1: Add password reset fields to users table
-- Run this in MySQL Workbench after creating password_resets table

-- Add reset_required flag for admin force reset
ALTER TABLE users ADD COLUMN reset_required BOOLEAN DEFAULT FALSE;

-- Add reset token fields for additional security (optional)
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN reset_token_expires DATETIME DEFAULT NULL;

-- Verify changes
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
ORDER BY ORDINAL_POSITION;
