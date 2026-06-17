# Phase 1: Type Mapping & API Integration

## Context Links
- [store.ts](file:///c:/Users/Admin/Downloads/ccc/types/store.ts)
- [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)

## Overview
- Priority: High
- Status: Todo
- Description: Extend store type definitions to support `productType` and `petType` fields, mapping them from API responses.

## Related Code Files
- `types/store.ts` (modify)
- `src/api/productsApi.ts` (modify)

## Implementation Steps
1. In `types/store.ts`, add:
   ```typescript
   productType?: string;
   petType?: string;
   ```
   to the `Product` type definition.
2. In `src/api/productsApi.ts`'s `mapApiProduct`, map:
   ```typescript
   productType: product.productType || undefined,
   petType: product.petType || undefined,
   ```

## Todo List
- [ ] Add `productType` and `petType` to `Product` type in `types/store.ts`
- [ ] Map these fields in `src/api/productsApi.ts`

## Success Criteria
- Product type handles real product type (e.g. Pate, Hạt) and target pet classification (e.g. Chó, Mèo) dynamically.
