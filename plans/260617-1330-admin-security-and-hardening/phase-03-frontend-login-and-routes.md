# Phase 3: Frontend Login & Route Guarding

Build the admin login interface, protect client-side routes, and configure authorization headers in fetch requests.

## Context Links
- [Phase 2 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1330-admin-security-and-hardening/phase-02-auth-endpoints-and-middleware.md)

## Requirements
- Page `/admin/login`:
  - Visuals styled to match the premium dark/blue aesthetic.
  - Fields for Email, Password, and "Remember me".
- Route Guarding:
  - Higher-Order Component or route wrapper preventing access to `/admin/*` views if local storage lacks token.
  - Automatic redirect to `/admin/login` on token expiry/absence.
- Fetch Client Update:
  - Automatically attach `Authorization: Bearer <token>` in `productsApi.ts` for all calls.
  - Intercept 401 responses, purge invalid local sessions, and force redirect to `/admin/login`.
- Sidebar & Profile Display:
  - Render active admin name at the bottom of the sidebar.
  - Implement a logout button trigger.

## Related Code Files
- [NEW] [AdminLogin.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminLogin.tsx)
- [MODIFY] [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- [MODIFY] [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)
- [MODIFY] [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)

## Implementation Steps
1. Create `AdminLogin.tsx` page with input validation and call backend login API.
2. Edit `productsApi.ts` `apiJson` handler to inject the Bearer header and check for 401 statuses.
3. Update `App.tsx` to wrap all administrative pages in an `<AdminRouteGuard>` helper.
4. Modify `admin-sidebar.tsx` to pull admin information from local storage and trigger logout callback.

## Todo List
- [ ] Implement `AdminLogin.tsx` UI & functionality
- [ ] Add auth token & 401 handling to `productsApi.ts`
- [ ] Create `AdminRouteGuard` in `App.tsx`
- [ ] Integrate admin profile & logout in `admin-sidebar.tsx`

## Success Criteria
- Direct navigation to `/admin/orders` redirects to `/admin/login`.
- Logging in successfully forwards to `/admin/orders`.
- Pressing logout cleans cookies/localStorage and sends user back to login.
