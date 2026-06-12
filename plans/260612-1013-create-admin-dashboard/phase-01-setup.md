# Phase 1: Setup & Routing

## Context Links
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1013-create-admin-dashboard/plan.md)

## Overview
- **Priority:** High
- **Status:** In Progress
- **Description:** Set up the route `/admin` and adjust routing shells to prevent client-facing layout (Header, Footer, Floating Button/Popup) from rendering on admin pages.

## Key Insights
- Since App.tsx wraps routes in a single page shell, we must conditionally check `location.pathname` to prevent header, footer, and popups from showing when on `/admin` or its subroutes.

## Requirements
- Render a blank canvas for `/admin` that is completely styled for the Admin dashboard.
- Hide `Header`, `Footer`, and `PetAdvisorPopup` on `/admin` routes.

## Architecture
- Standalone admin shell managed by client router path matching.

## Related Code Files
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx) [MODIFY]
- [admin-dashboard.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/admin-dashboard.tsx) [NEW]

## Implementation Steps
1. Create a dummy `src/pages/admin/admin-dashboard.tsx` with a basic title page to verify routing works.
2. Modify `src/App.tsx`:
   - Import `AdminDashboard` lazily.
   - Register Route `path="/admin"`.
   - Update conditions for rendering `Header`, `Footer`, and `PetAdvisorPopup` so they check `!location.pathname.startsWith("/admin")`.
3. Test that going to `/admin` renders the dummy page without client headers/footers.

## Todo List
- [ ] Create dummy `admin-dashboard.tsx`
- [ ] Modify `src/App.tsx` routing
- [ ] Add conditional checks for header/footer/popup
- [ ] Validate `/admin` is a clean empty page

## Success Criteria
- Going to `/admin` renders "Admin Dashboard Works!" with no standard website header or footer.
- Going to `/` still renders the header and footer properly.

## Risk Assessment
- Routing conflicts or compilation errors if lazy loading syntax is incorrect. Mitigation: compile check via `tsc`.

## Security Considerations
- Frontend-only path. No authentication is requested yet.

## Next Steps
- Implement Core Dashboard Components in Phase 2.
