# Phase 01: Redesign Admin Login Page

## Context Links
- [AdminLogin.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminLogin.tsx)
- [globals.css](file:///c:/Users/Admin/Downloads/ccc/src/globals.css)

## Overview
- **Priority**: High
- **Current Status**: In Progress
- **Description**: Redesign the admin login page to make it light-themed, warm, pet-friendly ("humanized"), and fix syntax errors in the file.

## Key Insights
- The page had broken code around `handleSubmit` (`se  return (`) and stray lines at the end.
- The blue theme was too corporate. A cozy brand-aligned theme with warm cream, forest teal, and honey amber colors feels much more human and matches 3F Store's identity.

## Requirements
- Light, warm theme.
- Responsive, aesthetic, and welcoming design.
- Cute floating icons (paw print, bone) with gentle animations.
- Hover-effects like wiggle animation on the logo.
- Personalized dynamic greetings based on current local time.

## Related Code Files
- [MODIFY] [AdminLogin.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminLogin.tsx)

## Implementation Steps
1. Open `AdminLogin.tsx` and clear out the syntax errors.
2. Structure the container with warm organic color gradients.
3. Add floating paw and bone background elements with localized keyframes.
4. Redesign the login card with deep forest teal primary highlights, amber details, and warm cream surfaces.
5. Add hover animations to the logo (wiggle effect).
6. Implement time-based Vietnamese greetings.
7. Test the React compilation.

## Todo List
- [ ] Fix syntax errors in `AdminLogin.tsx`
- [ ] Redesign container to use warm cream/beige gradients
- [ ] Add floating background pet icons
- [ ] Add custom CSS animations via a local `<style>` tag
- [ ] Refine button styling and input fields with warm focus states
- [ ] Implement greeting state and wiggle effects
- [ ] Verify that there are no TS errors

## Success Criteria
- Clean, successful build.
- The page looks exceptionally cozy, humanized, warm, and professional.

## Risk Assessment
- None, purely UI-based design changes.

## Security Considerations
- Ensure input validation and error handling are preserved.
- Preserve session persistence (`rememberMe`).
