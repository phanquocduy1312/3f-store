# Phase 3: Nâng cấp UI Component & Micro-interactions

## Context Links
- [ReasonsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ReasonsSection.tsx)
- [MotionSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/MotionSection.tsx)
- [globals.css](file:///c:/Users/Admin/Downloads/ccc/src/globals.css)
- [tailwind.config.ts](file:///c:/Users/Admin/Downloads/ccc/tailwind.config.ts)

## Overview
- **Priority:** High
- **Status:** ⬜ Pending
- **Mô tả:** Redesign component với layout, spacing, typography, và micro-interactions cấp chuyên nghiệp

## Key Insights
- Cards hiện tại padding đều nhau, thiếu visual hierarchy
- Hover effect chỉ dùng translate-y, cần phong phú hơn
- Background number "01, 02..." là idea hay nhưng quá mờ, cần tận dụng tốt hơn
- Trust pills có thể animate stagger khi scroll vào view

## Requirements

### A. Layout & Spacing Redesign

```
┌─────────────────────────────────────────────────┐
│  ⬤ Vì sao chọn chúng tôi                       │
│                                                  │
│  Vì sao hàng ngàn Boss          [Chính hãng 100%]│
│  tin chọn 3F Store?             [Freeship 299k]  │
│                                  [Hỗ trợ 24/7]  │
│                                                  │
│  ┌──────────────┐  ┌────────────┬────────────┐  │
│  │              │  │ 🛡️ 100%   │ 🚚 Giao    │  │
│  │  HERO CARD   │  │ Chính hãng │ siêu tốc   │  │
│  │  (dark bg)   │  │ [illustration]  [illustration]│  │
│  │  + hero img  │  │            │            │  │
│  │  + CTA       │  ├────────────┼────────────┤  │
│  │              │  │ 👨‍⚕️ Tư vấn│ 💰 Đổi trả │  │
│  │              │  │ chuyên gia │ 30 ngày    │  │
│  │              │  │ [illustration]  [illustration]│  │
│  └──────────────┘  └────────────┴────────────┘  │
│                                                  │
│  ┌─ Social proof counter bar ─────────────────┐  │
│  │  🐾 15,000+ Boss  │  ⭐ 4.9/5  │  📦 50k+  │  │
│  └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### B. Micro-interactions Chi tiết

| Element | Hiện tại | Nâng cấp |
|---|---|---|
| **Reason cards** | translateY(-8px) on hover | Scale(1.02) + subtle shadow bloom + icon rotate/bounce |
| **Hero card image** | scale(1.1) + rotate(-2deg) | Parallax float effect + glow pulse |
| **Trust pills** | translateY(-4px) | Stagger appear + icon spin on hover |
| **Section entry** | Basic fade-in | Stagger children with spring physics |
| **Stats counter** | ❌ Không có | Count-up animation khi scroll vào view |
| **Background** | Static blobs | Slow-moving gradient mesh |

### C. Typography Hierarchy
- Section badge: 12px, uppercase, letter-spacing 0.25em (giữ nguyên)
- Section heading: 56-64px, font-black, tracking-tighter (giữ nguyên)
- Card title: 24px → **28px**, font-black
- Card description: 16px → **16px**, line-height 1.7, color opacity 0.65 → 0.7
- Stats number: **36px**, font-black, gradient text

### D. Stats Counter Bar (Thêm mới)
- Thêm dải social proof bên dưới grid
- 3 metrics: "15,000+ thú cưng hạnh phúc" | "4.9/5 đánh giá" | "50,000+ đơn hàng"
- Count-up animation khi scroll vào viewport
- Glassmorphism background

## Related Code Files
- **[MODIFY]** [ReasonsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ReasonsSection.tsx) — Redesign toàn bộ component
- **[MODIFY]** [store.ts](file:///c:/Users/Admin/Downloads/ccc/data/store.ts) — Thêm stats data
- **[MODIFY]** [globals.css](file:///c:/Users/Admin/Downloads/ccc/src/globals.css) — Thêm keyframes cho count-up, gradient mesh

## Implementation Steps

### Step 1: Cập nhật data model
```typescript
// store.ts - reasons array mới
export const reasons = [
  {
    title: "100% Chính hãng",
    description: "Nhập khẩu trực tiếp từ nhà sản xuất...",
    icon: ShieldCheck,
    image: "/assets/images/reason-quality.webp",
    stats: "500+",
    statsLabel: "thương hiệu",
    accentColor: "emerald",
  },
  // ...
];

export const reasonStats = [
  { number: 15000, label: "thú cưng hạnh phúc", suffix: "+" },
  { number: 4.9, label: "đánh giá trung bình", suffix: "/5" },
  { number: 50000, label: "đơn hàng thành công", suffix: "+" },
];
```

### Step 2: Redesign reason cards
- Thêm image container phía trên icon
- Gradient border on hover
- Number background lớn hơn, opacity cao hơn
- Stagger animation cho children

### Step 3: Thêm stats counter bar
- Hook `useCountUp` hoặc inline với Framer Motion `useInView`
- Glassmorphism container
- 3-column responsive layout

### Step 4: Nâng cấp hero card
- Parallax image effect
- Gradient overlay cải thiện
- CTA button animation (pulse ring effect)

### Step 5: Polish animations
- Spring physics cho stagger
- Reduce motion support (đã có `useReducedMotion`)
- Performance audit — tránh layout thrash

## Todo List
- [ ] Cập nhật data model (store.ts)
- [ ] Redesign reason card component
- [ ] Redesign hero card component
- [ ] Thêm stats counter bar
- [ ] Implement count-up animation
- [ ] Nâng cấp hover/scroll animations
- [ ] Thêm CSS keyframes mới
- [ ] Test responsive (mobile → desktop)
- [ ] Test animation performance

## Success Criteria
- Section tạo ấn tượng mạnh (WOW factor) khi scroll tới
- Mỗi card có visual hierarchy rõ ràng (image → icon → title → desc)
- Stats counter bar tạo social proof thuyết phục
- Animation mượt 60fps, không jank
- Responsive hoàn hảo trên mọi breakpoint
- Accessible (reduced motion support)

## Risk Assessment
- **File size:** ReasonsSection.tsx hiện 148 dòng → có thể vượt 200 dòng sau redesign → cần tách thành sub-components nếu cần
- **Performance:** Quá nhiều animation có thể gây lag trên mobile → dùng `will-change`, tránh animating layout properties
- **Image loading:** 5 ảnh mới có thể chậm → dùng lazy loading + webp + placeholder blur

## Mitigation
- Tách `ReasonCard`, `StatsBar` thành components riêng nếu file > 200 dòng
- Dùng `transform` và `opacity` cho animation (GPU-accelerated)
- Implement `loading="lazy"` trên tất cả ảnh reason cards
