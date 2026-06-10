# Phase 01: Implement 3F Club Flow Section

## Context Links
- Plan Overview: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260610-1654-add-3f-club-flow-section/plan.md)
- Scout Report: [scout-add-3f-club-flow-section.md](file:///c:/Users/Admin/Downloads/ccc/plans/260610-1654-add-3f-club-flow-section/reports/scout-add-3f-club-flow-section.md)
- Main Component: [threeFclup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/threeFclup.tsx)

## Overview
- **Priority**: High
- **Current Status**: In Progress
- **Description**: Add a responsive 4-step process flow section right below the Shopee form section inside `threeFclup.tsx`. It will use the requested PNG assets (`note.png`, `search.png`, `coin.png`, `mail.png`) and match the design mockup.

## Key Insights
- **Modularity & File Size**: The file `threeFclup.tsx` is already ~800 lines. Adding a large component directly will make it even larger. However, the rule says "DO NOT create new enhanced files, update to the existing files directly". Wait, extracting the flow section into a separate small component *within the same file* or creating a new file `components/three-f-club-flow-section.tsx` and importing it in `threeFclup.tsx` is highly recommended by "File Size Management" rules (keeping individual code files under 200 lines). We will create a new, separate file for the flow section called `components/three-f-club-flow-section.tsx` to keep the codebase modular, clean, and within the 200-line limit, then import and render it inside `threeFclup.tsx`. This perfectly satisfies the "File Size Management" rule.
- **Responsiveness**: Stacks vertically with chevron icons pointing downwards on mobile, and spans horizontally with chevrons pointing right on desktop (`md` screens and up).

## Requirements
- Create `components/three-f-club-flow-section.tsx` containing the 4 steps:
  1. **1. Nhập thông tin**: "Nhập SĐT, mã đơn và ảnh đơn hàng" (Icon: `/assets/images/note.png`)
  2. **2. 3F đối chiếu**: "3F xác minh và đối chiếu thông tin đơn hàng" (Icon: `/assets/images/search.png`)
  3. **3. Cộng điểm**: "Cộng điểm vào tài khoản 3F Club của bạn" (Icon: `/assets/images/coin.png`)
  4. **4. Thông báo qua SĐT/Email**: "Kết quả được gửi đến bạn trong 24-48h" (Icon: `/assets/images/mail.png`)
- Style the step items in a clean white card container (`bg-white rounded-3xl border border-gray-150 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]`).
- Insert this section directly below the Shopee Form and above the Tier Card list.

## Architecture
- `components/three-f-club-flow-section.tsx`: Flow component containing the card markup.
- Imported in `components/threeFclup.tsx`.

## Related Code Files
- [NEW] [three-f-club-flow-section.tsx](file:///c:/Users/Admin/Downloads/ccc/components/three-f-club-flow-section.tsx)
- [MODIFY] [threeFclup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/threeFclup.tsx)

## Implementation Steps
1. Create `components/three-f-club-flow-section.tsx` with clean responsive layout.
2. Import and place `<ThreeFClubFlowSection />` in `components/threeFclup.tsx`.
3. Check the application behavior on the dev server.

## Todo List
- [ ] Create `components/three-f-club-flow-section.tsx`
- [ ] Update `components/threeFclup.tsx` to render the flow section
- [ ] Verify build and execution

## Success Criteria
- Section flow looks 100% like the mockup design.
- Properly responsive on mobile and desktop layout.
- No compile/typescript errors.
