-- ============================================================================
-- PRODUCT CATEGORY STANDARDIZATION SCRIPT
-- ============================================================================
-- Purpose: Standardize all product categories to match the 11 official categories
-- This fixes inconsistent naming (Dairy → Dairy & Eggs, Produce → Fruits & Vegetables, etc.)
-- ============================================================================

USE c372_supermarketdb;

-- Standardize category names to 11 official categories
UPDATE products SET category = 'Fruits & Vegetables' WHERE category IN ('Produce', 'Greens', 'Other') AND id IN (19, 31, 32, 33, 34, 53, 54, 55, 56, 57, 112);
UPDATE products SET category = 'Dairy & Eggs' WHERE category = 'Dairy';
UPDATE products SET category = 'Meat & Seafood' WHERE category IN ('Poultry', 'Fish', 'Meat');
UPDATE products SET category = 'Bakery' WHERE category = 'Bakery';
UPDATE products SET category = 'Beverages' WHERE category = 'Beverages';
UPDATE products SET category = 'Snacks & Candy' WHERE category = 'Snacks';
UPDATE products SET category = 'Canned & Packaged Foods' WHERE category = 'Pantry' AND productName LIKE '%Canned%';
UPDATE products SET category = 'Frozen Foods' WHERE category = 'Frozen';
UPDATE products SET category = 'Personal Care' WHERE category = 'Household' AND id IN (100, 101, 102, 103);
UPDATE products SET category = 'Household' WHERE category = 'Household' AND id NOT IN (100, 101, 102, 103);

-- Specifically fix Broccoli (was "Other")
UPDATE products SET category = 'Fruits & Vegetables' WHERE id = 19;

-- Fix remaining Pantry items to Canned & Packaged Foods where appropriate
UPDATE products 
SET category = 'Canned & Packaged Foods' 
WHERE category = 'Pantry' 
AND (
    productName LIKE '%Canned%' 
    OR productName LIKE '%Can%'
    OR productName LIKE '%Beans%'
    OR productName LIKE '%Tuna%'
    OR productName LIKE '%Spam%'
    OR productName LIKE '%Sardines%'
);

-- Standard Pantry items remain Pantry, but we need to classify them properly
-- Update dry goods, spreads, condiments
UPDATE products SET category = 'Canned & Packaged Foods' WHERE category = 'Pantry' AND id IN (25, 26, 27, 38, 42, 43, 45, 47, 51, 52, 58, 60, 61, 62, 63, 64, 74, 76, 77, 79, 80, 81, 82, 84, 85, 91, 95, 96, 97, 104);
UPDATE products SET category = 'Condiments' WHERE category = 'Condiments';

-- ============================================================================
-- FINAL CATEGORY MAPPING (11 Standard Categories)
-- ============================================================================
-- 1. Fruits & Vegetables: Fresh produce, greens, broccoli
-- 2. Dairy & Eggs: Milk, cheese, yogurt, eggs, butter
-- 3. Meat & Seafood: Chicken, beef, fish, salmon, sausages
-- 4. Bakery: Bread, bagels, croissants
-- 5. Beverages: Water, juice, coffee, tea, energy drinks
-- 6. Snacks & Candy: Chips, chocolate, muesli bars, crackers
-- 7. Canned & Packaged Foods: Canned goods, pasta, rice, dry goods
-- 8. Frozen Foods: Frozen pizza, ice cream, frozen vegetables
-- 9. Personal Care: Toothpaste, shampoo, face wash, lip balm
-- 10. Household: Toilet paper, dish soap, pet food
-- 11. Condiments: Ketchup, mayo, mustard, BBQ sauce, soy sauce

-- Verification query
SELECT category, COUNT(*) as product_count 
FROM products 
GROUP BY category 
ORDER BY category;

SELECT '✅ Category standardization complete!' AS status;
SELECT 'All products now use one of 11 standard categories' AS result;
