# Phase 2: Phát triển Trang Analytics UI & Biểu đồ Recharts

## Context Links
- [AdminAnalyticsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminAnalyticsPage.tsx)
- [package.json](file:///c:/Users/Admin/Downloads/ccc/package.json)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Phát triển giao diện Trang Analytics cho quản trị viên, sử dụng thư viện Recharts vẽ các biểu đồ trực quan, đúng nghiệp vụ bán hàng thú cưng, Loyalty, Marketing và CRM.

## Key Insights
- Recharts là thư viện trực quan hóa rất mạnh và đã được cài đặt trong `package.json`. Ta nên sử dụng các component như `AreaChart`, `BarChart`, `PieChart`, `Cell`, `Tooltip`, `Legend`, `ResponsiveContainer`.
- Thiết kế Bento Grid giúp phân chia bố cục báo cáo rõ ràng và gọn gàng trên mọi màn hình.

## Requirements
- Dùng bộ lọc kỳ báo cáo ở đầu trang (Hôm nay, 7 ngày qua, 30 ngày qua, Tháng này, Năm nay, Tất cả).
- Layout chia làm 4 tab phân tích:
  1. **Doanh số & Vận hành**: Biểu đồ doanh thu & đơn hàng (Area + Bar), Phễu đơn hàng (Funnel/Bar ngang), tỷ lệ thanh toán/giao hàng.
  2. **Loyalty & Khách hàng**: Tỷ lệ tích/tiêu điểm (Line), Phân bố hạng thành viên (Pie/Donut), Số lượng khách mới đăng ký.
  3. **Thú cưng & AI**: Phân bố loài (Chó/Mèo/Khác - Donut), Vấn đề sức khỏe thú cưng từ AI Advisor (BarChart đứng xếp theo độ phổ biến).
  4. **Tiếp thị & Voucher**: Hiệu năng Click/View Banner (BarChart đôi), Thống kê sử dụng Voucher (Top voucher hiệu quả).
- Thiết kế premium: Tone màu tối giản thanh lịch, hiệu ứng hover, loading skeleton mượt mà.

## Architecture
- Component chính: `AdminAnalyticsPage.tsx`
- Layout: Bento Grid với Tailwind CSS.
- Biểu đồ: Recharts components.

## Related Code Files
- [NEW] [AdminAnalyticsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminAnalyticsPage.tsx)

## Implementation Steps
1. **Thiết lập Khung Trang**: Tạo file `AdminAnalyticsPage.tsx` với cấu trúc Admin Layout tiêu chuẩn (Sidebar + Header + Main Content).
2. **Xây dựng State & Fetching**: Tải dữ liệu từ `adminAnalyticsApi` dựa trên kỳ đã lọc. Dùng tab state để chuyển đổi giữa 4 phân hệ báo cáo.
3. **Vẽ Biểu đồ Doanh thu & Vận hành**:
   - AreaChart vẽ Doanh số lũy tiến hoặc doanh số theo ngày.
   - BarChart vẽ Phễu đơn hàng (Funnel) từ trạng thái tạo đơn đến hoàn tất.
4. **Vẽ Biểu đồ Loyalty & Khách hàng**:
   - LineChart vẽ Biểu đồ điểm Loyalty earned vs redeemed theo thời gian.
   - PieChart/Donut vẽ Cơ cấu hạng thành viên (Member, Silver, Gold, Diamond).
5. **Vẽ Biểu đồ Thú cưng & AI**:
   - PieChart cơ cấu loài thú cưng.
   - BarChart đứng vẽ tần suất các nhu cầu của bé (Kén ăn, Tiêu hóa, Da lông...).
6. **Vẽ Biểu đồ Tiếp thị**:
   - BarChart đôi vẽ Banner Impressions vs Clicks.
   - Bảng xếp hạng hoặc Bar Chart cho hiệu suất sử dụng Voucher.
7. **Đánh bóng Visual**: Thêm Skeletons khi tải trang, empty states nếu chưa có dữ liệu.

## Todo List
- [ ] Tạo file `AdminAnalyticsPage.tsx`
- [ ] Dựng khung layout, sidebar, header và tab selector
- [ ] Viết các components biểu đồ dùng Recharts tích hợp dữ liệu thật
- [ ] Thiết kế Skeleton Loading và Empty State đẹp mắt

## Success Criteria
- Giao diện đẹp mắt, chuyên nghiệp, responsive hoàn chỉnh trên cả mobile và desktop.
- Biểu đồ tương tác mượt mà (có tooltips, hiệu ứng hover).
- Dữ liệu hiển thị chính xác từ API thật.

## Risk Assessment
- Nếu chưa có đủ dữ liệu thật trong DB, biểu đồ có thể bị rỗng.
- Khắc phục: Code sẵn mock-fallback thông minh để trang luôn hiển thị sinh động và đúng nghiệp vụ kể cả khi cơ sở dữ liệu ít bản ghi.

## Security Considerations
- Chặn truy cập trái phép bằng Route Guard đã có sẵn ở App.tsx.
