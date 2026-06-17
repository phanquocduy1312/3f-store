# Phase 1: Fix Shopee Admin UI Logic

## Context Links
- Related Report: [debugger-260615-1600-fix-shopee-admin-logic.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/debugger-260615-1600-fix-shopee-admin-logic.md)

## Overview
- Priority: High
- Current Status: In-Progress
- Brief Description: Fix broken JSX rendering, conditional display of approve/reject actions, alert boxes for price mismatch, and align statistics cards with the dashboard tabs.

## Requirements
- Fix compilation issues in `ShopeeRequestDetailModal.tsx`.
- Hide approve/reject action buttons for approved/rejected requests.
- Add browser confirmation warning when approving requests whose API verification status is not valid.
- Display warning alerts if price mismatch exists, including calculation of difference.
- Standardize all dashboard statistic cards and tab counts to use request `createdAt` filtering.

## Related Code Files
- [ShopeeRequestsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ShopeeRequestsPage.tsx)
- [ShopeeRequestDetailModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/ShopeeRequestDetailModal.tsx)
- [ShopeeRequestTable.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/ShopeeRequestTable.tsx)

## Implementation Steps
1. Modify `ShopeeRequestDetailModal.tsx`:
   - Fix missing `)}` for `isDuplicate`.
   - Restore footer button layout.
   - Wrap footer buttons to render only when `processingStatus === "pending"`.
   - Update `footerMessage` text content.
   - Insert confirm alert before calling `onApprove` if verification status is not valid.
   - Calculate amount difference and format warnings when there's an order price mismatch.
2. Modify `ShopeeRequestTable.tsx`:
   - Append "Đã duyệt thủ công" warning badge next to status if request is approved manually.
3. Modify `ShopeeRequestsPage.tsx`:
   - Update stats counts hook to align cards with the active tabs.
   - Update "Cần kiểm tra" count arrays for stats and tabs filter.

## Success Criteria
- Code compiles without TypeScript errors.
- Tab and statistics cards match exactly for counts.
- Reconciled mismatch requests show appropriate warn text and difference.
