-- ============================================================================
-- UNIFIED SCHEMA SCRIPT - Migrations 004 through 007
-- ============================================================================
-- This script applies all pending migrations for the Supermarket MVC app
-- Run this AFTER migrations 001 and 002 have been executed
--
-- IMPORTANT: Migration 003 is SKIPPED because category and description 
-- columns already exist from the old sql_update_and_seed.sql script
--
-- Migrations included:
-- - 004: Wishlist feature
-- - 005: Notifications system
-- - 006: Order tracking fields
-- - 007: Promotions system
-- ============================================================================

USE supermarket_db;

-- ============================================================================
-- MIGRATION 004: Create wishlist table
-- Purpose: Allow users to save products to a wishlist
-- ============================================================================

CREATE TABLE IF NOT EXISTS wishlist (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- MIGRATION 005: Create notifications table
-- Purpose: System-wide notifications for users and admins
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('stock_alert', 'promotion', 'order_update', 'payment_confirm', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_item_type ENUM('product', 'order', 'promotion', 'other') DEFAULT 'other',
  related_item_id INT DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- MIGRATION 006: Add order tracking fields
-- Purpose: Enable order tracking and delivery estimates
-- ============================================================================

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS delivery_estimate DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
ADD INDEX idx_tracking (tracking_number),
ADD INDEX idx_status (order_status);

-- ============================================================================
-- MIGRATION 007: Create promotions table
-- Purpose: Discount and promotion management system
-- ============================================================================

CREATE TABLE IF NOT EXISTS promotions (
  id INT NOT NULL AUTO_INCREMENT,
  product_id INT NOT NULL,
  type ENUM('clearance', 'seasonal', 'limited', 'deals', 'bundle') NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT NULL,
  discount_amount DECIMAL(10,2) DEFAULT NULL,
  deal_description VARCHAR(255) DEFAULT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_active (is_active, end_date),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- VERIFICATION: Check if all tables were created successfully
-- ============================================================================

SELECT 'Checking wishlist table...' AS status;
SELECT COUNT(*) AS wishlist_exists FROM information_schema.tables 
WHERE table_schema = 'supermarket_db' AND table_name = 'wishlist';

SELECT 'Checking notifications table...' AS status;
SELECT COUNT(*) AS notifications_exists FROM information_schema.tables 
WHERE table_schema = 'supermarket_db' AND table_name = 'notifications';

SELECT 'Checking promotions table...' AS status;
SELECT COUNT(*) AS promotions_exists FROM information_schema.tables 
WHERE table_schema = 'supermarket_db' AND table_name = 'promotions';

SELECT 'Checking orders tracking columns...' AS status;
SELECT COUNT(*) AS tracking_column_exists FROM information_schema.columns 
WHERE table_schema = 'supermarket_db' AND table_name = 'orders' AND column_name = 'tracking_number';

SELECT '✅ All migrations applied successfully!' AS status;
SELECT 'You can now use Wishlist, Notifications, Order Tracking, and Promotions features.' AS next_steps;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================
-- To undo these migrations, run the following commands:
--
-- DROP TABLE IF EXISTS promotions;
-- ALTER TABLE orders DROP COLUMN IF EXISTS tracking_number;
-- ALTER TABLE orders DROP COLUMN IF EXISTS delivery_estimate;
-- ALTER TABLE orders DROP COLUMN IF EXISTS order_status;
-- DROP TABLE IF EXISTS notifications;
-- DROP TABLE IF EXISTS wishlist;
-- ============================================================================
