# Database Migrations Guide

## Overview
This directory contains all database schema migrations for Supermarket MVC. Migrations are numbered and should be run **in order**.

## Migration Execution Order

### ✅ Phase 1 & 2 (Authentication & Branding) - **RUN THESE NOW**
These migrations support the password reset features already implemented in code:

1. **001_create_password_resets_table.sql**
   - Creates `password_resets` table for OTP storage
   - Used by forgot password flow
   
2. **002_add_password_reset_fields.sql**
   - Adds `reset_required`, `reset_token`, `reset_token_expires` to `users` table
   - Used by admin force password reset feature

### 🔜 Phase A-D (Enhanced Shopping Features) - **RUN WHEN IMPLEMENTING**
These migrations support new features (not yet implemented in code):

3. **003_add_product_enhancements.sql**
   - Adds `category`, `description`, `is_perishable` to `products` table
   - Required before implementing product categorization

4. **004_create_wishlist_table.sql**
   - Creates `wishlist` table
   - Required before implementing wishlist feature

5. **005_create_notifications_table.sql**
   - Creates `notifications` table
   - Required before implementing notifications system

6. **006_add_order_tracking_fields.sql**
   - Adds `estimated_delivery_time`, `actual_delivery_time`, `tracking_notes` to `orders`
   - Required before implementing order tracking

## How to Run Migrations

### In MySQL Workbench:
1. Open MySQL Workbench
2. Connect to your database
3. Open the migration file (File → Open SQL Script)
4. Click the lightning bolt icon to execute
5. Repeat for each migration in order

### Via Command Line:
```bash
mysql -u your_username -p your_database < database/migrations/001_create_password_resets_table.sql
```

## Current Status

| Migration | Phase | Status | Notes |
|-----------|-------|--------|-------|
| 001 | Phase 1 | ⏳ Pending | Run this now (password reset OTP) |
| 002 | Phase 1 | ⏳ Pending | Run this now (force reset flag) |
| 003 | Phase A | ⏳ Pending | Run before implementing categories |
| 004 | Phase B | ⏳ Pending | Run before implementing wishlist |
| 005 | Phase C | ⏳ Pending | Run before implementing notifications |
| 006 | Phase D | ⏳ Pending | Run before implementing tracking |

## Rollback Instructions

If you need to undo migrations, run these DROP/ALTER statements **in reverse order**:

```sql
-- Rollback 006
ALTER TABLE orders DROP COLUMN tracking_notes, DROP COLUMN actual_delivery_time, DROP COLUMN estimated_delivery_time;

-- Rollback 005
DROP TABLE IF EXISTS notifications;

-- Rollback 004
DROP TABLE IF EXISTS wishlist;

-- Rollback 003
ALTER TABLE products DROP COLUMN is_perishable, DROP COLUMN description, DROP COLUMN category;

-- Rollback 002
ALTER TABLE users DROP INDEX idx_reset_required;
ALTER TABLE users DROP COLUMN reset_token_expires, DROP COLUMN reset_token, DROP COLUMN reset_required;

-- Rollback 001
DROP TABLE IF EXISTS password_resets;
```

## Important Notes

1. **Always backup your database** before running migrations
2. Migrations 001-002 are needed for existing Phase 1 & 2 code to work
3. Migrations 003-006 should be run when you start implementing Phases A-D
4. Do NOT skip migrations or run them out of order
5. Some migrations modify existing tables - be careful with production data

## Schema Changes Summary

### Tables Created:
- `password_resets` (001)
- `wishlist` (004)
- `notifications` (005)

### Tables Modified:
- `users`: Added reset fields (002)
- `products`: Added category, description, is_perishable (003)
- `orders`: Added delivery tracking fields (006)
