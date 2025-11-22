# Migration Status & Execution Guide

## ✅ Completed Migrations

| Migration | Status | Description | Notes |
|-----------|--------|-------------|-------|
| 001 | ✅ **RUN** | Password resets table | Executed manually in MySQL Workbench |
| 002 | ✅ **RUN** | Users reset fields | Executed manually in MySQL Workbench |

## ⏭️ Skipped Migration

| Migration | Status | Reason |
|-----------|--------|--------|
| 003 | ⏭️ **SKIP** | Columns `category` and `description` already exist from old `sql_update_and_seed.sql`. Running this would cause "Duplicate column" error. |

## ⏳ Pending Migrations (Use Unified Script)

Instead of running migrations 004-007 individually, use the **unified schema script**:

```sql
database/migrations/UNIFIED_SCHEMA_004_to_007.sql
```

This single script includes:

| Migration | Feature | Tables/Columns Created |
|-----------|---------|----------------------|
| 004 | Wishlist | `wishlist` table |
| 005 | Notifications | `notifications` table |
| 006 | Order Tracking | `orders.tracking_number`, `orders.delivery_estimate`, `orders.order_status` |
| 007 | Promotions | `promotions` table |

## 🚀 How to Run

### Option 1: MySQL Workbench (Recommended)
1. Open MySQL Workbench
2. Connect to your `supermarket_db` database
3. Open `UNIFIED_SCHEMA_004_to_007.sql`
4. Click Execute (⚡ button)
5. Check output for verification messages

### Option 2: Command Line
```bash
mysql -u root -p supermarket_db < database/migrations/UNIFIED_SCHEMA_004_to_007.sql
```

## ✅ Verification

The script includes automatic verification. After running, you should see:
- ✅ wishlist_exists: 1
- ✅ notifications_exists: 1
- ✅ promotions_exists: 1
- ✅ tracking_column_exists: 1

## 🔄 Rollback (If Needed)

If you need to undo these migrations, run:
```sql
DROP TABLE IF EXISTS promotions;
ALTER TABLE orders DROP COLUMN IF EXISTS tracking_number;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_estimate;
ALTER TABLE orders DROP COLUMN IF EXISTS order_status;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS wishlist;
```

## 📋 Migration Dependencies

- **004 (Wishlist)**: Requires `users` and `products` tables ✅
- **005 (Notifications)**: Requires `users` table ✅
- **006 (Order Tracking)**: Requires `orders` table ✅
- **007 (Promotions)**: Requires `users` and `products` tables ✅

All dependencies are satisfied!

## 🎯 When to Run

Run the unified script **before** using these features:
- **Wishlist**: Add products to wishlist, stock notifications
- **Notifications**: Admin alerts, stock updates, order notifications
- **Order Tracking**: Track deliveries, estimate delivery dates
- **Promotions**: Create clearance sales, seasonal deals, bundle offers

## 📝 Notes

- Uses `IF NOT EXISTS` and `IF EXISTS` clauses for safety
- Can be run multiple times without errors
- Includes foreign key constraints for data integrity
- Proper indexing for performance
- Rollback script included for easy reversal
