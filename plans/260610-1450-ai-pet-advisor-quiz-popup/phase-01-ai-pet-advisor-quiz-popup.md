# Phase 01: AI Pet Advisor Quiz Popup

## Context Links
- Plan Overview: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260610-1450-ai-pet-advisor-quiz-popup/plan.md)
- Existing Popup: [ConsultationPopup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ConsultationPopup.tsx)
- Homepage: [Home.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/Home.tsx)

## Overview
- **Priority**: High
- **Current Status**: In Progress
- **Description**: Build a highly modular, interactive multi-step quiz advisor for pet foods on the homepage. Split components into a dedicated `pet-advisor` directory, each under 200 lines, configuration-driven, with mock backend processing, local storage state saving, and premium visual design.

## Key Insights
- **Modularity**: Code files must be under 200 lines. We will separate components cleanly into `components/pet-advisor/`.
- **Responsive Adaptability**: Centered popup on desktop, bottom sheet on mobile (`max-height: 90vh`).
- **Configuration-Driven**: Question schemas for Dog/Cat are stored in `quizConfig.ts`, avoiding JSX clutter and facilitating future changes.
- **LocalStorage Rules**: Avoid showing for 24 hours if dismissed, and for 30 days if submitted.
- **Mocking**: Simulated API function with 1.5s delay maps answers (e.g. cat + picky_eater) to detailed food recommendations.

## Requirements
- Render welcome screen.
- Conditional routing: Dogs flow vs Cats flow vs "Both" selection.
- Render quiz steps: choice cards with smooth micro-animations.
- Manage temporary answers state.
- Validate contact details: Name (required), Phone (required, with validation alerts), Email (optional).
- Show thinking loading spinner with progress indicator.
- Show tailored advisor output card, copy-to-clipboard coupon, and actionable CTAs (Zalo redirect, shop, custom support).
- Floating anchor button to reopen the popup.

## Architecture
```
components/pet-advisor/
├── PetAdvisorPopup.tsx    (State Orchestrator & Modal Frame)
├── QuizWelcome.tsx         (Intro Banner & CTA)
├── QuizStep.tsx            (Choice list / text input & Back/Next control)
├── OptionCard.tsx          (Reusable Card option UI)
├── ContactForm.tsx         (Name/Phone/Email + Validation)
├── AiLoading.tsx           (Simulated analysis spinner)
├── AiResult.tsx            (Recommendation details & Action buttons)
├── ProgressBar.tsx         (Step visual index indicator)
├── FloatingPetButton.tsx   (Floating widget to re-open/retry)
├── Mascot.tsx              (Asset and animation wrapper)
├── quizConfig.ts           (Question config data)
└── mockAiResult.ts         (Offline advice mapping logic)
```

## Related Code Files
- [NEW] [quizConfig.ts](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/quizConfig.ts)
- [NEW] [mockAiResult.ts](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/mockAiResult.ts)
- [NEW] [OptionCard.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/OptionCard.tsx)
- [NEW] [ProgressBar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/ProgressBar.tsx)
- [NEW] [Mascot.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/Mascot.tsx)
- [NEW] [QuizWelcome.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/QuizWelcome.tsx)
- [NEW] [QuizStep.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/QuizStep.tsx)
- [NEW] [ContactForm.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/ContactForm.tsx)
- [NEW] [AiLoading.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/AiLoading.tsx)
- [NEW] [AiResult.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/AiResult.tsx)
- [NEW] [FloatingPetButton.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/FloatingPetButton.tsx)
- [MODIFY] [PetAdvisorPopup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/PetAdvisorPopup.tsx)
- [MODIFY] [Home.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/Home.tsx) (Swap `ConsultationPopup` with `PetAdvisorPopup`)

## Implementation Steps
1. Create `quizConfig.ts` and `mockAiResult.ts`.
2. Implement utility UI components: `OptionCard`, `ProgressBar`, `Mascot`.
3. Implement screen components: `QuizWelcome`, `QuizStep`, `ContactForm`.
4. Implement feedback components: `AiLoading`, `AiResult`, `FloatingPetButton`.
5. Implement main wrapper and state controller `PetAdvisorPopup.tsx`.
6. Integrate in `Home.tsx` and run linting/build checks to verify.

## Todo List
- [ ] Create `quizConfig.ts`
- [ ] Create `mockAiResult.ts`
- [ ] Create `OptionCard.tsx`
- [ ] Create `ProgressBar.tsx`
- [ ] Create `Mascot.tsx`
- [ ] Create `QuizWelcome.tsx`
- [ ] Create `QuizStep.tsx`
- [ ] Create `ContactForm.tsx`
- [ ] Create `AiLoading.tsx`
- [ ] Create `AiResult.tsx`
- [ ] Create `FloatingPetButton.tsx`
- [ ] Create `PetAdvisorPopup.tsx`
- [ ] Update `src/pages/Home.tsx`
- [ ] Clean up/delete old `components/ConsultationPopup.tsx`

## Success Criteria
- Builds successfully without typescript or lint errors.
- Popup triggers after 7 seconds, showing the greeting screen.
- Allows step-by-step navigation, back and forward.
- Responsive design matches desktop centered popups and mobile bottom-sheets.
- Form checks inputs and blocks progression if name/phone are empty.
- Custom results are successfully shown with advice detail after 1.5 seconds loading.

## Risk Assessment
- *Scroll issues on mobile bottom sheet*: Managed by setting `max-h-[90vh]` and `overflow-y-auto` in scrollable steps.
- *State losses on closed tabs*: Managed by maintaining state inside React, checking localStorage values on entry.

## Security Considerations
- Validate user-inputted phone numbers and names locally before mocking the payload structure.
- Clean up localStorage on testing hooks if required.
