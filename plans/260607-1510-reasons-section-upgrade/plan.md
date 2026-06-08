---
title: "Nâng cấp ReasonsSection - UI/UX Chuyên nghiệp"
description: "Redesign toàn diện section 'Vì sao chọn chúng tôi' với nội dung, hình ảnh, và UI/UX cấp chuyên nghiệp"
status: planning
priority: high
effort: medium
branch: feature/reasons-section-upgrade
tags: [ui-ux, redesign, content, pet-store]
created: 2026-06-07
---

# Nâng cấp ReasonsSection - UI/UX Chuyên nghiệp

## Phân tích hiện trạng

### Vấn đề hiện tại (Từ góc nhìn UX Expert)

| Hạng mục | Vấn đề | Mức độ |
|---|---|---|
| **Nội dung** | Copy quá generic, không tạo cảm xúc. Mô tả quá ngắn, thiếu chi tiết thuyết phục | 🔴 Cao |
| **Hình ảnh** | Chỉ có 1 ảnh sản phẩm duy nhất, 4 reason cards không có hình ảnh minh họa | 🔴 Cao |
| **Icon** | Dùng icon Lucide cơ bản, thiếu personality cho pet store | 🟡 Trung bình |
| **Layout** | Grid 2 cột bên phải bị trống (thiếu visual content), cards nhỏ thiếu chiều sâu | 🟡 Trung bình |
| **Interaction** | Hover effects cơ bản, thiếu storytelling animation | 🟡 Trung bình |

### Điểm mạnh giữ lại
- ✅ Motion animation framework (Framer Motion) đã có sẵn
- ✅ Color palette forest green nhất quán
- ✅ Layout grid responsive đã tốt
- ✅ Trust pills (Hàng chính hãng, Giao nhanh...) concept hay

---

## Phases

| Phase | Mô tả | Status |
|---|---|---|
| [Phase 1](./phase-01-content-upgrade.md) | Nâng cấp nội dung & copywriting | ⬜ Pending |
| [Phase 2](./phase-02-visual-upgrade.md) | Nâng cấp hình ảnh & visual design | ⬜ Pending |
| [Phase 3](./phase-03-ui-component-upgrade.md) | Nâng cấp UI component & interactions | ⬜ Pending |

## Key Dependencies
- Framer Motion (đã có)
- Tailwind CSS (đã có)
- Lucide React icons (đã có)
- AI Image Generation (cho hình ảnh minh họa mới)

## Verification
- `npm run dev` không lỗi
- Kiểm tra responsive trên mobile/tablet/desktop
- Kiểm tra animation performance (no jank)
