# Phase 1: Upgrade AI Pet Advisor

**Context Links**
- [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-0910-upgrade-ai-pet-advisor/plan.md)
- [PetAdvisorPopup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/PetAdvisorPopup.tsx)

## Overview
- Priority: High
- Current Status: Completed
- Description: Refactoring the AI Pet Advisor to capture free-text problems, calculate actual monthly budgets from purchase frequency/duration, and display results in segmented packages.

## Requirements
- Support version `2.0` in localStorage.
- Add `problem_text` question (textarea and quick options).
- Add `purchase_amount_range` and `usage_duration_range` questions.
- Group recommended products by `saving`, `balanced`, and `premium` in UI.
- Handle fallback mock data similarly.

## Architecture
- User fills the steps -> Computed fields are calculated -> Enriched payload is sent to Groq API -> Groq returns JSON -> UI renders divided columns/sections.

## Related Code Files
- [NEW] [petAdvisorUtils.ts](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/petAdvisorUtils.ts)
- [MODIFY] [quizConfig.ts](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/quizConfig.ts)
- [MODIFY] [PetAdvisorPopup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/PetAdvisorPopup.tsx)
- [MODIFY] [QuizStep.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/QuizStep.tsx)
- [MODIFY] [ContactForm.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/ContactForm.tsx)
- [MODIFY] [groqApi.ts](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/groqApi.ts)
- [MODIFY] [mockAiResult.ts](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/mockAiResult.ts)
- [MODIFY] [AiResult.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/AiResult.tsx)

## Implementation Steps
1. Create `petAdvisorUtils.ts` with helper functions.
2. Modify `quizConfig.ts` to update step configurations.
3. Modify `QuizStep.tsx` to add textarea and chip selection UI.
4. Modify `ContactForm.tsx` to add `petName` and clean text.
5. Modify `mockAiResult.ts` to add schema expansions.
6. Modify `groqApi.ts` to adjust prompt and payload formatting.
7. Modify `PetAdvisorPopup.tsx` to compute logic, run migrations, and pass data.
8. Modify `AiResult.tsx` to display grouped products, budget analysis, and badges.

## Todo List
- [x] Create helper utils
- [x] Update quiz configs
- [x] Support textarea & quick options in QuizStep UI
- [x] Add pet name input to ContactForm
- [x] Update mock AI result types and functions
- [x] Build payload logic and update Groq prompts
- [x] Connect state in PetAdvisorPopup (V2 schema migration)
- [x] Implement new sections in AiResult UI
- [x] Verify build and functionality

## Success Criteria
- Advisor flow works without bugs.
- Free-form text and custom budget computations are correctly processed and displayed.
- Groq returns categorized product recommendations matching catalog items.
- UI displays grouped tabs or segments beautifully.
- Falling back is handled gracefully.
