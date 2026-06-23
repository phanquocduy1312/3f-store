# Phase 5: Transition to Pure AI Advice History

## Context Links
- [PetsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/PetsPage.tsx)
- [PetAdviceModal.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/Account/PetAdviceModal.tsx)
- [CustomerPetController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerPetController.php)
- [customerPetsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerPetsApi.ts)

## Overview
- Priority: High
- Current Status: Pending
- Description: Transition the page and API to focus purely on "AI Advice History", removing profile-like fields from the main view and placing them inside the advice modal for context.

## Requirements
- Update `CustomerPetController.php` to include `createdAt` (populated from `created_at` timestamp) in the returned pet list.
- Update `customerPetsApi.ts` interface `PetData` to include `createdAt`.
- Redesign `PetsPage.tsx` list cards:
  - Focus card title on the AI consultation session (e.g. "Tư vấn dinh dưỡng cho bé [Name]" or "Kết quả tư vấn AI").
  - Use `createdAt` to show the correct "Ngày tư vấn" (Consultation Date) instead of using `birthday`.
  - Remove profile-only fields ("Cân nặng", "Món thích", "Dị ứng", "Ghi chú sức khỏe") from the card view.
- Enhance `PetAdviceModal.tsx`:
  - Add a dedicated "Thông tin đầu vào của bé" (Pet Context Inputs) section displaying details submitted during the quiz (Species, Breed, Weight, Current food, Health issue/Notes) so the advice history remains fully context-aware when reviewed.

## Related Code Files
- [CustomerPetController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerPetController.php) [MODIFY]
- [customerPetsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerPetsApi.ts) [MODIFY]
- [PetsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/PetsPage.tsx) [MODIFY]
- [PetAdviceModal.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/Account/PetAdviceModal.tsx) [MODIFY]

## Todo List
- [ ] Add `createdAt` to API responses and TypeScript types.
- [ ] Remove pet profile list fields from `PetsPage.tsx` and switch to clean consultation history layout.
- [ ] Add pet input details as context section inside `PetAdviceModal.tsx`.
- [ ] Verify compilation and runtime builds.
