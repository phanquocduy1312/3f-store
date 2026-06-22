# Phase 1: Fix Frontend Client Code

## Context Links
- [groqApi.ts](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/groqApi.ts)
- [customerPetsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerPetsApi.ts)

## Overview
- Priority: High
- Current Status: Pending
- Description: Resolve compilation/syntax errors in `groqApi.ts` and ensure it properly interfaces with `consultPetAdviceApi` in `customerPetsApi.ts`.

## Key Insights
- `groqApi.ts` currently contains corrupted code resulting from bad merges or previous edits.
- The client should not perform direct calls to Groq API to avoid leaking API keys and facing CORS/security blocks.

## Requirements
- Rewrite `groqApi.ts` to expose `getPetAdviceFromGroq` with type safety.
- The function must call `consultPetAdviceApi` and return `AiResultData`.
- Include a robust `FALLBACK_RESULT` matching the new structure if the backend API fails.

## Architecture
- React / TypeScript frontend environment.
- REST Client API pattern (`src/api/customerPetsApi.ts`).

## Related Code Files
- [groqApi.ts](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/groqApi.ts) [MODIFY]

## Implementation Steps
1. Re-write `groqApi.ts` completely with the clean delegation code.
2. Ensure standard fallback details are specified inside the frontend fallback constant in case of backend failures.
3. Validate that `PetAdvisorPopup.tsx` works with the newly fixed function.

## Todo List
- [ ] Overwrite `components/pet-advisor/groqApi.ts` with compiling, clean proxy delegation code.
- [ ] Run typescript compiler check locally.

## Success Criteria
- Frontend compiles successfully without TS syntax errors.

## Risk Assessment
- *Risk*: Code breaks if interface doesn't match `AiResultData`.
  - *Mitigation*: Ensure typescript typings are strictly followed.

## Security Considerations
- Direct client credentials removed.

## Next Steps
- Move to Phase 2: Deploy Backend changes.
