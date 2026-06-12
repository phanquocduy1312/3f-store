# Scout Report - Shopee Manual Request Modal

Scouted the files related to the Shopee requests page in the admin dashboard.

## Key Files Located

1. **Page**: [ShopeeRequestsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ShopeeRequestsPage.tsx)
   - Handles page layout, table view, filter logic, and states (requests list, active tab, dates).
   - "Tạo yêu cầu thủ công" button is at line 417-424.
2. **Components**:
   - [components/admin/shopee/](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/) contains related components. We should add [ShopeeManualRequestModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/ShopeeManualRequestModal.tsx) here.
3. **Types**: [types/shopee.ts](file:///c:/Users/Admin/Downloads/ccc/types/shopee.ts)
   - Contains `ShopeePointRequest` and other shopee-related types.
4. **Utilities**: [lib/shopee-requests.ts](file:///c:/Users/Admin/Downloads/ccc/lib/shopee-requests.ts)
   - Contains request actions like loading and persisting.

## Scope of Changes

- Modify [types/shopee.ts](file:///c:/Users/Admin/Downloads/ccc/types/shopee.ts) to add `source` and `receivedFrom` optional properties.
- Create [ShopeeManualRequestModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/ShopeeManualRequestModal.tsx) matching the required layouts, styles, dynamic calculations, warnings, and states.
- Modify [ShopeeRequestsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ShopeeRequestsPage.tsx) to import, mount, control visibility of the modal, and persist new requests upon creation.
