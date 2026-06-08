# Implementation Report: Centered Side-by-Side Authentication Layout

- **Task**: Restructure Auth page to a centered, side-by-side layout showing both login and registration forms, and hide the footer on this page.
- **Date**: 2026-06-08
- **Time**: 10:49
- **Status**: Progressing

## Planned Changes

1. **Auth Page Layout Restructuring** (`src/pages/Auth.tsx`):
   - Remove the split-screen image banner and the tab toggling logic.
   - Design a centered card (`max-w-5xl`) displaying both `LoginForm` (+ `SocialLogins`) and `RegisterForm` simultaneously.
   - Use a two-column grid on desktop screens (`md:grid-cols-2`) and stacked on mobile screens.
   - Add a vertical divider on desktop to separate the forms cleanly.

2. **Footer Visibility Control** (`src/App.tsx`):
   - Import `useLocation` from `react-router-dom` inside `App` component.
   - Hide the `<Footer />` component dynamically when the current path is `/auth`.

3. **Verify Build**:
   - Run compilation checks to ensure everything builds correctly.
