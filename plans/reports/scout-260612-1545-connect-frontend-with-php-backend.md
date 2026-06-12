# Scout Report - Connecting Frontend React to PHP MVC Backend

- **Path**: `./plans/reports/scout-260612-1545-connect-frontend-with-php-backend.md`
- **Current Date/Time**: 2026-06-12 15:45
- **Task Slug**: `connect-frontend-with-php-backend`

---

## 1. Discovered Backend Endpoints

From the backend PHP MVC codebase:
1. **Shopee Order Scan**: `POST /api/shopee/order-scan` (expects Multipart Form `image`).
2. **Create Shopee Request**: `POST /api/shopee/requests` (expects JSON payload).
3. **Admin Request List**: `GET /api/admin/shopee/requests` (supports query params `page`, `limit`, `status`, `verification`, `keyword`).
4. **Admin Request Detail**: `GET /api/admin/shopee/requests/detail?id={id}` (returns full details including `image` and `scan`).
5. **Admin Approve**: `POST /api/admin/shopee/requests/approve` (expects JSON `{requestId, adminNote}`).
6. **Admin Reject**: `POST /api/admin/shopee/requests/reject` (expects JSON `{requestId, reason}`).

---

## 2. Discovered Frontend Files

1. **[`src/config/api.ts`](file:///c:/Users/Admin/Downloads/ccc/src/config/api.ts)**: Configures `API_BASE_URL` and `buildImageUrl`.
2. **[`src/services/shopeePointApi.ts`](file:///c:/Users/Admin/Downloads/ccc/src/services/shopeePointApi.ts)**: Holds actual API functions.
3. **[`components/threeFclup.tsx`](file:///c:/Users/Admin/Downloads/ccc/components/threeFclup.tsx)**: Customer point request form. Uses relative state/form values.
4. **[`src/pages/admin/ShopeeRequestsPage.tsx`](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ShopeeRequestsPage.tsx)**: Main admin listing view. Currently loads requests from local storage.
5. **[`components/admin/shopee/ShopeeRequestDetailModal.tsx`](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/ShopeeRequestDetailModal.tsx)**: Request detail view modal.

---

## 3. Data Schema Mapping Differences

| Backend Field (Database/API) | Frontend Field (`types/shopee.ts`) | Mapping Strategy |
| --- | --- | --- |
| `id` (numeric integer) | `id` (string) | Convert using `String(id)` |
| `order_amount` | `customerInputAmount` | Read value as `orderAmount` or map as needed |
| `imageUrl` (relative path) | `orderImageUrl` | Pass to `buildImageUrl(imageUrl)` |
| `processing_status` | `status` & `processingStatus` | Map directly to matching string union types |
| `verification_status` | `verificationStatus` & `apiCheckStatus` | Map values from API response |

---

## 4. Key Actions and Modifications

1. **Customer Form (`threeFclup.tsx`)**:
   - Double-check phone number normalize helper, validation, and auto-filled field highlighting.
   - Set up image scanning sequence, reset old state when new image is uploaded, use `scanIdRef` for race conditions.
   - Connect submit handler to `createShopeePointRequest`.

2. **Admin Listing (`ShopeeRequestsPage.tsx`)**:
   - Refactor `loadRequests()` to fetch via API `getShopeePointRequests()`.
   - Update stats calculations to read from the fetched list or fetch paginated counts properly.
   - Refactor approval and rejection modal handlers to call `approveShopeePointRequest()` and `rejectShopeePointRequest()`.
   - Reconcile endpoint mapping or check if we should trigger reconcile updates.

3. **Detail Modal (`ShopeeRequestDetailModal.tsx`)**:
   - Trigger detail API call `getShopeePointRequestDetail(id)` when modal opens.
   - Handle image preview properly using `buildImageUrl(imageUrl)`.
   - Handle Reject/Approve API actions, toast alerts, reload list.
