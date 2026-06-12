# Scout Report - Edit Shopee Point Form

This report details the files and code structures involved in modifying the "Tích điểm từ đơn Shopee" form on the 3F Club section.

## Identified Target Files

1. [components/threeFclup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/threeFclup.tsx): Holds the main component `ThreeFClub` where the Shopee point request form is rendered.
2. [lib/shopee-requests.ts](file:///c:/Users/Admin/Downloads/ccc/lib/shopee-requests.ts): Defines types, storage keys, and helpers (`loadShopeeRequests`, `persistShopeeRequests`, `computeExpectedPoints`) to manage Shopee point requests in `localStorage`.
3. [types/shopee.ts](file:///c:/Users/Admin/Downloads/ccc/types/shopee.ts): Defines the TypeScript interfaces for `ShopeePointRequest`.

## Current Implementation & Issues

- Currently, SĐT, Email, Shopee Order Code, and Order Amount input fields inside `ThreeFClub` do not have state bindings (i.e. `value` and `onChange` properties are missing for SĐT and Email, and there's no overall submission state or validation logic).
- The submit button "Gửi đơn Shopee để tích điểm" is just a button and does not call any submission function.
- We need to introduce:
  - State bindings for Phone (`phone`), Email (`email`), Shopee Order Code (`orderCode`), Order Amount (`amount`), and Order Image (`orderImageUrl`).
  - Validation state/logic:
    - SĐT: Required, 9-11 digits.
    - Mã đơn Shopee: Required.
    - Tổng tiền đơn: Required, number > 0.
    - Email: Optional, format validated if entered.
    - Image: Optional, helper text added, warning check if empty.
  - Success message dialog / inline notification.
