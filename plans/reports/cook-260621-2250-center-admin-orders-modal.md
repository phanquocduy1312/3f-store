# Implementation Report: Center Admin Orders Page Details Modal & Scrollable Timeline

**Date**: 2026-06-21
**Time**: 22:50 (GMT+7)
**Task**: Center order detail and configurations modals, and make the status logs timeline box scrollable with height boundaries.

## Analysis & Root Cause
1. **Viewport Alignment**: The details sidebar/drawer was wrapped inside the main layout content wrapper (`lg:pl-[220px]` and `transition-all duration-300`), causing modern browsers to set a local relative containing block for `fixed inset-0` child elements. This caused offset alignment and squeezed column widths.
2. **Timeline Height**: The status logs timeline list grew dynamically with the number of transitions. Since there was no height limit, longer log histories expanded the entire modal height, forcing users to scroll the outer modal to see other segments.

## Changes Done
1. **[AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx)**:
   - **Modal Centering**: Moved the inner container closing `</div>` up to right after `</main>`, ejecting all modals to the root container level. This centers the modal and covers the entire viewport correctly.
   - **Scrollable Timeline**: Wrapped the timeline list in a wrapper div styled with `max-h-[240px] overflow-y-auto pr-1 admin-scrollbar` to constrain its height.
   - **Clipping Prevention**: Shifted the timeline list container's margin-left from `ml-2` to `ml-4` to ensure the timeline's absolute indicator circles (`-left-[31px]`) remain fully visible within the parent scrollable container boundaries.
2. **[project-changelog.md](file:///c:/Users/Admin/Downloads/ccc/docs/project-changelog.md)**:
   - Documented all layout updates and scroll enhancements in the changelog.

## Verification
- Run TypeScript static type compilation check: `npx tsc --noEmit` -> Passed cleanly with zero warnings/errors.
- Verified spacing and bounds in modal container: the scrollable container holds timeline items beautifully, and absolute markers remain fully visible when scrolling.

