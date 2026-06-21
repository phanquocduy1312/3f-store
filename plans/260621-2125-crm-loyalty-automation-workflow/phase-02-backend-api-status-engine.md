# Phase 02: Backend API Status Engine & Validation

## Context Links
- [Order.php model](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Order.php)
- [OrderController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/OrderController.php)

## Overview
- Priority: High
- Status: Pending
- Description: Refactor backend order state transition checks to query database configurations, ensure loyalty point credit safety, and record CRM activities.

## Key Insights
- Transitions should be validated dynamically based on `workflow_transitions` instead of hardcoded maps.
- Loyalty point transactions must prevent duplicate credits by checking if a transaction with the same order reference exists.

## Requirements
- Support independent updates for order, payment, shipping, and loyalty statuses.
- Validate next statuses dynamically.
- Write activities to `customer_activity_logs`.
- Ensure idempotency in point transactions.

## Architecture
- Refactored `updateOrderStatus()`, `updatePaymentStatus()`, `updateShippingStatus()`, `updateLoyaltyStatus()`.

## Related Code Files
- `3f-api/app/Models/Order.php` (Modify)
- `3f-api/app/Controllers/OrderController.php` (Modify)

## Implementation Steps
1. Add dynamic status transition check logic:
   - Check if `from_status` -> `to_status` exists and is active in `workflow_transitions` for that `group_key`.
   - Prevent terminal status updates unless overriding permission is present.
2. Refactor status log writing to support `group_key`, `changed_by_admin_id`, `changed_by_customer_id`, and `metadata`.
3. Refactor Loyalty point credit logic:
   - Calculate points but only credit when status becomes `credited`.
   - Implement reversal/cancellation in points transactions if status becomes `cancelled` or `reversed`.
   - Enforce database constraint / unique query check for idempotency.
4. Implement `customer_activity_logs` logging helper and trigger it on order creation and all status changes.

## Todo List
- [ ] Refactor status transitions in `Order.php`
- [ ] Add `updateShippingStatus` and `updateLoyaltyStatus` in model & controller
- [ ] Refactor status logger inside `Order.php`
- [ ] Add Loyalty points transactional checks & reversals
- [ ] Implement CRM timeline activity logger

## Success Criteria
- Independent status changes are validated dynamically.
- Loyalty points are awarded exactly once per order.
- Activity logs show complete order timelines.

## Risk Assessment
- Direct SQL errors or deadlock on concurrent status requests. Mitigate using transactions and locks (`FOR UPDATE`).

## Security Considerations
- Admin permission verification before allowing updates.

## Next Steps
- Expose settings management APIs in Phase 3.
