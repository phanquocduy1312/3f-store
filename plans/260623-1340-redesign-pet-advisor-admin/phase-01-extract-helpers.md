# Phase 1: Extract Helpers

## Context Links
- Master Plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1340-redesign-pet-advisor-admin/plan.md)
- Consultation List Page: [AdminPetAdvisorPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminPetAdvisorPage.tsx)
- Consultation Detail Page: [AdminPetAdvisorDetailPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminPetAdvisorDetailPage.tsx)

## Overview
- **Priority**: High
- **Status**: Planning
- **Description**: Extract types, helper functions, and constants from the page files to a unified helper module, lowering file sizes to adhere to the 200-line limit.

## Related Code Files
- [NEW] [pet-advisor-helpers.ts](file:///c:/Users/Admin/Downloads/ccc/src/utils/pet-advisor-helpers.ts)

## Implementation Steps
1. Create `src/utils/pet-advisor-helpers.ts`.
2. Move `ConsultationRecord` and `AdvisorAnswer` types to the new file.
3. Move `speciesLabel` constant mapping to the new file.
4. Move and export `parseAdvice`, `formatDate`, `formatMoney`, `listText`, `findAnswer`, and `getMeta` functions to the helper module.
5. Add explanatory JSDoc comments to all exported items.

## Todo List
- [ ] Create `src/utils/pet-advisor-helpers.ts`
- [ ] Extract types and helpers from `AdminPetAdvisorDetailPage.tsx`
- [ ] Verify exports compile correctly

## Success Criteria
- The helper file compiles correctly and exposes all required types and functions.
