# Project Changelog

## [2026-06-15]
### Added
- Tích hợp thành công **Shopee Open Platform OAuth sandbox** cho phân hệ kết nối Shop của 3F Club:
  - Cấu hình môi trường qua `.env` và cập nhật `config/config.php` để lấy credentials động (hỗ trợ database và shopee sandbox).
  - Tích hợp một custom `.env` parser tại entrypoint `public/index.php` nhằm hỗ trợ đọc environment variables trong môi trường PHP thuần mà không cần dependencies bên ngoài.
  - Sửa lỗi `Wrong sign` bằng cách cập nhật sandbox base URL chuẩn của Shopee UAT: `https://openplatform.sandbox.test-stable.shopee.sg`.
  - Tối ưu hóa bộ phân tích `.env` bằng cách tự động trim khoảng trắng thừa ở cuối/đầu giá trị sau khi loại bỏ dấu nháy kép/nháy đơn.
  - Tạo bảng `shopee_tokens` trong database `3f` với unique key `shop_id` + `partner_id`.
  - Tạo model `ShopeeTokenModel` xử lý các tác vụ database (`findByShopId`, `getLatestToken`, `upsertToken`, `updateToken`).
  - Tạo service `ShopeeApiService` xử lý mã hóa chữ ký API v2 (HMAC-SHA256), tạo URL ủy quyền, đổi code lấy tokens, và gửi request cURL tích hợp Sandbox API.
  - Thêm hệ thống ghi log bảo mật `storage/logs/shopee.log` ghi lại thông tin chi tiết request (env, base_url, path, partner_id, timestamp, base_string, sign, URL request và response) đồng thời tự động che (mask) token bí mật.
  - Tạo `ShopeeAuthController` cung cấp 3 endpoint RESTful: tạo URL kết nối (`GET /api/admin/shopee/auth-url`), xử lý callback nhận tokens (`GET /api/shopee/callback`), và kiểm tra trạng thái kết nối (`GET /api/admin/shopee/connection-status`).
  - Đăng ký và cấu hình các route mới trong `public/index.php` và `app/Core/Router.php`.

## [2026-06-12]
### Added
- Tích hợp frontend React với các endpoint PHP MVC backend thật cho 3F Club Shopee Point Request:
  - Kết nối form quét ảnh với API quét ảnh OCR thực tế ở `/api/shopee/order-scan`, cập nhật form state dựa trên thông tin trả về của ảnh mới và sửa cơ chế overwrite fields.
  - Kết nối form gửi yêu cầu tích điểm với API `/api/shopee/requests` gửi kèm `imageId` và `scanId`.
  - Thay thế mock data trong trang Admin Shopee Requests bằng API `getShopeePointRequests`, `getShopeePointRequestDetail`, `approveShopeePointRequest`, và `rejectShopeePointRequest`.
  - Xóa nút "Yêu cầu bổ sung" khỏi bảng quản trị và drawer theo nghiệp vụ mới.
- Phát triển toàn bộ **PHP thuần backend** (`3f-api/`) cho tính năng 3F Club Shopee Point Requests sử dụng PDO + MySQL:
  - Cung cấp database schema `schema.sql` với các bảng: `uploaded_order_images`, `order_image_scans`, và `shopee_point_requests`.
  - Viết helper cấu hình kết nối database an toàn `config/database.php` sử dụng transaction và trả lỗi JSON thay vì lỗi PHP thô.
  - Viết helper CORS và cấu hình response định dạng JSON `helpers/response.php`.
  - Viết các helper validation và normalization `helpers/validation.php` (chuẩn hóa SĐT Việt Nam, chuẩn hóa số tiền, trim văn bản).
  - Viết logic tính điểm tự động `helpers/points.php` và helper tải ảnh `helpers/upload.php` (chỉ chấp nhận JPG/PNG/WEBP < 5MB).
  - Triển khai 7 file API độc lập trong thư mục `api/`: quét ảnh và mock OCR (`shopee-order-scan.php`), tạo yêu cầu tích điểm (`shopee-request-create.php`), danh sách yêu cầu (`shopee-request-list.php`), chi tiết yêu cầu (`shopee-request-detail.php`), duyệt yêu cầu (`shopee-request-approve.php`), từ chối yêu cầu (`shopee-request-reject.php`), và truy vấn điểm tích lũy/tier thành viên (`customer-points.php`).
- Xây dựng chức năng **Tạo yêu cầu thủ công** (`components/admin/shopee/ShopeeManualRequestModal.tsx`) trên trang `/admin/shopee-requests` sử dụng mock dữ liệu và `localStorage`.
- Tích hợp modal tạo yêu cầu vào trang `ShopeeRequestsPage.tsx` hỗ trợ tự động tính toán điểm thực tế, cảnh báo trùng mã đơn Shopee, và ngăn chặn đóng modal vô ý bằng ESC/backdrop nếu form đang có dữ liệu chưa lưu.
- Cập nhật form **Tích điểm từ đơn Shopee** trên section 3F Club: đổi nhãn Email thành "Email (không bắt buộc)", bổ sung helper text/warning text cho ảnh đơn, tích hợp validation SĐT, mã đơn và tổng tiền đơn, cùng với giao diện thành công và persistence lưu trữ dữ liệu vào `localStorage`.
- Sửa tính năng **scan ảnh / OCR form** tại 3F Club: tự động nhận diện và điền SĐT (sau khi chuẩn hóa số), bổ sung highlight input SĐT màu xanh lá kèm nhãn "Tự điền từ ảnh" trong 2 giây, thêm hộp hiển thị kết quả nhận diện (SĐT, mã đơn, tổng tiền, trạng thái, độ tin cậy) kèm warning nếu không nhận diện được SĐT, sửa tỷ lệ tính toán điểm dự kiến về chuẩn `/ 10.000`.
- Khắc phục các lỗi về **quét ảnh đơn Shopee**: tự động reset kết quả cũ khi chọn ảnh mới, áp dụng cơ chế chống race-condition do phản hồi bất đồng bộ bằng `useRef(scanId)`, hỗ trợ overwrite các trường dữ liệu khi quét ảnh mới, tự động giải phóng bộ nhớ `objectURL` cũ, reset giá trị `input.value` để cho phép quét lại cùng 1 file, đa dạng hóa kết quả OCR giả lập theo tên file ("mai"/"1", "duy"/"2" hoặc không nhận diện được SĐT), và sửa nút Xóa ảnh để dọn dẹp toàn bộ dữ liệu tự điền.

### Fixed
- Khắc phục lỗi CORS và 404 khi gọi API `/api/shopee/order-scan` từ cổng Vite (5173) đến Laragon Apache (80) bằng cách tạo liên kết thư mục (junction link) `3f-api` trong `C:\laragon\www\`.

### Changed
- Đổi toàn bộ danh xưng 'AI' sang 'Chuyên gia' hoặc 'Hệ thống' tại các văn bản hiển thị trên giao diện người dùng (nút nổi, màn hình kết quả, biểu mẫu, loading).
- Xây dựng giao diện trang Admin Dashboard tại đường dẫn `/admin` sử dụng mock dữ liệu hoàn toàn ở phía client.
- Tách biệt cấu trúc Admin thành 10 sub-component nhỏ dưới thư mục `components/admin/` đảm bảo tính dễ đọc và tuân thủ giới hạn 200 dòng mã trên mỗi file (Sidebar navy gradient, Header, KPI Cards, Task Queue, Biểu đồ doanh thu SVG, Biểu đồ nguồn đơn SVG, Top sản phẩm, Nhu cầu thú cưng, Lead AI, yêu cầu Shopee).
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
