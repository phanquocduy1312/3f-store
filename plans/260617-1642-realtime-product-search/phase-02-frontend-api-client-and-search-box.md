# Phase 2: Frontend API Client & ProductSearchBox Component

**Context Links:**
* Config API: [api.ts](file:///c:/Users/Admin/Downloads/ccc/src/config/api.ts)
* Products API Client: [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)
* Search Box Component: `src/components/ProductSearchBox.tsx`

---

## Overview
* **Priority**: High
* **Current Status**: Pending
* **Description**: Create a dedicated search box component with an auto-suggest dropdown, input debounce, abort controllers for handling race conditions, click outside listener, and full keyboard navigation.

## Requirements
* Suffix clamp: ensure `src/config/api.ts` builds URL correctly utilizing `VITE_API_BASE_URL` env variable.
* API helper `searchProducts(keyword, limit, signal)` inside `src/api/productsApi.ts`.
* Component `ProductSearchBox.tsx`:
  * Debounce query fetching by 300ms.
  * Ignore search query when `length < 2`.
  * Support cancellation of stale requests using `AbortController`.
  * Position dropdown absolute under the input, maintaining full responsive aesthetics (glassmorphism/vibrant styling).
  * Dropdown features: product thumbnail (52x52), product name (max 2 lines), category/brand small label, formatted pricing (single price or min-max range), sold/rating metrics, out-of-stock / variant badges, and a footer linking to view all results.
  * Handle key events: Escape to close, ArrowDown/ArrowUp to scroll selected index, Enter to select suggestion or trigger full keyword search.
  * Dismiss on clicking outside.

## Related Code Files
* [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)
* `src/components/ProductSearchBox.tsx` (New)

## Implementation Steps
1. **API Client (`productsApi.ts`)**:
   - Declare `searchProducts` function utilizing `apiJson` with custom `AbortSignal` parameter.
2. **Component Development (`ProductSearchBox.tsx`)**:
   - Implement input element with styling matching current header search bar style.
   - Use custom React hooks or local states for handling query, results list, index highlights, and abort controllers.
   - Design suggestion items, highlighting the matching text if applicable.

## Todo List
- [ ] Add `searchProducts` method to `src/api/productsApi.ts`
- [ ] Implement `ProductSearchBox` query handling with 300ms debounce
- [ ] Integrate AbortController for race condition mitigation
- [ ] Add ArrowUp / ArrowDown / Escape key listeners
- [ ] Create click outside listener hook
- [ ] Build dropdown suggestion design (image, name, price, stock, variant count, rating, and sold)
- [ ] Add footer button to navigate to `/products?q=keyword`

## Success Criteria
- [ ] Entering text debounces and fetches product suggestions without blocking the browser.
- [ ] Dropdown displays correct styling, matching color palette (vibrant dark modes / forest green).
- [ ] Hitting Escape closes the dropdown.
- [ ] Selecting items using arrow keys works smoothly.
