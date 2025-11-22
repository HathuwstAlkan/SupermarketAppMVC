-- Migration 2: Add password reset fields to users table
-- Phase 1: Admin Force Password Reset
-- Run this SECOND (after 001)

-- Add reset_required flag
ALTER TABLE users
ADD COLUMN reset_required BOOLEAN DEFAULT FALSE AFTER role;

-- Add optional reset token fields for enhanced security
ALTER TABLE users
ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL AFTER reset_required,
ADD COLUMN reset_token_expires DATETIME DEFAULT NULL AFTER reset_token;

-- Add index for faster lookups
CREATE INDEX idx_reset_required ON users(reset_required);
