# Phase 02: Verification & Loyalty Engine QA

## Context Links
- [LoyaltyProductionModel.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/LoyaltyProductionModel.php)
- [OrderController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/OrderController.php)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Verify the phone verification flows, formula calculations, point rules, and ledger safety mechanisms.

## Requirements
- Customer phone verification flow must successfully persist and hide warnings on the dashboard.
- Verify point formula parameters (Website x1.5, Shopee x1.0, exclude shipping, discount deductions).
- Enforce idempotency check on point ledger to prevent double-crediting/reversals on duplicate events.

## Related Code Files
- `3f-api/app/Models/Order.php`
- `3f-api/app/Models/LoyaltyProductionModel.php`

## Implementation Steps
1. Review point calculation formulas in `LoyaltyProductionModel` or `Order` model.
2. Confirm the presence of unique constraint or transaction check on `loyalty_point_transactions`.
3. Create a temporary QA test script to run full calculations and assert correctness.

## Todo List
- [ ] Verify point multipliers stacking rules.
- [ ] Confirm shipping fee exclusion logic.
- [ ] Ensure idempotency check in point transaction ledger saves.

## Success Criteria
- Test transactions return correct point awards.
- Double events are blocked by DB or Model constraints.
