# Phase 2: Save AI Quiz Result on Submission

## Context Links
- [customerPetsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerPetsApi.ts)
- [PetAdvisorPopup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/PetAdvisorPopup.tsx)

## Overview
- Priority: High
- Current Status: Pending
- Description: Make the AI advisor quiz persist the consultation results as a pet profile in the database.

## Requirements
- Update `PetData` interface in [customerPetsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerPetsApi.ts) to define `aiResult?: string`.
- Update `PetAdvisorPopup.tsx`:
  - If a user is logged in (has customer token), when `handleContactSubmit` completes successfully and gets an `aiResult`, call `createPetApi` to automatically save the pet profile and advice in the database.
  - Set relevant parameters: breed, species, name, healthNotes (from `problem_text`), favoriteFood (from `current_food`), allergies (from custom inputs), and `aiResult` (JSON stringified).

## Related Code Files
- [customerPetsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerPetsApi.ts) [MODIFY]
- [PetAdvisorPopup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/PetAdvisorPopup.tsx) [MODIFY]

## Implementation Steps
1. Add `aiResult?: string` to `PetData` interface in [customerPetsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerPetsApi.ts).
2. Modify `handleContactSubmit` in [PetAdvisorPopup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/PetAdvisorPopup.tsx):
  - Check if logged in.
  - If logged in, construct `PetData` from answers and `aiResult`.
  - Invoke `createPetApi` to persist.

## Todo List
- [ ] Add `aiResult` to `PetData` TS interface.
- [ ] Import `createPetApi` inside `PetAdvisorPopup.tsx`.
- [ ] Implement backend persistence logic inside `handleContactSubmit`.
