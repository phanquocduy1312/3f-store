# Phase 1: Implementation - Shopee Manual Request Modal

## Context Links

- Scout report: [scout-260612-1355-shopee-manual-request-modal.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260612-1355-shopee-manual-request-modal.md)
- Main plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1355-shopee-manual-request-modal/plan.md)

## Overview

- **Priority**: High
- **Status**: Planning
- **Description**: Design and build the `ShopeeManualRequestModal` component, update types, and integrate it into `ShopeeRequestsPage.tsx` using `localStorage` for persistence.

## Key Insights

- Keep styling strictly aligned with the designs: `#0057E7` (primary blue), `#0B1F3A` (textMain), `#F6FAFF` (lightBg), and `#DCEBFF` (border).
- Realtime point calculation: `expectedPoints = Math.floor(amount / 10000)`.
- If order code already exists in existing requests, display a soft warning underneath the input.
- Support key events like ESC to close, and confirmation alert if form has unsaved modifications and is closed via backdrop click.

## Requirements

- Responsive layout: 2 columns on desktop, 1 column on mobile.
- Form inputs: Phone number (required, 9-11 digits), customer name, email (optional, pattern validated), Zalo (optional), Shopee order code (required, duplicate warning), order amount (required, > 0, currency format), purchase date, and source of receipt (select menu).
- Image proof preview: support file select and preview using `URL.createObjectURL(file)`.
- Submit button disabled until mandatory fields are valid. Show simulate loading for 300-500ms when clicked.
- Save to localStorage using standard format.

## Architecture

```
ShopeeRequestsPage (State: requests, isManualModalOpen)
   └── ShopeeManualRequestModal (Props: open, onClose, onSubmit, existingRequests)
```

## Related Code Files

- [types/shopee.ts](file:///c:/Users/Admin/Downloads/ccc/types/shopee.ts) [MODIFY]
- [components/admin/shopee/ShopeeManualRequestModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/ShopeeManualRequestModal.tsx) [NEW]
- [src/pages/admin/ShopeeRequestsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ShopeeRequestsPage.tsx) [MODIFY]

## Implementation Steps

1. Update `types/shopee.ts` to add optional properties `source` and `receivedFrom`.
2. Create `ShopeeManualRequestModal.tsx` component with sections:
   - Header (title, subtitle, close icon).
   - Left Column: Customer details, Shopee order details, proof of purchase upload and preview, internal note.
   - Right Column: Automations summary (estimated points, status badge, source badge) with live point calculation feedback.
   - Footer: "Hủy" and "+ Tạo yêu cầu" buttons.
3. Hook up backdrop click checks and ESC key down listener.
4. Hook up input fields validations.
5. In `ShopeeRequestsPage.tsx`, add state `isManualModalOpen` and render the modal. Pass `requests` list to help with duplicate checks.
6. Handle `onSubmit` in `ShopeeRequestsPage.tsx` to insert the request, update state, save to local storage, show toast, and reset states.

## Todo List

- [ ] Modify `types/shopee.ts` to support source fields.
- [ ] Implement `ShopeeManualRequestModal.tsx`.
- [ ] Import and integrate modal in `ShopeeRequestsPage.tsx`.
- [ ] Connect the "+ Tạo yêu cầu thủ công" button to open the modal.
- [ ] Test mock submission, localStorage persistence, duplicate warnings, points calculation, and responsiveness.

## Success Criteria

- Opening the modal presents correct layout.
- Validation correctly blocks/enables the submit button.
- Submitting updates the list, tab counts, and stats immediately.
- Cancel or backdrop click functions correctly.
- No TypeScript or compilation errors.

## Risk Assessment

- Trashing existing local storage requests: Ensure we spread the old requests array and don't overwrite it.
- Keyboard navigation blocking: Backdrop click check should only trigger if the modal has changes.

## Security Considerations

- Basic validations to prevent garbage data.

## Next Steps

- Request approval on implementation plan, then proceed to code.
