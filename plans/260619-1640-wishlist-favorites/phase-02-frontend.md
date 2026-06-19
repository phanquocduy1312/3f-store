# Phase 02: Frontend Integration

## Context Links
- [ProductCard.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductCard.tsx)
- [Header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Header.tsx)
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)

## Overview
- **Priority**: High
- **Current Status**: Planning
- **Description**: Add WishlistContext, implement the wishlist API client, update ProductCard and ProductDetail components to show heart buttons, and create the WishlistPage.

## Requirements
- Create `WishlistContext` to manage local/db state, count, and guest token syncing.
- Update `ProductCard` to add a floating Heart button in the top right corner of the image.
- Create `/wishlist` route in `App.tsx` routing.
- Create `WishlistPage` displaying all favorites in a grid layout with "Thêm vào giỏ" and "Xóa" buttons.

## Related Code Files
- [NEW] [wishlistApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/wishlistApi.ts)
- [NEW] [WishlistContext.tsx](file:///c:/Users/Admin/Downloads/ccc/src/context/WishlistContext.tsx)
- [NEW] [WishlistPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/WishlistPage.tsx)
- [MODIFY] [ProductCard.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductCard.tsx)
- [MODIFY] [ProductDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/ProductDetail.tsx)
- [MODIFY] [Header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Header.tsx)
- [MODIFY] [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)

## Todo List
- [ ] Create `wishlistApi.ts` client wrapper
- [ ] Implement `WishlistContext.tsx` and wrap the App provider
- [ ] Add heart toggles in `ProductCard.tsx` and `ProductDetail.tsx`
- [ ] Create `WishlistPage.tsx` with a premium layout
- [ ] Connect Header wishlist badge count
- [ ] Test E2E flow
