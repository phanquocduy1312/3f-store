# Researcher Report: Database & Workflow Design
Date: 260621
Time: 2125

## 1. Schema Alterations & Migrations

### orders table:
Modify/Add:
- `order_status` VARCHAR(100)
- `payment_status` VARCHAR(100)
- `shipping_status` VARCHAR(100) DEFAULT 'no_shipment'
- `loyalty_status` VARCHAR(100) DEFAULT 'not_earned'
- `order_source` VARCHAR(50) NULL (website, zalo, facebook, telesale, shopee, tiktok, other)
- `assigned_staff_id` INT NULL
- `internal_note` TEXT NULL
- `customer_note` TEXT NULL
- `cancelled_reason` VARCHAR(255) NULL
- `returned_reason` VARCHAR(255) NULL
- `completed_at` TIMESTAMP NULL
- `cancelled_at` TIMESTAMP NULL

### Configurable Workflow Tables:
- `workflow_statuses`: Stores `group_key` (order, payment, shipping, loyalty), `status_key`, `label`, `color`, `sort_order`, `is_active`, `is_default`, `is_terminal`.
- `workflow_transitions`: Validates state machine changes via `from_status` -> `to_status` for each `group_key`.
- `order_status_logs`: Add `group_key`, `changed_by_admin_id`, `changed_by_customer_id`, `metadata` JSON.

### CRM & Configuration Tables:
- `customer_activity_logs`: Standardized CRM event timeline.
- `automation_rules`: Rule triggers based on status changes.
- `notification_channels`: Configurable communication keys (email, sms, zalo, internal).
- `shipping_providers`: Logistical providers (manual/3rd party configs).

## 2. Loyalty Point Safety
- Credits points only once when `loyalty_status` transitions to `credited` (normally triggered upon order completion or admin manual approval).
- Point transactions are mapped to `order_id` in `customer_point_transactions` via a unique constraint on `(customer_phone, type, reference_type, reference_id)`.
- If order is cancelled/returned, `loyalty_status` changes to `cancelled` and previously earned points are debited/reversed.

## 3. Backward Compatibility
- Migration maps old orders:
  - pending -> pending_confirmation
  - confirmed -> confirmed
  - packing -> preparing
  - shipping -> shipping
  - completed -> completed
  - cancelled -> cancelled
- Seed initial data matching the required status lists.
- Maintain fallback support on customer-facing frontend maps for both old and new status values.
