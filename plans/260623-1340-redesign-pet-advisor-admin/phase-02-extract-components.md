# Phase 2: Extract Components

## Context Links
- Master Plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1340-redesign-pet-advisor-admin/plan.md)
- Consultation Cards: [AdminPetAdvisorPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminPetAdvisorPage.tsx)
- Detailed Cards: [AdminPetAdvisorDetailPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminPetAdvisorDetailPage.tsx)

## Overview
- **Priority**: High
- **Status**: Planning
- **Description**: Modularize display cards, KPI counters, and detail panels to reuse styling, maintain responsiveness, and reduce page component lines.

## Related Code Files
- [NEW] [pet-advisor-cards.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/pet-advisor-cards.tsx)

## Implementation Steps
1. Create `src/components/admin/pet-advisor-cards.tsx`.
2. Implement and export `KpiCard` component.
3. Implement and export `SummaryCard` component.
4. Implement and export `DetailPanel` component.
5. Implement and export `InfoRow` component.
6. Make sure tailwind styles are preserved and correctly formatted.

## Todo List
- [ ] Create `src/components/admin/pet-advisor-cards.tsx`
- [ ] Export `KpiCard`, `SummaryCard`, `DetailPanel`, `InfoRow`
- [ ] Double-check tailwind responsiveness matches existing designs

## Success Criteria
- The components file compiles with no TS errors.
