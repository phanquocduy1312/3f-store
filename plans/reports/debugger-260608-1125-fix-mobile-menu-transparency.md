# Debugger Report: Fix Mobile Menu Drawer Transparency

- **Task**: Fix transparent background of mobile navigation drawer menu.
- **Date**: 260608
- **Time**: 1125
- **Status**: Progressing

## Root Cause Analysis
1. In `components/mobile-navigation-drawer.tsx` line 56:
   ```tsx
   className="absolute bottom-0 left-0 top-0 flex w-[300px] flex-col bg-cream/98 p-6 shadow-2xl"
   ```
2. The class `bg-cream/98` uses the opacity `/98`. However, `98` is not a default opacity value in Tailwind CSS's opacity scale.
3. Because Tailwind does not extend the opacity config for `98`, `bg-cream/98` compiles to nothing (ignored by Tailwind), falling back to browser default (fully transparent background).
4. The background of the mobile drawer menu is therefore completely transparent, allowing underlying page text and graphics to clash with the menu text, making it illegible.

## Solution Plan
1. In `components/mobile-navigation-drawer.tsx`, change `bg-cream/98` to `bg-cream` (which is a solid `#F8F4EC` background color) or `bg-cream/[0.98]` (using Tailwind's arbitrary opacity bracket syntax if we want to retain slight translucence).
2. Given the user's frustration with the transparent menu ("màu trong suot khó chịu quá"), a solid background (`bg-cream`) is the cleanest and most readable solution.
3. Test compilation with `npm run build` to ensure no errors.
