-- Migration 7: Create promotions table for discount/deal management
-- Run this after migrations 001-006

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
