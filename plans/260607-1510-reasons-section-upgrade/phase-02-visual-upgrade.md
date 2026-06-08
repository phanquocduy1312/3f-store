# Phase 2: Nâng cấp Hình ảnh & Visual Design

## Context Links
- [ReasonsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ReasonsSection.tsx)
- [Images directory](file:///c:/Users/Admin/Downloads/ccc/public/assets/images)

## Overview
- **Priority:** High
- **Status:** ⬜ Pending
- **Mô tả:** Tạo hình ảnh minh họa chuyên nghiệp cho mỗi reason card, nâng cấp hero card visual

## Key Insights
- 4 reason cards hiện tại chỉ có icon, không có hình ảnh → trông trống rỗng, thiếu sức thuyết phục
- Hero card bên trái có ảnh sản phẩm nhưng bị cắt (overflow hidden) → cần hình chất lượng hơn
- Cần hình ảnh thú cưng dễ thương + sản phẩm để tạo emotional connection

## Requirements

### Hình ảnh cần tạo (AI Generated)

| # | Mô tả hình ảnh | Sử dụng cho | Style |
|---|---|---|---|
| 1 | **Hero image** — chó/mèo vui vẻ bên cạnh túi thức ăn premium, nền trong suốt | Hero card (left) | 3D illustration, warm lighting |
| 2 | **Quality badge** — huy hiệu chất lượng với sản phẩm, shield icon | Card "100% Chính hãng" | Flat illustration, emerald tones |
| 3 | **Fast delivery** — xe giao hàng cute với thú cưng, speed lines | Card "Giao siêu tốc" | Flat illustration, dynamic |
| 4 | **Expert care** — bác sĩ thú y đang chăm sóc thú cưng | Card "Tư vấn chuyên gia" | Warm illustration, friendly |
| 5 | **Money back** — biểu tượng hoàn tiền với heart, pet paw | Card "Đổi trả 30 ngày" | Flat illustration, trust colors |

### Visual Design Upgrades
- Mỗi reason card thêm illustration nhỏ (80x80 hoặc 100x100) thay thế icon đơn giản
- Hero card: ảnh lớn hơn, có depth effect (parallax nhẹ khi hover)
- Background: thêm subtle pattern/texture thay vì flat color

## Related Code Files
- **[CREATE]** `public/assets/images/reason-quality.webp` — ảnh cho card chất lượng
- **[CREATE]** `public/assets/images/reason-delivery.webp` — ảnh cho card giao hàng
- **[CREATE]** `public/assets/images/reason-expert.webp` — ảnh cho card tư vấn
- **[CREATE]** `public/assets/images/reason-refund.webp` — ảnh cho card hoàn tiền
- **[CREATE]** `public/assets/images/reasons-hero.webp` — ảnh hero chính
- **[MODIFY]** [ReasonsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ReasonsSection.tsx) — Tích hợp hình ảnh mới
- **[MODIFY]** [store.ts](file:///c:/Users/Admin/Downloads/ccc/data/store.ts) — Thêm image path vào reasons data

## Implementation Steps
1. Generate 5 hình ảnh bằng AI (generate_image tool)
2. Lưu vào `public/assets/images/`
3. Thêm `image` field vào reasons data model
4. Cập nhật reason cards để hiển thị hình ảnh
5. Tối ưu kích thước ảnh

## Todo List
- [ ] Generate hero image
- [ ] Generate 4 reason card illustrations
- [ ] Cập nhật data model với image paths
- [ ] Tích hợp hình ảnh vào component
- [ ] Kiểm tra lazy loading & performance

## Success Criteria
- Mỗi reason card có hình ảnh minh họa phù hợp
- Hero card visual ấn tượng, tạo focal point
- Ảnh load nhanh (webp, lazy loading)
- Tổng thể section nhìn "đầy đặn" hơn, không còn khoảng trống thừa
