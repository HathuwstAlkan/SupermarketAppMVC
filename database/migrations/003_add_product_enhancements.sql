-- Migration 3: Add product categorization and descriptions
-- Phase A: Product Enhancements
-- Run this THIRD (after completing Phase 1 migrations)

-- FIXED: MySQL doesn't support IF NOT EXISTS in ALTER TABLE for columns
-- Check if columns exist before running, or use this method:

-- Add category column
ALTER TABLE products
ADD COLUMN category ENUM(
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Bakery',
  'Beverages',
  'Snacks & Candy',
  'Canned & Packaged Foods',
  'Frozen Foods',
  'Personal Care',
  'Household',
  'Other'
) DEFAULT 'Other' AFTER price;

-- Add description column
ALTER TABLE products
ADD COLUMN description TEXT AFTER category;

-- Add perishable flag for delivery time calculation
ALTER TABLE products
ADD COLUMN is_perishable BOOLEAN DEFAULT FALSE AFTER description;

-- Update existing products with sensible defaults
-- (Run these only after manually categorizing your products)
-- UPDATE products SET is_perishable = TRUE WHERE category IN ('Fruits &  Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 'Frozen Foods');
-- UPDATE products SET is_perishable = FALSE WHERE category NOT IN ('Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 'Frozen Foods');
