# Progress Report: Pet Food Consultation Lead Popup Implementation

**Date**: 2026-06-10  
**Type**: Cook (Implementation Progress)  

## Implementation Details
We have successfully implemented and verified the delayed lead-capture consultation popup:

1. **Popup Component** (`components/ConsultationPopup.tsx`):
   - Created a new component with a multi-step flow:
     - **Intro Step**: Shows the beautiful dog/cat illustration on the left and lead magnets (Voucher 30.000đ, Product suggestions, Care checklist) on the right with a bold "Bắt đầu" CTA.
     - **Form Step**: Captures the pet profile (type, age, name) and phone number.
     - **Success Step**: Displays the discount voucher code `3FNEW30` with a one-click copy button, and redirects the user to relevant products based on their pet type preference upon submission.
   - Used `framer-motion` for smooth scale and fade transition effects on both the backdrop blur overlay and the dialog box container.
   - Handled session persistence via `sessionStorage` so users are not spammed with the popup multiple times within the same browsing session.
   - Kept the file concise and modular at 182 lines (under the 200 lines limit).

2. **Visual Fidelity Polish**:
   - Swapped left panel background to pure white (`bg-white`) to match the screenshot.
   - Removed emoji text hearts (`♥`) as original hearts are pre-drawn in the transparent mascot PNG.
   - Substituted emoji paw print with matching blue vector `PawPrint` icon from Lucide library.
   - Split title onto two lines matching the mockup exactly.
   - Underlined "30 giây" with a precise absolute horizontal bar of 2.5px height.
   - Made checkbox checkmarks smaller and aligned perfectly.
   - Constrained "Bắt đầu" CTA button on desktop to a left-aligned width of `w-[260px]` for a visually balanced layout.

3. **Integration** (`src/pages/Home.tsx`):
   - Imported and mounted the `<ConsultationPopup />` component.
   - Set the delay to 7 seconds after the page mounts.

4. **Validation**:
   - Ran `npm run build` which verified successful compilation with Vite and TypeScript compiler.
