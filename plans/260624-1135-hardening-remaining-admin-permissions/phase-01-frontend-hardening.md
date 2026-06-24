# Phase 1: Frontend Hardening for Admin Dashboard Pages

## Context Links
- [Overview Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260624-1135-hardening-remaining-admin-permissions/plan.md)

## Overview
- **Priority**: High
- **Status**: In Progress
- **Description**: Secure the remaining admin dashboard pages by removing hardcoded bypasses for the `manager` and `super_admin` roles from the `hasEditAccess` definition, so that permissions are strictly checked.

## Key Insights
- Only `dev` and `admin` roles should bypass permission checks.
- Roles like `super_admin` and `manager` should be subjected to the specific permission validation `adminPermissions.includes(...)` to match the backend REST API verification.

## Proposed Changes

Remove `adminRole === "super_admin" || adminRole === "manager"` check from `hasEditAccess` and `hasProductWriteAccess` definitions:

1. **ThreeFClubPage.tsx**:
   - Change `hasEditAccess` to only allow `dev` / `admin` roles or check `club_3f` permission.
2. **AdminVouchersPage.tsx**:
   - Change `hasEditAccess` to only allow `dev` / `admin` roles or check `vouchers` permission.
3. **AdminProductReviewsPage.tsx**:
   - Change `hasEditAccess` to only allow `dev` / `admin` roles or check `reviews` permission.
4. **AdminOrdersPage.tsx**:
   - Change `hasEditAccess` to only allow `dev` / `admin` roles or check `orders` permission.
5. **AdminNewsPage.tsx**:
   - Change `hasEditAccess` to only allow `dev` / `admin` roles or check `news` permission.
6. **AdminNewsEditorPage.tsx**:
   - Change `hasEditAccess` to only allow `dev` / `admin` roles or check `news` permission.
7. **AdminCustomersPage.tsx**:
   - Change `hasEditAccess` to only allow `dev` / `admin` roles or check `customers` permission.
8. **AdminCustomer360Page.tsx**:
   - Change `hasEditAccess` to only allow `dev` / `admin` roles or check `customers` permission.
9. **AdminCategoriesPage.tsx**:
   - Change `hasEditAccess` to only allow `dev` / `admin` roles or check `categories` permission.
10. **AdminBannersPage.tsx**:
    - Change `hasEditAccess` to only allow `dev` / `admin` roles or check `banners` permission.
11. **AdminProductsPage.tsx**:
    - Change `hasProductWriteAccess` to only allow `dev` / `admin` roles or check `products` permission.
12. **AdminProductForm.tsx**:
    - Change `hasProductWriteAccess` to only allow `dev` / `admin` roles or check `products` permission.
13. **AdminWorkflowSettingsPage.tsx**:
    - Change `hasWorkflowAccess` to only allow `dev` / `admin` roles or check `orders` permission.

## Success Criteria
- Compilation succeeds via `npm run build`.
- Local tests pass and confirm that restricted roles are properly blocked from action UI elements.
