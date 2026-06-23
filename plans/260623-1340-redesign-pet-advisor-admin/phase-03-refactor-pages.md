# Phase 3: Refactor Pages

## Context Links
- Master Plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1340-redesign-pet-advisor-admin/plan.md)
- Helper Module: [pet-advisor-helpers.ts](file:///c:/Users/Admin/Downloads/ccc/src/utils/pet-advisor-helpers.ts)
- Component Module: [pet-advisor-cards.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/pet-advisor-cards.tsx)

## Overview
- **Priority**: High
- **Status**: Planning
- **Description**: Clean up `AdminPetAdvisorPage.tsx` and `AdminPetAdvisorDetailPage.tsx` by deleting duplicate code, importing newly created helpers/components, and keeping both page files below 200 lines.

## Related Code Files
- [MODIFY] [AdminPetAdvisorPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminPetAdvisorPage.tsx)
- [MODIFY] [AdminPetAdvisorDetailPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminPetAdvisorDetailPage.tsx)

## Implementation Steps
1. Open `src/pages/admin/AdminPetAdvisorPage.tsx`. Remove the local declarations of `ConsultationRecord`, `speciesLabel`, `parseAdvice`, `formatDate`, `formatMoney`, and `KpiCard`.
2. Import these types/helpers/components from `src/utils/pet-advisor-helpers` and `src/components/admin/pet-advisor-cards`.
3. Verify that `AdminPetAdvisorPage.tsx` is under 200 lines and matches requirements.
4. Open `src/pages/admin/AdminPetAdvisorDetailPage.tsx`. Remove the local declarations of `ConsultationRecord`, `AdvisorAnswer`, `speciesLabel`, `parseAdvice`, `formatDate`, `formatMoney`, `listText`, `findAnswer`, `getMeta`, `SummaryCard`, `DetailPanel`, and `InfoRow`.
5. Import them from `src/utils/pet-advisor-helpers` and `src/components/admin/pet-advisor-cards`.
6. Verify that `AdminPetAdvisorDetailPage.tsx` is under 200 lines and compiles cleanly.

## Todo List
- [ ] Refactor `AdminPetAdvisorPage.tsx`
- [ ] Refactor `AdminPetAdvisorDetailPage.tsx`
- [ ] Verify both files are under 200 lines of code

## Success Criteria
- Both pages compile, render correct content, and have sizes <= 200 lines.
