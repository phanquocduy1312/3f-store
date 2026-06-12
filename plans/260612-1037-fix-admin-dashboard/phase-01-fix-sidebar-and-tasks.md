# Phase 1: Layout Polishing & Sidebar Fixes

## Context Links
- Plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1037-fix-admin-dashboard/plan.md)
- Dashboard: [admin-dashboard.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/admin-dashboard.tsx)

## Overview
- Priority: High
- Current Status: In Progress
- Description: Fix fixed sidebar styling, bottom cards alignment, scrollbars in Firefox/Chrome, and scrollability in Task Queue.

## Related Code Files
- [globals.css](file:///c:/Users/Admin/Downloads/ccc/src/globals.css)
- [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)
- [admin-task-queue.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-task-queue.tsx)
- [admin-dashboard.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/admin-dashboard.tsx)

## Implementation Steps
1. Add Firefox scrollbar rules to `globals.css`.
2. Refactor `admin-sidebar.tsx` structure to separate logo, menu items scroll area, and fixed upgrade/support card footer.
3. Refactor `admin-dashboard.tsx` margin layout.
4. Update `admin-task-queue.tsx` to handle correct flexbox height and scroll.
5. Compile and verify.

## Todo List
- [x] Add Firefox scrollbar rule in `globals.css`
- [x] Refactor `admin-sidebar.tsx` layout and colors
- [x] Refactor `admin-task-queue.tsx` scroll behavior
- [x] Refactor `admin-dashboard.tsx` layout offset
- [x] Compile and verify
