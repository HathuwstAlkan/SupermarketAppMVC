# Schema & Migration Files - Status & Cleanup Guide

## 📋 Current Status

### ✅ What's Been Done (Code Implementation)
- **Phase 1**: Authentication system fully coded (AuthController, middleware, views)
- **Phase 2**: Branding complete (new logo, all references updated)
- **Git**: Both phases committed successfully

### ⏳ What's NOT Done (Database Setup)
- **Phase 1 migrations** (001, 002): NOT RUN YET - Need to run these NOW
- **Phase A-D migrations** (003-006): NOT RUN YET - Run when implementing features

## 📁 File Organization Summary

### ✅ KEEP THESE (Active Migrations)
- `database/migrations/` - **NEW organized location for all migrations**
  - `001_create_password_resets_table.sql` - Run NOW
  - `002_add_password_reset_fields.sql` - Run NOW
  - `003_add_product_enhancements.sql` - Run before Phase A
  - `004_create_wishlist_table.sql` - Run before Phase B
  - `005_create_notifications_table.sql` - Run before Phase C
  - `006_add_order_tracking_fields.sql` - Run before Phase D
  - `README.md` - Migration guide

### 🗑️ CAN DELETE (Old/Duplicate Files)
- `workbench_schema.sql` - **DELETE** (old initial schema, already executed)
- `scripts/sql_update_and_seed.sql` - **KEEP FOR REFERENCE** (has 100 product seeds, may be useful)

### ⚠️ DEPRECATED (Moved to database/migrations/)
- `scripts/create_password_resets_table.sql` - DELETED (moved to 001)
- `scripts/add_password_reset_fields.sql` - DELETED (moved to 002)
- `scripts/add_product_enhancements.sql` - DELETED (moved to 003)
- `scripts/create_wishlist_table.sql` - DELETED (moved to 004)
- `scripts/create_notifications_table.sql` - DELETED (moved to 005)
- `scripts/add_order_tracking_fields.sql` - DELETED (moved to 006)

## 🎯 What to Do NOW

### Step 1: Run Phase 1 & 2 Migrations (REQUIRED)
Your Phase 1 & 2 code is already committed, but the database doesn't have the required tables/columns yet. Run these NOW:

```bash
# In MySQL Workbench, execute in this order:
1. database/migrations/001_create_password_resets_table.sql
2. database/migrations/002_add_password_reset_fields.sql
```

After running these, your Phase 1 & 2 features will work:
- Forgot password flow will function
- Admin force reset will function
- Password reset middleware will function

### Step 2: Clean Up Old Files (OPTIONAL)
```bash
# You can safely delete this file (already executed long ago):
rm workbench_schema.sql

# Keep sql_update_and_seed.sql for reference (has product seed data)
```

### Step 3: Future Migrations (When Implementing New Features)
When you're ready to implement Phases A-D, run migrations 003-006 **before coding**:

- **Before Phase A** (Categories): Run `003_add_product_enhancements.sql`
- **Before Phase B** (Wishlist): Run `004_create_wishlist_table.sql`
- **Before Phase C** (Notifications): Run `005_create_notifications_table.sql`
- **Before Phase D** (Tracking): Run `006_add_order_tracking_fields.sql`

## 🔍 Why the New Structure?

**OLD** (Confusing):
```
scripts/
  - create_password_resets_table.sql  ← Migration
  - add_password_reset_fields.sql      ← Migration
  - sql_update_and_seed.sql            ← Seed data
workbench_schema.sql                   ← Old initial schema
```

**NEW** (Clean):
```
database/
  migrations/
    - 001_create_password_resets_table.sql
    - 002_add_password_reset_fields.sql
    - 003_add_product_enhancements.sql
    - 004_create_wishlist_table.sql
    - 005_create_notifications_table.sql
    - 006_add_order_tracking_fields.sql
    - README.md  ← Migration guide
scripts/
  - sql_update_and_seed.sql  ← Seed data (keep for reference)
```

## 📊 Schema Changes Tracking

### Already in Database (from workbench_schema.sql executed previously):
- ✅ `users` table (basic structure)
- ✅ `products` table (basic structure)
- ✅ `orders` table
- ✅ `order_items` table
- ✅ `payments` table
- ✅ `shipping_details` table
- ✅ `cart_items` table

### Need to Add NOW (Phase 1 & 2):
- ⏳ `password_resets` table (001)
- ⏳ `users.reset_required` column (002)
- ⏳ `users.reset_token` column (002)
- ⏳ `users.reset_token_expires` column (002)

### Will Add Later (Phase A-D):
- 🔜 `products.category` column (003)
- 🔜 `products.description` column (003)
- 🔜 `products.is_perishable` column (003)
- 🔜 `wishlist` table (004)
- 🔜 `notifications` table (005)
- 🔜 `orders.estimated_delivery_time` column (006)
- 🔜 `orders.actual_delivery_time` column (006)
- 🔜 `orders.tracking_notes` column (006)

---

**Bottom Line**: 
- **Phase 1 & 2 CODE**: ✅ Complete and committed
- **Phase 1 & 2 DATABASE**: ⏳ Run migrations 001 and 002 NOW
- **Old workbench_schema.sql**: 🗑️ Can delete (already executed)
- **All migrations**: 📁 Now organized in `database/migrations/`
