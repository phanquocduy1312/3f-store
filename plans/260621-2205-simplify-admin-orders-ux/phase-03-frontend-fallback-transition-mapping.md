# Phase 03: Frontend Fallback Transition Mapping

## Overview
- **Priority**: High
- **Status**: pending
- **Description**: Add hardcoded static transition maps and retrievers in the frontend page to serve as fallback controls when the dynamic backend configurations API is empty or slow.

## Related Code Files
- [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx)

## Implementation Steps
1. Insert `defaultOrderTransitions`, `defaultPaymentTransitions`, `defaultShippingTransitions`, and `defaultLoyaltyTransitions` mapping structures.
2. Implement a `getTransitionsForGroup` helper function that checks backend dynamic settings and falls back to frontend maps if backend dynamic list is empty.

## Success Criteria
- Falls back gracefully to static rules if dynamic configuration is empty, allowing orders to always progress.
