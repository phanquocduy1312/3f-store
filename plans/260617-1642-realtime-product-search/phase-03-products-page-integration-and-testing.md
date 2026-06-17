# Phase 3: Header Integration, Catalog Integration & Testing

**Context Links:**
* Header component: [Header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Header.tsx)
* Products list: [ProductListing.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductListing.tsx)

---

## Overview
* **Priority**: High
* **Current Status**: Pending
* **Description**: Embed the `ProductSearchBox` into the customer Header for both desktop and mobile, synchronize the search parameters to retrieve results on the main products listing page, and verify the build passes.

## Requirements
* Swap old search input elements in `Header.tsx` for the new `ProductSearchBox`.
* Modify `ProductListing.tsx` to read the search term `q` from search parameters and fetch listings accordingly.
* Display custom header text `Kết quả tìm kiếm cho "[keyword]"` when `q` is active.
* Support concurrent search + category filters.
* Prevent CORS errors by reading configuration correctly.
* Run typechecking (`npx tsc --noEmit`) and production builds successfully.

## Related Code Files
* [Header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Header.tsx)
* [ProductListing.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductListing.tsx)

## Implementation Steps
1. **Header integration (`Header.tsx`)**:
   - Import `ProductSearchBox` in `Header.tsx`.
   - Replace the desktop `form` container and search input with the custom box.
   - Replace the mobile search form with the mobile layout custom box.
2. **Catalog Page (`ProductListing.tsx`)**:
   - Update state loading to bind `q` from `searchParams`.
   - Update `activeTitleName` memo to dynamically display search query title.
3. **Tests**:
   - Test search keywords, check local/production network requests, verify Escape/clicks behave correctly, and check that no localhost fallbacks exist.

## Todo List
- [ ] Replace desktop header search bar with `ProductSearchBox`
- [ ] Replace mobile header search bar with `ProductSearchBox`
- [ ] Sync search query param `q` inside `ProductListing`
- [ ] Update listing page title when searching
- [ ] Run typescript checks `npx tsc --noEmit`
- [ ] Run Vite production bundler `npm run build`
- [ ] FTP deploy files to production Plesk server and verify Vercel calls

## Success Criteria
- [ ] Enter key or search icon click correctly navigates to `/products?q=keyword` on both desktop and mobile.
- [ ] The catalog listing page correctly reflects the search query from the URL.
- [ ] The build compiles successfully.
- [ ] Dynamic search operations call the live staging API on trial1506895.mbws.vn.
