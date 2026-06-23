# Phase 3: UI Redesign of PetsPage

## Context Links
- [PetsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/PetsPage.tsx)

## Overview
- Priority: High
- Current Status: Pending
- Description: Overhaul the "Hồ sơ thú cưng" page to show pet details along with their corresponding AI Consultation advice history.

## Requirements
- Replace manual pet creation action: clicking "Thêm thú cưng" / "Thêm hồ sơ" must dispatch the `open-pet-advisor` event to open the AI advisor quiz instead of the local form.
- Inside each pet card in the list, if `aiResult` is present:
  - Parse the JSON advice data.
  - Display a clean summary of the AI advice.
  - Show a "Chi tiết tư vấn AI" button or expander.
  - When clicked, open a modal displaying:
    - **Tóm tắt tư vấn**: advice text, detected needs.
    - **Phân tích ngân sách**: monthly budget and segment.
    - **Sản phẩm đề xuất**: list of recommended products with reason, matched needs.
    - **Mẹo chăm sóc**: list of care tips.
    - **Cảnh báo khẩn cấp**: warning text (if present).
- Keep species, breed, gender, birthday, and weight details displayed on the card.
- Allow updating basic details or deleting the profile as normal.

## Related Code Files
- [PetsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/PetsPage.tsx) [MODIFY]

## Todo List
- [ ] Connect "Thêm thú cưng" click to `open-pet-advisor` event trigger.
- [ ] Render basic pet details plus a summary of AI advice.
- [ ] Implement an interactive modal / accordion to inspect the full AI consultation detail.
