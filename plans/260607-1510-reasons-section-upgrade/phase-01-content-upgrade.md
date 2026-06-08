# Phase 1: Nâng cấp Nội dung & Copywriting

## Context Links
- [ReasonsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ReasonsSection.tsx)
- [store.ts - reasons data](file:///c:/Users/Admin/Downloads/ccc/data/store.ts#L98-L103)

## Overview
- **Priority:** High
- **Status:** ⬜ Pending
- **Mô tả:** Viết lại toàn bộ nội dung cho section với copywriting chuyên nghiệp, tập trung vào cảm xúc pet owner

## Key Insights
- Copy hiện tại quá ngắn và generic ("Dịch vụ tận tâm", "Nhiều lựa chọn vận chuyển")
- Cần storytelling - kết nối cảm xúc với pet owner
- Mỗi reason card cần mô tả 2-3 dòng để tạo trust

## Requirements

### Nội dung cần viết lại

#### 1. Section Header
- **Hiện tại:** "Chất lượng đích thực cho tình yêu đích thực"
- **Đề xuất:** "Vì sao hàng ngàn **Boss** tin chọn 3F Store?" hoặc "Yêu thú cưng không chỉ bằng lời, mà bằng **chất lượng**"
- Subtitle ngắn gọn bổ sung context

#### 2. Hero Card (Left - Dark green card)
- **Hiện tại:** "Sản phẩm tuyệt hảo, cho sếp sòng nhà bạn"
- **Đề xuất nâng cấp:**
  - Heading: "**Dinh dưỡng chuẩn mực** cho thành viên đặc biệt nhất"
  - Body: "Mỗi sản phẩm tại 3F Store đều được chọn lọc kỹ lưỡng bởi đội ngũ chuyên gia dinh dưỡng thú y — để bạn yên tâm, Boss luôn khỏe mạnh."
  - CTA: "Xem bộ sưu tập →"

#### 3. Reason Cards (4 cards bên phải)

| # | Hiện tại | Đề xuất Title | Đề xuất Description |
|---|---|---|---|
| 01 | Chất lượng đảm bảo / Sản phẩm chính hãng, kiểm định rõ ràng | **100% Chính hãng** | Nhập khẩu trực tiếp từ nhà sản xuất. Mỗi sản phẩm đều có tem xác thực và chứng nhận kiểm định an toàn. |
| 02 | Giao hàng nhanh / Nhiều lựa chọn vận chuyển | **Giao siêu tốc 2h** | Đặt hàng trước 14h — nhận hàng trong ngày tại TP.HCM & Hà Nội. Giao toàn quốc chỉ 24-48h. |
| 03 | Yêu thú như người thân / Dịch vụ tận tâm | **Tư vấn từ chuyên gia** | Đội ngũ bác sĩ thú y hỗ trợ 24/7. Tư vấn miễn phí về dinh dưỡng, sức khỏe và hành vi thú cưng. |
| 04 | Cam kết hoàn tiền / Hoàn tiền nếu không đúng mô tả | **Đổi trả 30 ngày** | Không hài lòng? Hoàn tiền 100% trong 30 ngày — không điều kiện, không rắc rối. |

#### 4. Trust Pills (giữ nguyên concept, nâng cấp copy)
- "✓ Chính hãng 100%" → thêm con số
- "🚚 Freeship từ 299k" → thực tế hơn
- "💬 Hỗ trợ 24/7" → cụ thể hơn

## Related Code Files
- **[MODIFY]** [store.ts](file:///c:/Users/Admin/Downloads/ccc/data/store.ts) — Cập nhật `reasons` array với nội dung mới, thêm field `stats` (con số thống kê)
- **[MODIFY]** [ReasonsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ReasonsSection.tsx) — Cập nhật copy trong component

## Implementation Steps
1. Cập nhật `reasons` data trong `store.ts` — thêm `stats` field cho mỗi reason
2. Cập nhật heading, subtitle trong `ReasonsSection.tsx`
3. Cập nhật hero card content
4. Cập nhật trust pills content

## Todo List
- [ ] Cập nhật reasons data model trong store.ts
- [ ] Viết lại section heading & subtitle
- [ ] Viết lại hero card content
- [ ] Cập nhật trust pills
- [ ] Verify nội dung hiển thị đúng

## Success Criteria
- Nội dung tạo cảm xúc, có số liệu cụ thể
- Mỗi reason card có mô tả >= 2 dòng
- Copy nhất quán với tone of voice thương hiệu pet store
