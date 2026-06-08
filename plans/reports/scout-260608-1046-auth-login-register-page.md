# Scout Report: Authentication Pages Integration

- **Task**: Implement Login & Registration pages for 3F Store.
- **Date**: 2026-06-08
- **Time**: 10:46
- **Status**: Scouting Completed

## Codebase Findings

1. **Header Component** (`components/Header.tsx`):
   - Contains a CTA "Đăng nhập" button (Line 220) currently linking to `#`.
   - Contains a "Tài khoản" icon button (Line 196) currently doing nothing.
   - We need to modify this component to link both elements to the new `/auth` path.

2. **Routing System** (`src/App.tsx`):
   - Uses `react-router-dom` `Routes` and `Route`.
   - We need to import our new `Auth` page component and configure the path `/auth` pointing to it.

3. **Style System**:
   - Uses custom Tailwind CSS configurations with colors:
     - `forest` (`#10854F` / `#0A5C35`)
     - `cream` (`#F8F4EC`)
     - `ink` (`#221A12`)
   - Uses `lucide-react` for premium vector icons.
   - Uses `framer-motion` for micro-animations and page transitions.

## Proposed New Files

- **`src/pages/Auth.tsx`**: A unified, split-screen style Authentication Page containing both login and registration forms with smooth state-based transitions and social logins (Google, Facebook).
- **`public/assets/images/auth-banner.png`**: (Generated and placed) A high-quality cat & puppy visual representing the brand.
