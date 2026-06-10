# Scout Report: Pet Food Consultation Lead Popup

- **Task**: Implement a lead generation consultation popup with a 5-10s delay, blurred background, and custom styling to match the screenshot.
- **Date**: 2026-06-10
- **Time**: 14:30
- **Status**: Scouting Completed

## Codebase Findings

1. **Homepage Component** (`src/pages/Home.tsx`):
   - Home is a standard page component.
   - We can import our new popup component and place it inside `Home.tsx`.
   
2. **Assets**:
   - The required image asset `/assets/images/dog_cat_heart_rbg.png` exists in the `public/assets/images` folder (size: 272190 bytes).
   
3. **Style System**:
   - Tailwind CSS is used.
   - We have `framer-motion` installed for smooth animations.
   - We have `lucide-react` for premium icons (e.g. `X`, `Check`).
   - The primary theme color is deep blue/navy (defined by variables in `globals.css` and `tailwind.config.ts` as `forest` which uses RGB values `19 72 111`).
   - The layout needs a backdrop blur (`backdrop-blur-md` or `backdrop-blur-sm`).

## Proposed New Files

- **`components/ConsultationPopup.tsx`**: A component implementing:
  - Delayed trigger (7 seconds) using a `setTimeout` inside a `useEffect`.
  - Backdrop overlay with blur and dark overlay.
  - Dialog card in the center with a responsive split layout (image on the left, copy & call-to-action on the right).
  - Framer motion animation for container entry (scale-up and fade-in).
  - Custom styles for bullet checklist with custom green check circles.
  - Close button and "Bắt đầu" action button with chevron indicator.
  - State persistence in `sessionStorage` (or `localStorage`) to prevent annoying users on page refresh during the same session. Let's use `sessionStorage` so it only pops up once per visit, which is standard UX best practice.
