-- Migration 5: Create notifications system
-- Phase C: User Notifications
-- Run this FIFTH

CREATE TABLE IF NOT EXISTS notifications (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM(
    'stock_alert',        -- Product back in stock
    'promo',              -- New promotion/deal
    'order_placed',       -- Order confirmation
    'order_shipped',      -- Order shipped
    'order_delivered',    -- Order delivered
    'payment_received',   -- Payment confirmed
    'general'             -- General announcements
  ) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_order_id INT DEFAULT NULL,
  related_product_id INT DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (related_product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
