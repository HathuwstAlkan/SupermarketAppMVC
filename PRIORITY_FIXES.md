# CRITICAL BUGFIXES & PRIORITIES - IMMEDIATE ACTION LIST

## 🔴 HIGH PRIORITY - BROKEN FEATURES (Fix FIRST)

### 1. Migration 003 Fails - Duplicate Column
**Issue**: `category` column already exists from old sql_update_and_seed.sql
**Fix**: Skip migration 003 entirely - columns already exist
**Action**: Document that migration 003 not needed

### 2. View Product Detail Modal Not Working
**Issue**: Eye icon/product click doesn't open modal
**Current**: Eye icon exists but doesn't trigger anything
**Fix**: Make entire product card clickable, open modal with product details
**Files**: `views/shopping.ejs`, add modal markup + JavaScript

### 3. Products Not Categorized
**Issue**: Products have no categories assigned (all "Uncategorized")
**Fix**: Create script to auto-categorize products based on product names
**Files**: Create `scripts/categorize_existing_products.js`

### 4. Add to Cart from Modal
**Issue**: Can't add to cart from product detail modal
**Fix**: Add quantity selector + "Add to Cart" button in modal
**Files**: `views/shopping.ejs` modal, `CartController.js`

### 5. Wishlist Button (Out of Stock)
**Issue**: No wishlist functionality when product quantity = 0
**Fix**: Show "Add to Wishlist" button when out of stock
**Requires**: Migration 004 (wishlist table)

## 🟡 MEDIUM PRIORITY - UI INCONSISTENCIES

### 6. Image Fallbacks Missing
**Issue**: Broken images show as broken icons
**Fix**: Add `onerror` handlers across all product images
**Files**: `shopping.ejs`, `product.ejs`, `inventory.ejs`, `cart.ejs`

### 7. Stock Level Indicators
**Issue**: No visual indication of stock levels in inventory
**Fix**: Color-code stock levels (Red=0%, Yellow<25%, Green>50%)
**Files**: `inventory.ejs`, add CSS classes

### 8. Inventory Page Messy
**Issue**: No filters, no sorting, hard to navigate
**Fix**: Add category filter dropdown, sort options, search
**Files**: `inventory.ejs`, `ProductController.js`

### 9. Add Product Form Missing Fields
**Issue**: Can't select category, no description field
**Fix**: Add category dropdown, description textarea
**Files**: `addProduct.ejs`, `ProductController.js`

## 🟢 LOWER PRIORITY - ENHANCEMENTS

### 10. Admin Notifications for Zero Stock
**Issue**: Admin doesn't know when products go out of stock
**Fix**: Create notification system for 0% stock
**Requires**: Migration 005 (notifications table)

### 11. Responsive Navbar
**Issue**: Navbar not mobile-friendly
**Fix**: Ensure Bootstrap collapse works properly
**Files**: `navbar.ejs`

### 12. Promotion System
**Issue**: No way to create discounts/deals
**Fix**: Implement full promotion system
**Requires**: Migration 007 (promotions table)

---

## 📝 EXECUTION PLAN (Sequential, with commits)

**Phase 1: Critical Fixes** (Commit immediately after each)
1. ✅ Skip migration 003 - document why
2. Fix product detail modal - make cards clickable
3. Add to cart from modal
4. Image fallbacks everywhere
5. COMMIT: "Critical bugfixes: modal, cart, images"

**Phase 2: Product Management** (Commit after)
6. Categorize existing products script
7. Stock indicators (colors)
8. Add product form fields (category, description)
9. COMMIT: "Product management improvements"

**Phase 3: Inventory** (Commit after)
10. Inventory filters (category, sort, search)
11. Inventory UI cleanup
12. COMMIT: "Inventory overhaul"

**Phase 4: Wishlist** (Run migration 004 first)
13. Wishlist button when out of stock
14. Wishlist page
15. COMMIT: "Wishlist feature"

**Phase 5: Notifications** (Run migration 005 first)
16. Admin stock alerts
17. COMMIT: "Stock notifications"

**Phase 6: Promotions** (Run migration 007 first)
18. Promotion management
19. COMMIT: "Promotion system"

---

## 🗄️ MIGRATION STATUS

| Migration | Status | Notes |
|-----------|--------|-------|
| 001 | ✅ Run | password_resets table created |
| 002 | ✅ Run | users reset fields added |
| 003 | ⏭️ SKIP | Columns already exist from old sql_update_and_seed.sql |
| 004 | ⏳ Pending | Run before Phase 4 (Wishlist) |
| 005 | ⏳ Pending | Run before Phase 5 (Notifications) |
| 006 | ⏳ Pending | Run before Order Tracking feature |
| 007 | ⏳ Pending | Run before Phase 6 (Promotions) |
