# Phase 1: Authentication UI Creation

## Context Links
- [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260608-1046-auth-login-register-page.md)
- [Plan Overview](file:///c:/Users/Admin/Downloads/ccc/plans/260608-1046-auth-login-register-page/plan.md)

## Overview
- **Priority**: High
- **Current Status**: In Progress
- **Description**: Design and implement `src/pages/Auth.tsx` to handle both login and registration forms in a split-screen premium responsive layout.

## Key Insights
- **Split Screen design**: Desktop layout will show a branding banner on the left (the generated `auth-banner.png` cat & puppy image) and the authentication forms on the right.
- **Micro-animations**: Use `framer-motion` for smooth tab switching between "Đăng nhập" (Login) and "Đăng ký" (Register) to minimize page load times and offer an app-like feel.
- **Premium Aesthetics**: Input fields will have forest green borders on focus, custom floating labels or crisp placeholder styling, and eye/eye-off toggle for password fields.

## Requirements
- **Functional**:
  - Toggle between Login and Register tabs.
  - Login fields: Email/Username, Password (with show/hide toggle), Remember Me, Forgot Password link.
  - Register fields: Full Name, Email, Phone Number, Password (with strength indicator/requirements), Confirm Password, and Terms & Conditions checkbox.
  - Form validation for empty fields, invalid emails, phone formats, and matching passwords.
  - Third-party social logins (Google and Facebook button shortcuts).
- **Non-Functional**:
  - Keep individual components modular (under 200 lines if possible).
  - Use exact theme colors (`forest`, `cream`, `ink`).
  - Mobile-responsive (hide side-banner on smaller screens).

## Architecture
```
+-------------------------------------------------------------+
|                       Auth Page                             |
+------------------------------+------------------------------+
|       Left (Desktop)         |       Right (Form Area)      |
|  Brand Image & Slogan        |  - Tab Header (Login/Reg)    |
|  (auth-banner.png)           |  - Form inputs (Email, Pwd)  |
|                              |  - Action Buttons (Submit)   |
|                              |  - Social Logins (Google/FB) |
+------------------------------+------------------------------+
```

## Related Code Files
- [NEW] [Auth.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/Auth.tsx)

## Implementation Steps
1. Create `src/pages/Auth.tsx`.
2. Implement form structures with states for toggling tabs, forms, input validation, and password visibility.
3. Apply styling conforming to Tailwind rules and 3F Store guidelines.
4. Verify compiling by building.

## Todo List
- [ ] Create `Auth.tsx`
- [ ] Implement toggle state for Login vs. Register forms
- [ ] Design form fields and verification labels
- [ ] Add Google / Facebook social login buttons
- [ ] Add password show/hide functionality

## Success Criteria
- Compiles without TypeScript errors.
- Visual display matches the shop's branding (cream background, green accents).
- Both forms are fully functional with client-side validation messages.

## Risk Assessment
- *Risk*: A single file `Auth.tsx` containing both Login and Register forms might exceed 200 lines.
- *Mitigation*: Modularize forms (e.g., `LoginForm` and `RegisterForm`) if the line count grows beyond 200 lines.

## Security Considerations
- Password inputs must mask text (using `type="password"`).
- Enable client-side validation to prevent sending obviously malformed data.

## Next Steps
- Implement the route in `App.tsx` and header link in `Header.tsx`.
