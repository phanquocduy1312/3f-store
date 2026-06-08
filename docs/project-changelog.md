# Project Changelog

## [2026-06-08]
### Added
- Thêm cơ chế tự động cuộn lên đầu trang (Scroll to Top) tại `src/App.tsx` mỗi khi chuyển đổi Route (location.pathname).
- Thêm `components/mobile-navigation-drawer.tsx` hiển thị menu dạng trượt mượt mà cho các thiết bị màn hình nhỏ.
- Thêm `components/product-filters.tsx` làm bộ lọc dùng chung cho trang danh mục, tích hợp drawer trên mobile.

### Changed
- Cập nhật `components/Header.tsx` để tích hợp Drawer Menu di động khi nhấn nút hamburger, đồng thời bổ sung `text-center w-full block` giúp căn giữa hoàn hảo các nhãn văn bản dưới các icon Tìm kiếm, Tài khoản, Giỏ hàng trên di động.
- Thay đổi `components/CategorySection.tsx` để hiển thị 2 cột danh mục trên mobile, đồng bộ khung hình vuông cho ảnh và đồng đều chiều cao thẻ (h-full) tránh lệch dòng.
- Sửa đổi `components/PetFoodSection.tsx` thêm khoảng đệm và thu gọn tỷ lệ hình ảnh thú cưng để tránh đè đè văn bản trên màn hình dọc.
- Sửa đổi `components/BigDealsSection.tsx` ẩn khung ảnh `sale.webp` cố định trên mobile, tự động xếp chồng nội dung Swiper cùng nền gradient forest đẹp mắt.
- Cập nhật `components/ProductListing.tsx` bổ sung nút "Lọc" nổi và ngăn trượt bộ lọc mở từ dưới lên (slide-up sheet) giúp trải nghiệm mua sắm trên điện thoại hoàn hảo.
- Tối ưu hóa layout `components/BlogNewsletter.tsx` ẩn hình trang trí dư thừa trên màn hình nhỏ để tăng độ hiển thị của biểu mẫu đăng ký.

### Fixed
- Sửa đổi `components/mobile-navigation-drawer.tsx` đổi từ `bg-cream/98` sang `bg-cream` (màu nền đục hoàn toàn) để sửa lỗi menu trong suốt làm chữ bị đè đè khó nhìn trên mobile.
- Khắc phục các lớp Tailwind CSS opacity không hợp chuẩn như `bg-cream/94` thành `bg-cream/[0.94]`, `bg-cream/35` thành `bg-cream/[0.35]` và `bg-cream/15` thành `bg-cream/[0.15]` để đảm bảo hệ thống CSS compile chính xác.

## [Unreleased]
- Chuẩn bị hệ thống Giỏ hàng và Checkout.

## [2026-06-07]
### Changed
- Nâng cấp toàn diện UI/UX trang chủ (Pro Max Level).
- Chuyển đổi Hero Section sang giao diện Bento Grid với slider và thẻ khuyến mãi riêng biệt.
- Áp dụng Glassmorphism và Claymorphism cho Category Section, tối giản hóa màu nền.
- Thiết kế lại giao diện Pet Food Section: bỏ ảnh mờ tràn lề, tập trung hiển thị clean product cards.
- Áp dụng Premium Dark Theme cho Sale Section (Flash Sale nền xanh forest đậm).
- Dọn dẹp lại background wrappers trong `Home.tsx`.

## [2026-06-05]
### Added
- Thư mục `docs/` để lưu trữ tài liệu hệ thống cho AI Agent theo chuẩn Antigravity Workflow.
- Cài đặt bộ rules và templates `.agent/` cho dự án.
- Trang Chi tiết Sản phẩm (ProductDetail) mới với thiết kế 2 cột: Gallery trượt theo (sticky) bên trái và thông tin mô tả chi tiết bên phải.
- Áp dụng các hiệu ứng animation và gradient cho ProductCard để tăng "wao" effect.

### Fixed
- Lỗi vỡ giao diện (không sticky được gallery) trong trang chi tiết do thuộc tính `overflow-hidden` trên `App.tsx` chặn lại. Đã chuyển thành `overflow-x-hidden`.

## [Earlier]
### Added
- Cấu trúc khung sườn dự án (Vite + React + Tailwind).
- Trang Chủ, trang Danh sách Sản phẩm.
- Mock data trong `store.ts`.
