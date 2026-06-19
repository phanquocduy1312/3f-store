# Implementation Plan: Production Admin Product Management Fixes

This plan outlines the steps to align the Admin Product Management features of 3F Store with proper production constraints.

## User Review Required

> [!IMPORTANT]
> - **DOMPurify integration**: We have installed `dompurify` and `@types/dompurify` to sanitize HTML description preview on the frontend.
> - **Soft deletion safety**: Disabling ordered variants in the UI instead of deleting them.
> - **Backend calculations**: The backend will ignore aggregates sent by the frontend and calculate them dynamically from active database variants.

## Open Questions

* No open questions.

## Phases

1. [Phase 01: Backend Alignment](file:///c:/Users/Admin/Downloads/ccc/plans/260618-2120-production-admin-product-management/phase-01-backend.md)
   - Status: Pending
   - Scope: Admin product stats, duplicate SKU checking, slug normalization, variant delete/deactivate checks, price validation.

2. [Phase 02: Frontend Polish & Validation](file:///c:/Users/Admin/Downloads/ccc/plans/260618-2120-production-admin-product-management/phase-02-frontend.md)
   - Status: Pending
   - Scope: KPI Cards, plain text/HTML description editors, slug generation buttons, SKU display expansion, variant preset option UI, price checks, confirm-on-dirty warnings, display tags.

## Success Criteria
- Global statistics returned in `/api/admin/products` and displayed in 3 distinct KPI cards.
- Sanitized HTML preview in product details description.
- Slug regeneration with emoji and diacritic removal.
- Variant with order history cannot be hard deleted.
- Unsaved changes dirty state detection showing beforeunload prompt.
