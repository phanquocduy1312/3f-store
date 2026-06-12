# Project Changelog

## [2026-06-12]
### Changed
- Nâng cấp tính năng AI Pet Advisor Popup: bổ sung câu hỏi mô tả vấn đề tự do (`problem_text`), thay thế câu hỏi ngân sách tháng cũ bằng 2 câu hỏi chi tiết về mức mua mỗi lần (`purchase_amount_range`) và thời gian sử dụng (`usage_duration_range`).
- Nâng cấp logic xử lý phía AI (Groq API): tính toán ngân sách hàng tháng và phân khúc thực tế để tránh tư vấn sai lệch phân khúc sản phẩm.
- Thiết kế lại màn hình kết quả AI (`AiResult.tsx`): hiển thị rõ ràng thông tin AI hiểu thú cưng như thế nào (kèm các badge nhu cầu phát hiện), phân tích ngân sách chi tiết hàng tháng và phân chia 5 sản phẩm gợi ý thành 3 gói rõ rệt: Tiết kiệm (saving), Cân bằng (balanced), và Tốt hơn cho bé (premium) kèm badge lý do chi tiết và phân khúc tương ứng.
- Bổ sung trường tùy chọn nhập Tên của bé trong biểu mẫu liên hệ (`ContactForm.tsx`).

## [2026-06-10]
### Added
- Nâng cấp và triển khai hệ thống tư vấn dinh dưỡng AI đa bước `components/pet-advisor/` (chia tách thành các component nhỏ: `PetAdvisorPopup`, `QuizWelcome`, `QuizStep`, `OptionCard`, `ContactForm`, `AiLoading`, `AiResult`, `ProgressBar`, `FloatingPetButton`, `Mascot`, `quizConfig`, `mockAiResult` đảm bảo giới hạn dưới 200 dòng mỗi file).
- Tích hợp `<PetAdvisorPopup />` vào trang chủ `src/pages/Home.tsx`, trì hoãn tự động kích hoạt sau 7 giây, lưu trữ trạng thái đóng/hoàn thành bằng `localStorage` (không hiện lại trong 24h nếu đóng, không hiện lại trong 30 ngày nếu gửi form thành công).
- Bổ sung nút nổi tròn ở góc màn hình (`FloatingPetButton.tsx`) có hiệu ứng sóng rung động (ping ring) và châm ngôn trượt trên hover để kích hoạt thủ công popup bất kỳ lúc nào.
- Giả lập cơ chế phân tích của AI qua bộ tải xoay kiểm tra chi tiết hồ sơ độ tuổi, giống, nhu cầu, ngân sách trong 1.5s và trả về lời khuyên tương thích kèm nút copy voucher nhanh.
- Thêm component `<ThreeFClubFlowSection />` (file [three-f-club-flow-section.tsx](file:///c:/Users/Admin/Downloads/ccc/components/three-f-club-flow-section.tsx)) hiển thị quy trình 4 bước tích điểm Shopee, sử dụng các hình ảnh `note.png`, `search.png`, `coin.png`, `mail.png` và responsive hoàn toàn (chevron xoay 90 độ chỉ xuống dưới khi trên thiết bị di động).
- Tích hợp `<ThreeFClubFlowSection />` vào giữa form gửi đơn Shopee và danh sách Tier Cards trong [threeFclup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/threeFclup.tsx).

## [2026-06-08]
### Added
- Thêm component `components/Auth/PhoneAuthForm.tsx` hỗ trợ luồng đăng nhập/đăng ký bằng Số điện thoại + OTP hoặc Số điện thoại + Mật khẩu.
- Thêm component tương tác `components/PetProfileWizard.tsx` giúp người dùng nhanh chóng thiết lập hồ sơ thú cưng để nhận đề xuất sản phẩm phù hợp.
- Thêm cơ chế tự động cuộn lên đầu trang (Scroll to Top) tại `src/App.tsx` mỗi khi chuyển đổi Route (location.pathname).
- Thêm `components/mobile-navigation-drawer.tsx` hiển thị menu dạng trượt mượt mà cho các thiết bị màn hình nhỏ.
- Thêm `components/product-filters.tsx` làm bộ lọc dùng chung cho trang danh mục, tích hợp drawer trên mobile.

### Changed
- Thay đổi `components/Auth/RegisterForm.tsx` tối giản biểu mẫu đăng ký bằng Email (chỉ giữ lại trường Email và Mật khẩu).
- Tối ưu `components/VoucherSection.tsx`: trên màn hình mobile tự động chuyển slider thành dạng grid 2 cột nhỏ gọn, resize thẻ Voucher thông minh (đẩy text và button xếp chồng) giúp chấm dứt lỗi tràn/cắt chữ "SAVE".
- Cập nhật nút SAVE trên các Voucher để tự động redirect về trang Đăng ký kèm tham số `mode=phone` mặc định bật form Đăng ký qua SĐT.
- Ẩn khối banner "Bộ sưu tập mới" của `components/HeroSection.tsx` trên giao diện điện thoại nhằm làm gọn bố cục dưới slider.
- Thay thế banner tĩnh "Khám phá ngay" trong Bento Grid của `components/HeroSection.tsx` bằng `PetProfileWizard` tương tác cao cấp.
- Thiết kế lại các thẻ danh mục trong `components/CategorySection.tsx` bằng cách thay thế toàn bộ ảnh 3D WebP của danh mục (thức ăn chó, mèo, phụ kiện,...) bằng các khối vector icon Lucide lớn nằm chính giữa, được bao phủ bởi viền màu gradient chuyển động khi hover, loại bỏ hoàn toàn các hình ảnh tạo bằng AI mang tính chất rập khuôn.
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
