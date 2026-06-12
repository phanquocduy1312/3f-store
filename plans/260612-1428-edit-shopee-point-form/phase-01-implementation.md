# Phase 1: Implementation - Edit Shopee Point Form

## Context Links

- Scout report: [scout-edit-shopee-point-form.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260612-1428-edit-shopee-point-form.md)
- Main plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1428-edit-shopee-point-form/plan.md)

## Overview

- **Priority**: High
- **Status**: Planning
- **Description**: Add state variables to input fields, implement state-driven validation, handle submission and save to localStorage, display a warning if submitting without an image, and design a premium success feedback view.

## Key Insights

- Standard validation:
  - Phone: required, 9-11 digits (after stripping spaces).
  - Email: optional, format validated only if provided.
  - Order Code: required.
  - Order Amount: required, numeric > 0.
- Warning UI: Inline alert under image input if no image is uploaded.
- Success view: Replace the form card with a green-accented check card and clear, friendly text with a "Gửi đơn khác" (Submit another) button.

## Requirements

- Email label "Email (không bắt buộc)", placeholder "Nhập email của bạn nếu muốn nhận thông báo".
- Email error display: Only show email format error message when email is filled and incorrect.
- SĐT error display: Show error message if phone is filled but incorrect length/format.
- Helper text under image upload button: "Khuyến khích tải ảnh để 3F xác minh nhanh hơn."
- Warning text if image not uploaded: "Bạn có thể gửi không kèm ảnh, tuy nhiên thời gian xác minh có thể lâu hơn."
- Button disabled state: Only depends on `phone`, `orderCode`, and `amount` being valid.

## Related Code Files

- [components/threeFclup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/threeFclup.tsx) [MODIFY]

## Implementation Steps

1. Bind form inputs to state:
   - `phone` (with error state `phoneError`)
   - `email` (with error state `emailError`)
   - `orderCode`
   - `amount`
   - `uploadedImage` (with value/image preview URL or file name)
2. Handle validation functions:
   - SĐT validation on blur or change: check for length 9-11 after stripping spaces.
   - Email validation on blur or change: if non-empty, test against basic regex.
3. Update the submit button `disabled` condition: `!phone || phoneError || !orderCode || !amount || parseFloat(amount) <= 0 || !!emailError`.
4. Implement form submission:
   - Call `loadShopeeRequests()`
   - Push new `ShopeePointRequest` object into the array
   - Save via `persistShopeeRequests()`
   - Set `isSubmitted` state to `true`
5. Render the success view replacement when `isSubmitted` is true.

## Todo List

- [ ] Bind state hooks to form inputs in `components/threeFclup.tsx`.
- [ ] Add field validation logic (Email optional, SĐT required, helper text and warnings).
- [ ] Update Submit button disable/enable logic.
- [ ] Implement `onSubmit` that writes to local storage.
- [ ] Render success block matching Yêu cầu 6.
- [ ] Test form submission with and without optional fields (Email and image).

## Success Criteria

- Email field labeled "(không bắt buộc)" with no asterisk.
- Form submits successfully if Email is empty or Image is missing.
- Form blocks submission if Email is invalid, or if Phone/Order Code/Amount is missing/invalid.
- LocalStorage contains the newly created payload.
- Successful submission shows the correct messaging.
- No TypeScript compiler errors.
