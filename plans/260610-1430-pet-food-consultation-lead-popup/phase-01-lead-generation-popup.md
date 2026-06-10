# Phase 01: Lead Generation Popup

**Context Links**
- [plan.md](plan.md)
- [scout-260610-1430-pet-food-consultation-lead-popup.md](../reports/scout-260610-1430-pet-food-consultation-lead-popup.md)
- [Home.tsx](../../src/pages/Home.tsx)

**Overview**
- Priority: High
- Current status: Completed
- Description: Implements the popup component `ConsultationPopup.tsx` and integrates it into `Home.tsx`.

**Key Insights**
- The popup should be shown 5-10 seconds after page load. A delay of 7 seconds is chosen to balance user discovery with immediate engagement.
- To prevent spamming users who already closed the popup or clicked through, we'll store a flag `has_seen_consultation_popup` in `sessionStorage` (so it only displays once per browsing session).
- Layout uses a responsive flex/grid structure:
  - On desktop, it is split 40% (image) / 60% (copy and CTA).
  - On mobile, it defaults to a clean single column layout to avoid cramping.
  - Transparent-background PNG asset `/assets/images/dog_cat_heart_rbg.png` is positioned on the left, cropped beautifully.

**Requirements**
- **Aesthetic**: White background card, `rounded-3xl` or similar large rounding, strong soft shadow (`shadow-2xl` or `shadow-lift`), blurred dark backdrop (`backdrop-blur-md bg-black/40`).
- **Delayed Trigger**: `setTimeout` for 7 seconds.
- **Copy Content**:
  - Paw Icon + "TÌM THỨC ĂN PHÙ HỢP CHO BÉ" (Bold, Primary brand blue).
  - "Chỉ mất 30 giây" subtitle (with "30 giây" highlighted/underlined in blue).
  - Checklist with 3 items ("Gợi ý sản phẩm phù hợp", "Voucher 30.000đ", "Checklist chăm sóc miễn phí").
  - "Bắt đầu" CTA button (Royal Blue with right chevron arrow in a white circle).
- **Animations**: `framer-motion` for backdrop fade-in and card scale-up / slide-in from bottom.

**Related Code Files**
- [NEW] `components/ConsultationPopup.tsx`
- [MODIFY] `src/pages/Home.tsx`

**Implementation Steps**
1. Create `components/ConsultationPopup.tsx` implementing the state, timeout logic, session storage check, Framer Motion wrapper, and pixel-perfect styling.
2. Update `src/pages/Home.tsx` to render the `<ConsultationPopup />` component.
3. Verify the implementation:
   - Check that it compiles without errors.
   - Run manual/visual inspection of the design, ensuring perfect color matches, alignment, and responsiveness.
   - Test close behavior and button hover interactions.

**Todo List**
- [x] Create `components/ConsultationPopup.tsx`
- [x] Integrate into `src/pages/Home.tsx`
- [x] Verify build and design alignment

**Success Criteria**
- The popup triggers after exactly 7 seconds on the home page.
- Background gets blurred and darkened, overlaying all page elements.
- The UI is identical to the design screenshot with high fidelity.
- Clicking the Close button or the CTA dismisses the popup and prevents it from appearing again in the same session.

**Risk Assessment**
- *Asset pathing issue*: Check if `/assets/images/dog_cat_heart_rbg.png` works.
  - *Mitigation*: Verify the path `/assets/images/dog_cat_heart_rbg.png` resolves from public assets in other components like `threeFclup.tsx` (it does!).
