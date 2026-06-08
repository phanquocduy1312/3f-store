# Phase 01: Interactive Pet Profile Wizard

**Context Links**
- [plan.md](plan.md)
- [brainstormer-260608-1610-redesign-explore-banner.md](../reports/brainstormer-260608-1610-redesign-explore-banner.md)
- [HeroSection.tsx](../../components/HeroSection.tsx)

**Overview**
- Priority: High
- Current status: Completed
- Description: Replaces the generic top-right banner with a modular `PetProfileWizard` component that allows users to create a quick pet profile in 3 steps (Pet Type -> Age Group -> Filtered Products Redirection).

**Key Insights**
- The top-right banner slot is currently using a static marketing image (`banner-4.webp`) which makes the header look crowded and generic.
- A custom interactive wizard provides visual contrast, enhances brand credibility, and directly channels users to relevant product categories (`Thức ăn cho chó` or `Thức ăn cho mèo`).

**Requirements**
- **Aesthetic**: Premium dark chocolate/ink gradient (`from-[#2C231B] to-[#1A1410]`) with gold (`#F2C94C`) accents, matching the project's design tokens.
- **Interactivity**: 3 animated steps using `framer-motion` for transitions.
- **Redirection**: Dynamically generate the correct URL mapping to products (e.g. `/products?category=Thức ăn cho chó` or `/products?category=Thức ăn cho mèo`).
- **Modularization**: Keep individual code files under 200 lines by implementing this in a new component file: `components/PetProfileWizard.tsx` and importing it into `components/HeroSection.tsx`.

**Related Code Files**
- [NEW] `components/PetProfileWizard.tsx`
- [MODIFY] `components/HeroSection.tsx`

**Implementation Steps**
1. Create `components/PetProfileWizard.tsx` with:
   - State for `step` (0, 1, 2).
   - State for `petType` ('dog' | 'cat' | null).
   - State for `ageGroup` ('puppy' | 'adult' | 'senior' | null).
   - Animated step container using Framer Motion.
   - Interactive options with hover micro-animations and active states.
   - Navigation buttons (Back, Restart, Submit).
2. Modify `components/HeroSection.tsx` to:
   - Remove the static Top Right Banner code.
   - Import and render `<PetProfileWizard />` in the top right grid cell.
3. Test that:
   - Clicking options changes states with smooth slide animations.
   - Reaching step 3 and clicking "Khám phá ngay" redirects to the appropriate `/products?category=...` page.
   - The UI is fully responsive and looks beautiful on mobile/desktop.

**Todo List**
- [x] Create `components/PetProfileWizard.tsx`
- [x] Integrate wizard into `components/HeroSection.tsx`
- [x] Validate responsive design and functionality

**Success Criteria**
- The top-right grid cell is replaced with a dark-styled interactive wizard.
- The code compilation succeeds and passes typechecks.
- All step transitions are animated smoothly.
- The CTA button correctly filters the products list page upon redirect.

**Risk Assessment**
- *Transition Jank*: Swapping steps could cause layout shifts if heights are not constrained.
  - *Mitigation*: Ensure the wrapper has a fixed height or min-height (`min-h-[260px] lg:h-full`) similar to the bottom promotional card.
