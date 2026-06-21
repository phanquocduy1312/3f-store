# Production Rollout & Verification Report: CRM/Loyalty/Automation Workflow

- **Date**: 2026-06-21
- **Time**: 21:48
- **Task Slug**: production-rollout-crm-loyalty-workflow
- **Status**: **PRODUCTION VERIFIED**

---

## 1. Production Database Backup
- **Backup File Created**: `storage/backups/db_backup_20260621_144645_9108.sql`
- **Location**: Non-public `/storage/backups/` directory on Plesk.
- **Backup Size**: 2.3 MB
- **Tables Backed Up**: All 63 existing and new database tables, including `orders`, `order_status_logs`, `customer_point_transactions`, etc.
- **Status**: **CONFIRMED**

---

## 2. Deployment Results
- **Backend Deployment**: Completed successfully. Synced local changes in PHP MVC codebase using `deploy_ftp.py` via FTP.
- **Frontend Deployment**: Completed successfully. Staged, committed, and pushed refactored API imports and fixes to the `dev` branch on GitHub, triggering the production Vercel deployment pipeline.
- **Temporary Scripts Cleanup**: Security verified. Hitted and executed the backup script, then successfully deleted `db_backup.php` and `test_workflows_qa.php` from the remote Plesk server.
- **Status**: **SUCCESS**

---

## 3. Database Migration Verification
- **Expected Columns on Production `orders` Table**: Verified presence of:
  - `order_status`, `payment_status`, `shipping_status`, `loyalty_status`, `order_source`, `assigned_staff_id`, `internal_note`, `customer_note`, `cancelled_reason`, `returned_reason`, `completed_at`, `cancelled_at`.
- **Workflow Tables**: Confirmed existence of:
  - `workflow_statuses`, `workflow_transitions`, `automation_rules`, `customer_activity_logs`, `notification_channels`, `shipping_providers`.
- **Seeded Configs**: Both workflow statuses and transition rules are successfully seeded on the production database.
- **Idempotency**: Verified migration scripts rerun smoothly on Plesk without duplicate errors or data pollution.
- **Status**: **SUCCESS**

---

## 4. Existing Order Compatibility & Customer Pages
- **Admin Orders Listing**: Existing production orders load successfully.
- **Status Mapping**: Legacy statuses (`pending`, `confirmed`, `packing`, `shipping`, `completed`, `cancelled`) automatically mapped to the appropriate workflow keys:
  - `pending` -> `pending_confirmation`
  - `confirmed` -> `confirmed`
  - `packing` -> `preparing`
  - `shipping` -> `shipping`
  - `completed` -> `completed`
  - `cancelled` -> `cancelled`
- **Client Order Page**: The user's order history page loads successfully. Badges show friendly, correct localized labels (e.g. `Chờ xác nhận`, `Đang chuẩn bị`, `Hoàn tất`) and no blank/fallback statuses are rendered.
- **Status**: **SUCCESS**

---

## 5. Admin Order Details & Status State Updates
- **Decoupled Status Panels**: Shows four independent status selectors in the details drawer:
  1. Trạng thái đơn hàng (Order status)
  2. Trạng thái thanh toán (Payment status)
  3. Trạng thái vận chuyển (Shipping status)
  4. Trạng thái tích điểm (Loyalty status)
- **Independent Updates**: Changing shipping/payment states does not affect or corrupt the main order status.
- **Invalid Transitions**: Transitions that deviate from configured dynamic paths are rejected.
- **Timeline Logs**: Written successfully to `order_status_logs` and CRM `customer_activity_logs`.
- **Status**: **SUCCESS**

---

## 6. Loyalty Point Safety
- **Single Credit Constraint**: Testing with a completed order credits points exactly once. Subsequent completion requests are ignored.
- **Reversal Safety**: Order cancellation or return triggers single `cancel_web_order` transaction to reverse points, leaving no duplicate reversals or balance loopholes.
- **Status**: **SUCCESS**

---

## 7. Workflow Settings Verification
- **Route `/admin/settings/workflows`**: Loads workflow configurations, rules, and settings sections.
- **Protected Keys**: Renaming or deleting system core keys (`completed`, `cancelled`, `paid`, `refunded`, `credited`) is blocked.
- **Sort/Colors/Labels**: Verified functional CRUD operations for all status/transition records.
- **Status**: **SUCCESS**

---

## 8. Customer-Facing Pages
- **List, Detail, and Tracking Pages**: Load smoothly. Display customer-friendly labels mapping backend status keys to simple tags like `Đang giao` or `Giao thành công`, hiding complex CRM internal states.
- **Status**: **SUCCESS**

---

## 9. Server Logs & Console Checks
- **PHP Logs**: No fatal errors or database warnings.
- **Console Logs**: Admin orders and workflow settings pages load without Javascript runtime or API call failures.
- **Status**: **SUCCESS**

---

## 10. Rollout Recommendation
**Final Status**: **PRODUCTION VERIFIED**. No rollback required. The feature is completely stable, secure, and production-ready.
