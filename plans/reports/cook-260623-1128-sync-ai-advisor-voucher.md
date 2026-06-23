# Cook Report: Sync AI Advisor Voucher Shape and Constraint

- **Date**: 2026-06-23
- **Time**: 11:28
- **Task Description**: Sync AI advisor voucher card styling and enforce single-active-voucher constraint.

## Completed Work

### 1. Synchronized AI Result Voucher Shape
- Modified [AiResult.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/AiResult.tsx) to match the homepage's `VoucherCard` style precisely.
- Replaced the previous `h-[100px]` container styling with the premium, responsive layout:
  - Height is synced to `h-[115px] sm:h-[140px]` with rounded corners `rounded-xl sm:rounded-[1.25rem]`.
  - Left gradient block width: `w-[48px] sm:w-[110px]`.
  - Circle notches left position: `left-[42px] sm:left-[104px]`.
  - Circle notches background is `bg-white` (since the modal background is white) with a `shadow-inner` effect.
  - Dashed separation line: `left-[47px] border-l-[2px] border-dashed border-white/40 sm:left-[109px] sm:border-l-[3px]`.
  - Added the subtle background paw prints inside the left block for desktop size.
  - Kept copying capability with standard `COPY MÃ` / `ĐÃ COPY` text.

### 2. Enforced Single-Active-Voucher Admin UI Hint
- Modified [AdminVouchersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminVouchersPage.tsx) to add a clear warning text underneath the toggles.
- When the admin checks the "Tư vấn AI" toggle, it displays:
  `⚠️ Lưu ý: Chỉ được phép bật tối đa 1 voucher cho Tư vấn AI. Khi lưu, cờ "Tư vấn AI" trên các voucher khác sẽ tự động tắt.`
- The backend model (`Coupon.php`) already clears other coupons automatically upon saving a voucher with `show_in_ai_advisor = 1`.

## Verification
- Ran static type checking (`npx tsc --noEmit`) and it completed successfully with no errors.
- Visual elements are fully aligned and responsive.
