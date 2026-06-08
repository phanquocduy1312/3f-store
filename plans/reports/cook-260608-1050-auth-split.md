# Implementation Report: Separate Login & Register Pages with Form Left, Banner Right

- **Task**: Separate Authentication into `/login` and `/register` pages. Place the forms on the left and the banner image on the right. Hide the footer on both pages.
- **Date**: 2026-06-08
- **Time**: 10:50
- **Status**: Progressing

## Planned Changes

1. **New Pages**:
   - `src/pages/Login.tsx` (NEW): Render Login Form on the left, brand banner image on the right.
   - `src/pages/Register.tsx` (NEW): Render Register Form on the left, brand banner image on the right.
   - `src/pages/Auth.tsx` (DELETE): Remove the old unified page.

2. **Form Updates**:
   - Add a navigation link from the Login page to the Register page, and vice versa.

3. **Routing Integration** (`src/App.tsx`):
   - Register `/login` and `/register` routes.
   - Conditionally hide `<Footer />` when the path is `/login` or `/register`.

4. **Header Integration** (`components/Header.tsx`):
   - Update account icons and login CTA buttons to point to `/login`.
