# Phase 02: Admin Panel Hint and Safety Check

## Context Links
- [AdminVouchersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminVouchersPage.tsx)
- [Coupon.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Coupon.php)

## Overview
- **Priority**: Medium
- **Current Status**: In Progress
- **Description**: Add warning hints inside the admin panel voucher form to inform the admin that enabling the AI Advisor voucher will automatically disable any previously configured AI Advisor voucher, ensuring the single-active-voucher rule is clear.

## Requirements
- Add a text note or warning under the "Tư vấn AI" toggle inside the Create/Edit Voucher modal in `AdminVouchersPage.tsx`.
- Double-check that saving/updating correctly updates the state in the list view.

## Related Code Files
- [MODIFY] [AdminVouchersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminVouchersPage.tsx)

## Implementation Steps
1. Edit the toggle rendering for "Tư vấn AI" in `AdminVouchersPage.tsx`.
2. Add a description text below or near it so the admin knows of the single-active-voucher behavior.
3. Validate by saving a coupon with the AI toggle.

## Todo List
- [ ] Add warning text under the toggle in the form of `AdminVouchersPage.tsx`
- [ ] Confirm backend behavior clears the others on save

## Success Criteria
- Toggle displays a clear note explaining the single active voucher rule.

## Risk Assessment
- None.
