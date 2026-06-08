# Phase 2: Route Integration & Verification

## Context Links
- [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260608-1046-auth-login-register-page.md)
- [Plan Overview](file:///c:/Users/Admin/Downloads/ccc/plans/260608-1046-auth-login-register-page/plan.md)

## Overview
- **Priority**: High
- **Current Status**: Pending
- **Description**: Configure the client-side router to handle the `/auth` path and link the navigation actions in `Header.tsx` to the auth screen.

## Requirements
- Link "Đăng nhập" CTA button in Header desktop layout to `/auth`.
- Link "Tài khoản" icon button in Header layout to `/auth` (for now, when not logged in).
- Set up `<Route path="/auth" element={<Auth />} />` in `src/App.tsx`.
- Perform compilation check (`npm run build`) and manual verification.

## Related Code Files
- [MODIFY] [Header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Header.tsx)
- [MODIFY] [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)

## Implementation Steps
1. Open `src/App.tsx` and import the `Auth` component.
2. Add route for path `/auth`.
3. Open `components/Header.tsx` and modify the "Tài khoản" icon button to be a `Link` pointing to `/auth`.
4. Modify the desktop CTA button "Đăng nhập" in `Header.tsx` to link to `/auth`.
5. Run project build to verify types and compilation.

## Todo List
- [ ] Update route config in `src/App.tsx`
- [ ] Update header links in `components/Header.tsx`
- [ ] Run typescript and build check

## Success Criteria
- Navigation buttons successfully redirect the browser to the `/auth` page.
- Direct entry of `/auth` in the URL displays the Login/Register split layout page.
- Build compiles completely cleanly.
