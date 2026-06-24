# Project Changelog

## [2026-06-24]
### Added
- Tái cấu trúc bộ phân quyền quản trị thành chế độ xem (Read-Only) thay vì ẩn hoàn toàn:
  - Cho phép người dùng không có quyền vẫn xem được nội dung trang quản trị (Nhân sự, Báo cáo...) trên Sidebar và router.
  - Vô hiệu hóa hoặc ẩn các thao tác thay đổi dữ liệu (Thêm mới, Chỉnh sửa, Xóa) trên giao diện qua prop `hasEditAccess` và chặn các phương thức ghi (POST, PUT, DELETE, PATCH) ở phía backend (AuthMiddleware).
  - Loại bỏ các giới hạn vai trò cứng (`['admin', 'superadmin', 'manager']`) trong [ProductController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ProductController.php) để cho phép bất kỳ vai trò quản trị nào có thể đọc danh sách và chi tiết thông qua các yêu cầu `GET` (trong khi các thay đổi dữ liệu vẫn được bảo vệ bởi middleware).
  - Loại bỏ các tệp tin cấu hình và lockfile của `pnpm` (`pnpm-lock.yaml`, `pnpm-workspace.yaml`) để đảm bảo quy trình deploy trơn tru bằng `npm` và `package-lock.json` trên Vercel.
  - Sửa lỗi hiển thị vai trò quản trị viên hệ thống hiển thị nhãn `cskh` do thiếu switch case `admin` ở `AccountsTable.tsx`.
- Triển khai hệ thống phân quyền quản trị Admin (RBAC System) động hoàn chỉnh:
  - Tích hợp bảng lưu trữ cấu hình vai trò `admin_roles` trong cơ sở dữ liệu giúp Admin tự tạo vai trò mới và phân quyền.
  - Cấu hình phân quyền động ở cấp độ chức năng đầy đủ (14 chức năng chính của sidebar) thay vì chia nhỏ lẻ gây phiền hà.
  - Đồng nhất mã kiểm tra quyền tại controllers (`AdminUserController.php`, `AdminRoleController.php`) sang khoá `accounts` để tránh lỗi 403 khi phân quyền cho quản trị viên phụ.
  - Cập nhật `AdminUserController.php` hỗ trợ quản trị nhân sự (danh sách, tạo mới, chỉnh sửa mật khẩu/vai trò/trạng thái và xóa tài khoản) có cơ chế chặn tự xóa hoặc tự khóa tài khoản.
  - Thiết kế trang Quản trị nhân sự `/admin/accounts` (`AdminAccountsPage.tsx`) với giao diện hai Tab quản lý danh sách Nhân sự và cấu hình Vai trò & Phân quyền kèm bảng checklist trực quan.
  - Triển khai bộ lọc liên kết điều hướng trên thanh Sidebar (`admin-sidebar.tsx`) tự động ẩn các mục không có quyền truy cập dựa trên mảng permissions lưu ở LocalStorage.
  - Tích hợp bộ bảo vệ hành động trên Danh sách sản phẩm (`AdminProductsPage.tsx`) tự động ẩn nút thêm/phân loại, khóa nút kích hoạt hiển thị và chuyển nút sửa thành xem chi tiết đối với role read-only.
  - Tích hợp bộ bảo vệ biểu mẫu Sản phẩm (`AdminProductForm.tsx`) sử dụng thẻ `<fieldset disabled>` tự động vô hiệu hóa toàn bộ input khi vai trò là read-only, ẩn nút Lưu/Xóa và ẩn tính năng upload hình ảnh.

## [2026-06-23]
### Added
- Triển khai luồng đăng ký tài khoản khách hàng bằng email verification link:
  - Xây dựng bảng tạm `pending_registrations` lưu trữ thông tin đăng ký (email, họ tên, điện thoại, mật khẩu băm, hash của token, expires_at) bằng cơ chế tự tạo schema động ở backend.
  - Cập nhật hàm `registerEmail()` trong [CustomerAuthController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerAuthController.php) để lưu thông tin tạm thời và gửi email xác thực thay vì tạo tài khoản ngay lập tức.
  - Triển khai API xác thực `POST /api/customer/auth/verify-registration` xử lý tạo tài khoản chính thức trong bảng `customers` (với `email_verified_at = NOW()`), tự động đăng nhập và xóa bản ghi tạm thời trong database transaction.
  - Triển khai API gửi lại mã xác thực `POST /api/customer/auth/resend-registration-verification` tích hợp giới hạn thời gian chờ 60 giây và giới hạn 5 lần gửi mỗi ngày để chống spam.
  - Refactor dịch vụ gửi email [EmailService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/EmailService.php) tích hợp với [SmtpClient.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/SmtpClient.php) để giảm độ dài tệp tin dưới 200 dòng mã theo tiêu chuẩn.
  - Tạo trang `/verify-registration` ([VerifyRegistrationPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/VerifyRegistrationPage.tsx)) xử lý nhận token từ link email, gọi API kích hoạt, tự động đăng nhập và redirect về trang cá nhân.
  - Nâng cấp trang Đăng ký [Register.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/Register.tsx) hiển thị thẻ hướng dẫn mở hòm thư email, nút gửi lại email và liên kết verify đặc biệt dành riêng cho môi trường phát triển (development).
- Thiết kế và triển khai trang Liên hệ / Contact (/contact và /lien-he) mới và API Backend:
  - Xây dựng trang đích [ContactPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/ContactPage.tsx) chính của khách hàng tích hợp SEO Metadata động và bố cục hai cột responsive.
  - Tách giao diện ContactPage thành các component nhỏ dưới 200 dòng mã để bảo vệ giới hạn tệp:
    - [ContactHero.tsx](file:///c:/Users/Admin/Downloads/ccc/components/contact/ContactHero.tsx): Tiêu đề liên hệ, ảnh hero, nút gọi điện, tư vấn và xem bản đồ.
    - [ContactQuickCards.tsx](file:///c:/Users/Admin/Downloads/ccc/components/contact/ContactQuickCards.tsx): Lưới thẻ thông tin liên lạc nhanh (Hotline, Email, Địa chỉ, Shopee).
    - [ContactForm.tsx](file:///c:/Users/Admin/Downloads/ccc/components/contact/ContactForm.tsx): Form thu thập thông tin tích hợp kiểm tra số điện thoại Việt Nam regex, chống double-submit và Honeypot ẩn `company_website` chống spam.
    - [ContactLocation.tsx](file:///c:/Users/Admin/Downloads/ccc/components/contact/ContactLocation.tsx): Bản đồ Google Maps iframe responsive và nút mở Google Maps ngoài.
    - [ContactSupportTopics.tsx](file:///c:/Users/Admin/Downloads/ccc/components/contact/ContactSupportTopics.tsx): Danh sách các lĩnh vực hỗ trợ (thức ăn, cát, đơn hàng, bảo hành).
    - [ContactFaq.tsx](file:///c:/Users/Admin/Downloads/ccc/components/contact/ContactFaq.tsx): Accordion hỏi đáp nhanh với 5 câu hỏi thường gặp đúng nghiệp vụ pet store.
    - [ContactCTA.tsx](file:///c:/Users/Admin/Downloads/ccc/components/contact/ContactCTA.tsx): Khung hành động cuối trang cuộn tới form hoặc xem sản phẩm.
  - Xây dựng Model [ContactMessage.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/ContactMessage.php) tự động tạo bảng `contact_messages` trong MySQL.
  - Xây dựng Controller [ContactController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ContactController.php) xử lý route `POST /api/contact`, kiểm tra Honeypot, validate dữ liệu đầu vào và lưu trữ tin nhắn.
  - Đăng ký API route public trong [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php).
  - Kết nối và đồng bộ hóa điều hướng trong [Header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Header.tsx) ("Liên hệ" -> `/contact`) và [Footer.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Footer.tsx) ("Liên hệ" -> `/contact`).
  - Tự động tạo và lưu trữ 4 tệp ảnh minh họa pet store contact (`contact-hero.png`, `contact-store.png`, `contact-support.png`, `contact-location.png`) vào thư mục `public/images/contact/`.
- Thiết kế và triển khai trang Giới thiệu / About (/about và /gioi-thieu) mới:
  - Xây dựng trang đích [AboutPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/AboutPage.tsx) chính của khách hàng tích hợp SEO Metadata động (tiêu đề, thẻ mô tả) và thanh điều hướng Breadcrumb.
  - Mô đun hóa giao diện AboutPage thành các component nhỏ dưới 200 dòng mã để bảo vệ giới hạn tệp:
    - [AboutHero.tsx](file:///c:/Users/Admin/Downloads/ccc/components/about/AboutHero.tsx): Tiêu đề thương hiệu ấm áp, ảnh hero dog/cat, nút mua sắm và tư vấn.
    - [AboutIntro.tsx](file:///c:/Users/Admin/Downloads/ccc/components/about/AboutIntro.tsx): Giới thiệu cửa hàng chuyên chó mèo, nguồn gốc chất lượng chọn lọc.
    - [AboutCategories.tsx](file:///c:/Users/Admin/Downloads/ccc/components/about/AboutCategories.tsx): Giới thiệu 8 danh mục sản phẩm (thức ăn, pate, cát, chăm sóc sức khỏe, làm đẹp).
    - [AboutWhyChooseUs.tsx](file:///c:/Users/Admin/Downloads/ccc/components/about/AboutWhyChooseUs.tsx): Lợi ích/cam kết của cửa hàng (hàng chính hãng, bảo quản chuẩn, hỗ trợ chu đáo).
    - [AboutConsulting.tsx](file:///c:/Users/Admin/Downloads/ccc/components/about/AboutConsulting.tsx): Mô tả tư vấn dinh dưỡng theo tuổi, giống, cân nặng và lời khuyên y tế/bác sĩ thú y.
    - [AboutChannels.tsx](file:///c:/Users/Admin/Downloads/ccc/components/about/AboutChannels.tsx): Cung cấp liên kết mua sắm đa kênh (Website, Shopee, Zalo tư vấn, Cửa hàng offline).
    - [AboutStoreInfo.tsx](file:///c:/Users/Admin/Downloads/ccc/components/about/AboutStoreInfo.tsx): Thông tin pháp lý (Công ty, MST, Hotline, Address, Email) và bản đồ Google Maps tích hợp.
    - [AboutCTA.tsx](file:///c:/Users/Admin/Downloads/ccc/components/about/AboutCTA.tsx): Khung hành động cuối trang chuyển hướng đến chat Zalo hoặc mua sắm.
  - Đồng bộ hóa điều hướng trong [Header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Header.tsx) ("Về chúng tôi" -> `/about`, "Liên hệ" -> `/about#store-info`).
  - Đồng bộ hóa liên kết trong [Footer.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Footer.tsx) ("Giới thiệu" -> `/about`, "Liên hệ" -> `/about#store-info` với smooth scroll).
  - Đăng ký các tuyến đường `/about` và `/gioi-thieu` trong [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx).
  - Tự động tạo và lưu trữ 4 tệp ảnh minh họa pet store chất lượng cao (`about-hero.png`, `about-products.png`, `about-consulting.png`, `about-delivery.png`) vào thư mục `public/images/about/`.
- Bố cục lại giao diện AI Pet Advisor Admin (Full-width Grid List & Consultation Detail Page):
  - Chuyển đổi giao diện chia đôi màn hình (split layout) cũ của trang danh sách tư vấn AI thành giao diện hiển thị lưới (grid layout) rộng mở full-width, hiển thị nhiều thông tin trực quan hơn trên mỗi thẻ tư vấn.
  - Tích hợp thêm nút hành động "Xem chi tiết" với biểu tượng Lucide `Eye` trên từng thẻ để chuyển hướng quản trị viên đến trang thông tin chi tiết riêng biệt.
  - Xây dựng trang thông tin chi tiết mới [AdminPetAdvisorDetailPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminPetAdvisorDetailPage.tsx) hiển thị chi tiết hồ sơ thú cưng, thông tin khách hàng, câu hỏi quiz và kết luận/cảnh báo của AI.
  - Đăng ký tuyến đường mới `/admin/pet-advisor/consultation/:id` trong [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx) để định tuyến đến trang chi tiết mới.
  - Phát triển API backend `/api/admin/pet-advisor/consultations/detail` trong [CustomerPetController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerPetController.php) và đăng ký trong [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php) để lấy chi tiết của một lượt tư vấn dựa trên ID.
  - Tiến hành mô đun hóa (modularization) giao diện AI Pet Advisor để tuân thủ quy tắc giới hạn 200 dòng mã mỗi tệp:
    - Tách các kiểu dữ liệu, hằng số `speciesLabel` và hàm logic xử lý dữ liệu (`parseAdvice`, `formatDate`, `formatMoney`, `listText`, `findAnswer`, `getMeta`) sang tệp tiện ích dùng chung [pet-advisor-helpers.ts](file:///c:/Users/Admin/Downloads/ccc/src/utils/pet-advisor-helpers.ts).
    - Tách các component hiển thị thẻ và bảng giao diện dùng chung (`KpiCard`, `SummaryCard`, `DetailPanel`, `InfoRow`) sang tệp giao diện dùng chung [pet-advisor-cards.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/pet-advisor-cards.tsx).
    - Tách thẻ tư vấn riêng lẻ sang component [pet-advisor-consultation-card.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/pet-advisor-consultation-card.tsx).
    - Refactor lại [AdminPetAdvisorPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminPetAdvisorPage.tsx) (còn 174 dòng) và [AdminPetAdvisorDetailPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminPetAdvisorDetailPage.tsx) (còn 193 dòng) giúp tăng tính sạch sẽ, dễ bảo trì và tối ưu dung lượng tệp.
- Triển khai Hệ thống Thông báo Quản trị viên (Admin Notification System):
  - Thiết kế bảng CSDL `admin_notifications` lưu trữ thông tin thông báo, loại tài nguyên liên quan (đơn hàng, yêu cầu tích điểm Shopee, đánh giá sản phẩm) và trạng thái đọc.
  - Viết Model `AdminNotification.php` và Controller `AdminNotificationController.php` cung cấp các API lấy danh sách thông báo, số lượng chưa đọc, đánh dấu đã đọc (đơn lẻ hoặc tất cả), và xóa thông báo.
  - Đăng ký các API routes và tích hợp pre-instantiation model vào `public/index.php` để chạy di trú tự động ở ngoài phạm vi MySQL transaction nhằm tránh lỗi commit ngầm.
  - Tích hợp các bộ kích hoạt thông báo (notification triggers) tự động khi xảy ra sự kiện: đặt đơn hàng mới (`OrderController`), gửi yêu cầu tích điểm Shopee mới (`ShopeePointRequestController`), và gửi đánh giá sản phẩm mới (`ProductReviewController`).
  - Re-architect biểu tượng chuông thông báo trên Header trang Admin (`admin-header.tsx`) với giao diện dropdown menu cao cấp, hiển thị số lượng chưa đọc thời gian thực (được cập nhật qua cơ chế polling mỗi 60 giây).
  - Tải danh sách 10 thông báo mới nhất kèm icon phân loại trực quan theo loại sự kiện, hỗ trợ thao tác đánh dấu đã đọc riêng lẻ khi click, chuyển hướng điều hướng (redirect) chính xác đến trang quản lý tương ứng, và nút "Đánh dấu tất cả là đã đọc".

### Changed
- Nâng cấp ô nhập địa chỉ Tỉnh/Thành phố và Phường/Xã ở trang thanh toán sang Input Text tự động gợi ý (Autocomplete):
  - Thay thế các hộp chọn `<select>` cứng nhắc bằng ô nhập văn bản `<input type="text">` linh hoạt giúp người dùng không bao giờ bị chặn đặt hàng nếu danh sách tỉnh/xã từ API bị thiếu hoặc tải chậm.
  - Tích hợp bộ tìm kiếm không dấu (accent-insensitive) và bỏ dấu tiếng Việt động, tự động lọc và gợi ý danh sách 10 kết quả phù hợp nhất dưới dạng danh sách thả nổi khi người dùng gõ phím.
  - Khi click chọn kết quả gợi ý, hệ thống tự động ánh xạ mã tỉnh/xã tương ứng, cập nhật trường text và tải dữ liệu phường/xã liên quan mà không làm thay đổi các trục xác thực khác.
  - Cấu hình ô nhập Phường/Xã chỉ bị vô hiệu hóa (disabled) khi ô Tỉnh/Thành phố hoàn toàn trống (được liên kết đồng bộ với trạng thái nhập liệu `provinceInput` tức thời); ô Phường/Xã sẽ tự động mở khóa ngay khi người dùng bắt đầu gõ ký tự đầu tiên và khóa lại lập tức khi người dùng xóa sạch ô nhập tỉnh. Đồng thời bổ sung các lớp CSS vô hiệu hóa giao diện (`disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed`) để ô input có màu nền xám mờ và biểu tượng con trỏ cấm rõ rệt, ngăn chặn hoàn toàn tương tác và hiển thị menu gợi ý khi chưa chọn tỉnh.
- Đồng bộ hóa thiết kế của 2 nút Thêm vào giỏ và Mua ngay ở trang Chi tiết sản phẩm:
  - Thay đổi chiều cao từ `h-[60px]` thô kệch thành `h-[52px]` gọn gàng, khớp hoàn hảo với chiều cao của ô chọn số lượng mua bên cạnh.
  - Bổ sung và cập nhật thuộc tính bo góc từ góc nhọn mặc định thành bo tròn nhẹ `rounded-[14px]` đồng bộ hoàn toàn với thiết kế của 2 nút tại thanh sticky bottom bar cố định ở dưới.
  - Tinh chỉnh kích thước văn bản từ `text-[15px]` thành `text-[14px]` và tối ưu bóng đổ mờ để giao diện trông chuyên nghiệp, thanh thoát hơn.
- Thiết kế lại Giao diện Phân trang Voucher phía Admin (Redesign Voucher Pagination):
  - Thay thế giao diện phân trang dạng văn bản "Trang X/Y" và hộp chọn size trang đơn giản bằng một thanh điều hướng phân trang hiện đại và trực quan hơn.
  - Tích hợp hàm `getPageNumbers` để tự động tính toán và hiển thị danh sách nút số trang kèm dấu chấm lửng `...` co giãn thông minh dựa trên trang hiện tại và tổng số trang.
  - Thiết kế nút số trang hiện tại với màu nền xanh dương `#0057E7`, chữ trắng và bóng đổ mờ thương hiệu.
  - Thiết kế các nút số trang thường, nút tiến/lùi có viền mờ cùng hiệu ứng hover đổi màu nhấn thương hiệu và chuyển động mượt mà.
  - Bố trí hộp chọn số dòng hiển thị ("Số dòng:") tinh gọn, chuyên nghiệp nằm trực tiếp trong thanh tóm tắt hiển thị bản ghi ở bên trái.
- Bắt buộc đăng nhập để Lưu Voucher (Auth Required for Voucher Copy):
  - Tích hợp hook `useCustomerAuth()` trong component [VoucherSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/VoucherSection.tsx) ở trang chủ.
  - Khi người dùng chưa đăng nhập, nút "SAVE" sẽ không thực hiện sao chép mà hiển thị một Popup/Modal cảnh báo màu sắc premium, yêu cầu đăng nhập và cung cấp nút điều hướng sang trang `/login`.
  - Cải tiến hàm sao chép với cơ chế fallback tự tạo thẻ textarea tạm thời giúp nút "SAVE" hoạt động cực kỳ ổn định trên mọi trình duyệt và thiết bị di động.
- Tinh giản danh mục trên Sidebar của Admin (Clean Sidebar Menu):
  - Loại bỏ các mục "Hồ sơ thú cưng", "Hỗ trợ khách hàng", và "Cài đặt" khỏi menu của thanh Sidebar quản trị viên ([admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)) để tối ưu hóa không gian hiển thị và tập trung vào các chức năng chính.
- Đổi tên mục điều hướng trên thanh Sidebar của Admin:
  - Thay đổi tên hiển thị từ "Voucher / Campaign" thành "Voucher" cho đồng bộ và tinh gọn hơn.
- Đồng bộ hóa hình dạng Voucher và áp dụng quy tắc Duy nhất tại phân hệ Tư vấn AI:
  - Thiết kế lại hiển thị Voucher trong popup Kết quả tư vấn AI (`AiResult.tsx`) khớp hoàn toàn với cấu trúc thẻ voucher hình răng cưa (`VoucherCard`), hiển thị đầy đủ tiêu đề, mô tả, nhãn, huy hiệu và block màu gradient sang trọng.
  - Tích hợp gọi API `getAiAdvisorVoucher` từ frontend để hiển thị động thông tin voucher được cấu hình thực tế thay vì hiển thị tĩnh mã voucher mẫu.
  - Cập nhật logic cào dữ liệu và proxy Groq phía backend (`CustomerPetController.php`) tự động truy vấn CSDL để lấy thông tin mã voucher và mô tả tương ứng truyền vào system prompt cho AI và trả về kết quả động.
  - Áp dụng quy tắc duy nhất phía backend (`Coupon.php`): khi kích hoạt/lưu một voucher chạy trên Tư vấn AI (`show_in_ai_advisor = 1`), hệ thống tự động tắt cờ `show_in_ai_advisor` của tất cả các voucher khác để đảm bảo chỉ có duy nhất tối đa 1 voucher hoạt động tại một thời điểm.

### Fixed
- Khắc phục lỗi chọn phân loại nhưng không chọn được thông số khiến không đặt hàng được tại Modal Xem Nhanh:
  - Tự động ẩn các nhóm tùy chọn/thông số (ví dụ: nhóm "THÔNG SỐ") nếu tất cả các giá trị tùy chọn trong nhóm đó đều bị vô hiệu hóa (disabled) dưới lựa chọn phân loại hiện tại.
  - Cập nhật hàm tìm kiếm biến thể `getSelectedVariant` và kiểm tra tính đầy đủ của lựa chọn chỉ kiểm tra các nhóm tùy chọn đang hiển thị/áp dụng (applicable groups), bỏ qua và chấp nhận giá trị rỗng/null cho các nhóm tùy chọn bị ẩn. Việc này giúp khách hàng chọn phân loại và đặt hàng/mua ngay lập tức mà không bị chặn lại bởi các nhóm thông số không hoạt động.
- Sửa lỗi trùng lặp sản phẩm trong giỏ hàng (duplicate cart items):
  - Xây dựng hàm so sánh `isSameCartItem` trong [cartHelper.ts](file:///c:/Users/Admin/Downloads/ccc/lib/cartHelper.ts) hỗ trợ kiểm tra linh hoạt theo mã sản phẩm (`productId`), mã phân loại/biến thể (`variantId`) và văn bản phân loại. Giải quyết triệt để sự khác biệt kiểu dữ liệu (chuỗi vs số) và định dạng khóa định danh (`id` biến thể thô vs khóa phức hợp `productId-variantId` từ chức năng mua lại đơn hàng).
  - Tích hợp `isSameCartItem` vào các tác vụ `addToCart`, `updateQuantity` và `removeFromCart`.
  - Cập nhật hàm gọi `addToCart` tại popup Kết quả tư vấn AI [AiResult.tsx](file:///c:/Users/Admin/Downloads/ccc/components/pet-advisor/AiResult.tsx) truyền thêm trường `productId` nhằm đồng nhất cấu trúc dữ liệu với trang Chi tiết sản phẩm và Modal xem nhanh.
- Tránh rớt/xuống dòng cho nhãn voucher tại bảng đơn hàng Admin:
  - Bổ sung class `whitespace-nowrap` vào thẻ hiển thị badge mã giảm giá áp dụng (`Mã: ...`) tại [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx) để giữ toàn bộ chuỗi hiển thị voucher luôn nằm trên một dòng.
- Ẩn thông tin hàng tồn kho và sửa lỗi nhóm thông số/phân loại trống (Option groups & Stock Hide):
  - Ẩn toàn bộ văn bản hiển thị số lượng tồn kho ("Kho hàng: X sản phẩm" / "Tồn kho: Y sản phẩm") tại trang Chi tiết sản phẩm [ProductDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/ProductDetail.tsx) và Modal xem nhanh [QuickAddToCartModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/QuickAddToCartModal.tsx).
  - Tắt cờ báo hết hàng và chặn mua hàng `isOutOfStock` trên giao diện người dùng (thiết lập mặc định là `false`) và bỏ giới hạn số lượng đặt mua dựa trên tồn kho thực tế, cho phép đặt hàng không giới hạn (tối đa 99 sản phẩm/lượt mua).
  - Tự động lọc bỏ các nhóm tùy chọn/phân loại trống (ví dụ: nhóm "THÔNG SỐ" của các sản phẩm cũ không khai báo giá trị thông số trong các biến thể tương ứng) để tránh việc các nút bấm lựa chọn bị vô hiệu hóa (disabled/faded) ngoài ý muốn, giúp người dùng chọn phân loại và tiến hành mua hàng bình thường.
  - Ép kiểu dữ liệu (coercion) của các giá trị tùy chọn biến thể (`option1Value`, `option2Value`, `option3Value`) thành kiểu chuỗi (string) trong API mapper [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts) và trong các hàm so sánh ở [QuickAddToCartModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/QuickAddToCartModal.tsx). Việc này giải quyết triệt để lỗi vô hiệu hóa các nút số (ví dụ: thông số `3` của sản phẩm Mr.vet) do lệch kiểu dữ liệu (số vs chuỗi) khi đối chiếu trạng thái lựa chọn.
- Sửa lỗi giữ kho nhầm (reserved stock leak) khi đặt đơn hàng thất bại với mã voucher:
  - Thêm cờ `private static $migrated` vào `Coupon.php` để ngăn chặn việc chạy `ensureSchema()` nhiều lần trong một request. Việc gọi `CREATE TABLE IF NOT EXISTS` bên trong transaction gây ra hiện tượng commit ngầm (implicit commit) trong MySQL, làm mất khả năng rollback các câu lệnh sửa đổi database trước đó khi xảy ra exception.
  - Tối ưu hóa `OrderController.php` để tái sử dụng instance `$couponModel` từ phạm vi ngoài, loại bỏ việc khởi tạo lại model bên trong transaction block.
  - Giải phóng kho bị chiếm dụng ngoài ý muốn của sản phẩm Combo Zoi Dog 20kg (Variant ID 896) giúp đưa `reserved_stock` từ 3 về 0 và phục hồi tồn kho khả dụng lên 3.
- Sửa lỗi rớt chữ cột Trạng thái, Thanh toán và hiển thị icon cột Phương thức tại trang Quản lý Đơn hàng Admin:
  - Bổ sung `whitespace-nowrap` vào thuộc tính `className` của các ô tiêu đề, ô nội dung dữ liệu và hàm khởi tạo huy hiệu `getDynamicStatusBadge` để chống tràn/rớt dòng chữ cho cột Trạng thái và Thanh toán.
  - Loại bỏ biểu tượng xe tải (`<Truck />`) khỏi cột Phương thức/Vận chuyển trong danh sách bảng đơn hàng, chỉ hiển thị nhãn phương thức dạng văn bản thuần túy theo yêu cầu thiết kế tối giản.

## [2026-06-22]
### Added
- Nâng cấp phân hệ Tư vấn AI và Lịch sử tư vấn (AI Consultation History):
  - Hỗ trợ tải `GROQ_API_KEY` động từ biến môi trường `import.meta.env.VITE_GROQ_API_KEY` trước khi sử dụng key fallback cũ, giúp giải quyết lỗi 401 dễ dàng qua việc cập nhật `.env`.
  - Chuyển đổi trang Hồ sơ thú cưng thành giao diện "Lịch sử tư vấn dinh dưỡng" chuyên biệt.
  - Loại bỏ hoàn toàn chức năng tạo/sửa thủ công hồ sơ thú cưng cũ để tập trung hoàn toàn vào lịch sử tư vấn AI.
  - Redesign giao diện danh sách thẻ tư vấn hiển thị rõ ràng: Tên thú cưng, Loài, Giống, Ngày tư vấn (createdAt thực tế lấy từ API), và kết luận tư vấn AI.
  - Cải tiến PetAdviceModal hiển thị thêm phần "Thông tin đầu vào của bé" (loài, giống, cân nặng, thức ăn hiện tại, vấn đề sức khỏe) ngay phía trên Lời khuyên dinh dưỡng để người dùng tiện theo dõi ngữ cảnh tư vấn.
  - Cập nhật model và controller phía backend (CustomerPetController.php) hỗ trợ trả về trường createdAt thời gian thực từ database.
- Thiết kế lại Giao diện Biến thể & Tồn kho phía Admin (Redesign Product Variants & Inventory Tab):
  - Thay thế bảng biến thể rộng hiện tại (đòi hỏi cuộn ngang) bằng danh sách Thẻ Biến thể (Variant Cards) thông thoáng, trực quan và thân thiện với người dùng.
  - Thiết kế bố cục Thẻ Biến thể tự động co giãn 2 cột trên Desktop và xếp chồng 1 cột trên Mobile.
  - Hiển thị đầy đủ tiêu đề "Biến thể #X" (hoặc "Biến thể mặc định" khi không có phân loại), nhãn SKU, trạng thái Bật/Tắt dạng badge, toggle kích hoạt, nút xóa (vô hiệu hóa kèm icon cảnh báo nếu có lịch sử đơn hàng), viền đỏ cảnh báo và huy hiệu "Cần sửa" khi có lỗi.
  - Tích hợp tính năng đối chiếu và click nhảy nhanh trực tiếp từ thanh sidebar lỗi sang trường input bị lỗi tương ứng (bao gồm cả Tên sản phẩm, Danh mục, Ảnh và các trường biến thể) thông qua ID động và bộ hẹn giờ cuộn mượt.
  - Bổ sung nút "Thêm phân loại" / "Bỏ phân loại" tại Action Bar trên cùng giúp kích hoạt hoặc gỡ bỏ các tùy chọn Phân loại 1/Phân loại 2 linh hoạt, tự động ẩn giao diện phân loại khi cả 2 tùy chọn trống.
  - Nâng cấp bộ tạo SKU tự động riêng lẻ cho từng biến thể và nút tạo SKU hàng loạt toàn cục.
  - Bổ sung kiểm tra trùng lặp SKU trong danh sách lỗi validation, đồng thời đổi tên các nhãn giá thành "Giá bán thực tế" (Giá khách thanh toán) và "Giá niêm yết / Giá trước khuyến mãi" (Có thể bỏ trống).
  - Chuyển cảnh báo thiếu ảnh thành dạng cảnh báo không chặn lưu (warning severity), giúp admin lưu sản phẩm thành công dù chưa thêm hình ảnh.
  - Loại bỏ hoàn toàn các nút "Tạo yêu cầu thủ công" (manual request creation), "Xuất danh sách" (export list) và modal drawer tạo thủ công tương ứng trên trang Yêu cầu Shopee của 3F Club.
- Triển khai Cấu hình Hạng thành viên Admin 3F Club (Phase 2 - Admin Membership Tiers Configuration):
  - Tích hợp bảng CSDL `loyalty_tiers` động thay thế cho các cấu hình cứng trước đây.
  - Xây dựng model `LoyaltyTier` phục vụ việc truy vấn dữ liệu và cập nhật cấu hình linh hoạt.
  - Cung cấp các API `GET /api/admin/3f-club/tiers` và `PUT /api/admin/3f-club/tiers/:id` với cơ chế validate nghiêm ngặt (redemption cap <= 100%, spend/orders >= 0, multiplier >= 1.0).
  - Cải tiến giao diện quản lý Admin `MembershipTiersSection` liên kết trực tiếp với CSDL thực tế, loại bỏ tính năng tạo thêm hạng mới hoặc xóa các hạng hệ thống để đảm bảo tính nhất quán (Diamond được cấu hình read-only hoàn toàn).
  - Cập nhật luồng tính toán thăng hạng trong `LoyaltyProductionModel` để áp dụng động các điều kiện được lưu trong CSDL.
  - Refactored the modal preview card layout in `MembershipTiersSection` to render spend, orders, and redemption cap values instead of legacy minPoints.
- Di chuyển Hạng thành viên 3F Club thành Tab riêng biệt bên trái (Dedicated 3F Club Navigation Tab):
  - Chuyển toàn bộ các thành phần hiển thị 3F Club từ trang Hồ sơ cá nhân (`/account/profile`) sang một Tab riêng biệt "Thành viên 3F Club" ở thanh điều hướng bên trái (`/account/club`).
  - Hiển thị thông tin hạng thành viên động (Member, Silver, Gold, Diamond) trực quan kèm hệ số nhân điểm (multiplier) và hạn mức thanh toán (cap percent) tại giao diện Tab mới sau khi số điện thoại được xác thực.
  - Tích hợp thanh tiến trình kép hiển thị điều kiện thăng hạng động rolling 12 tháng (gồm doanh thu chi tiêu và số lượng đơn hàng cần đạt) trực tiếp lấy từ API `/api/customer/club/summary`.
  - Triển khai giao diện Locked Teaser Card với thiết kế nét đứt tinh tế và biểu tượng Lock khi tài khoản chưa xác thực số điện thoại ở Tab mới.
  - Bổ sung nút CTA "Xác thực số điện thoại ngay" trên teaser card, tự động chuyển hướng người dùng sang trang Hồ sơ cá nhân kèm tham số kích hoạt và cuộn mượt mà đến vùng xác thực liên kết liên hệ (`#phone-verification-section`).

### Changed
- Đồng bộ hóa giao diện quản lý Tin tức Admin (Admin News UI Synchronization):
  - Thay đổi màu nền trang từ xám nhạt `bg-[#FAFAFA]` sang màu xanh nhạt `bg-[#F6FAFF]` đồng bộ với các trang Quản lý Sản phẩm, Đơn hàng, và Cấu hình.
  - Loại bỏ giới hạn chiều rộng trang `max-w-6xl` tại danh sách tin tức, chuyển sang thiết kế co giãn toàn màn hình (fluid layout) cùng khoảng đệm `px-4 sm:px-6 py-6` chuẩn.
  - Cập nhật kiểu chữ và kích thước tiêu đề trang chính thành `text-2xl font-black text-[#0B1F3A]` và phụ đề thành màu xanh xám `text-[#64748B]`.
  - Cập nhật thiết kế các nút "Đồng bộ bài viết" (bổ sung hiệu ứng xoay icon và màu nền xanh dịu) và nút "Viết bài mới" (màu xanh dương đậm đặc trưng `#0057E7` với hiệu ứng đổ bóng mờ premium).
  - Nâng cấp khối Thẻ chỉ số KPI (KPI Cards) sang cấu trúc bo tròn lớn `rounded-[20px]`, viền xanh nhẹ `border-[#DCEBFF]`, và đổ bóng dịu mắt, đồng thời bổ sung các biểu tượng Lucide (`FileText`, `Eye`, `CheckSquare`, `AlertCircle`) tương ứng.
  - Đồng bộ hóa thanh tab lọc trạng thái tin tức (Tất cả, Đã xuất bản, Bản nháp, Lên lịch, Cần tối ưu SEO) sử dụng màu nhấn xanh dương `#0057E7` cho tab hiện tại và viền dưới `border-[#DCEBFF]`.
  - Cải tiến giao diện bảng tin tức: sử dụng card viền `border-[#DCEBFF]` với shadow-glass, table headers có màu nền `bg-slate-50/75` và cỡ chữ font-black `text-xs`, nâng font-semibold cho dữ liệu dòng và áp dụng các badge trạng thái/SEO bo góc tròn tinh tế.
  - Thay thế nút thao tác 3 chấm đơn giản bằng nút tròn solid border có hiệu ứng hover đổi màu thương hiệu, đồng thời tối ưu bóng mờ cho menu dropdown actions.
  - Cập nhật màu nhấn cho nút phân trang hoạt động từ đen `bg-slate-900` sang xanh dương `#0057E7`.
  - Bổ sung chân trang (Copyright Footer) chuẩn ở cuối trang quản lý tin tức.
  - Đồng bộ hóa màu nền của Trang soạn thảo tin tức (`AdminNewsEditorPage.tsx`) sang `bg-[#F6FAFF]` cho cả màn hình tải dữ liệu và nội dung soạn thảo chính.
- Nâng cấp số lượng sản phẩm gợi ý trong phân hệ Tư vấn AI Pet Advisor:
  - Tăng số lượng đề xuất từ tối đa 6 sản phẩm lên đúng **9 sản phẩm** phù hợp nhất (3 sản phẩm cho mỗi nhóm: Tiết kiệm - saving, Cân bằng - balanced, Cao cấp - premium) theo nhu cầu hiển thị nhiều lựa chọn hơn của khách hàng.
  - Tăng giới hạn số lượng sản phẩm gửi lên AI phân tích từ 20 sản phẩm lên 30 sản phẩm (15 sản phẩm chó, 15 sản phẩm mèo cho luồng chung) để AI có nguồn sản phẩm thực tế dồi dào hơn phục vụ việc lựa chọn chính xác.

### Fixed
- Sửa lỗi hiển thị các chỉ số thống kê của khách hàng (Tổng đơn, Tổng chi tiêu, Điểm 3F, Hoàn thiện hồ sơ) bằng 0 ở trang Chi tiết khách hàng Admin:
  - Cập nhật hàm `adminGetCustomerDetail` trong [Customer.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Customer.php) để truy vấn và tính toán động các giá trị `total_orders`, `total_spent`, `point_balance` (sử dụng `CustomerPointTransactionModel`), và `profile_completion` từ database.
  - Trả về đồng thời cả khóa snake_case và camelCase để đảm bảo khả năng tương thích cao nhất với các component frontend.
- Sửa lỗi hệ thống gián đoạn khi thực hiện tư vấn AI và hiển thị danh sách sản phẩm khuyên dùng:
  - Di chuyển hoàn chỉnh logic gọi API Groq từ phía client (frontend) sang proxy an toàn phía backend (`/api/customer/pet-advisor/consult`) để bảo mật API key và phòng ngừa hoàn toàn lỗi 401/403/CORS khi gọi trực tiếp từ trình duyệt.
  - Tự động cập nhật `GROQ_API_KEY` vào tệp cấu hình `.env` của máy chủ staging để loại bỏ hoàn toàn lỗi 401 Unauthorized từ cuộc gọi API của backend.
  - Tối ưu hóa API tư vấn bằng cách gửi ID dạng số ngắn gọn của sản phẩm lên Groq thay vì slug dài dặc để tránh AI chép sai/hallucinate slug (dẫn đến khớp sản phẩm ra `null`). Khi trả về, hệ thống sẽ tự động đối chiếu ID số thành slug đầy đủ để đảm bảo khớp nối chính xác.
  - Cải tiến system prompt để AI tư vấn chọn **tối đa 6 sản phẩm** (chia đều mỗi gói Tiết kiệm, Cân bằng, Cao cấp có 2 sản phẩm đề cử) giúp khách hàng có nhiều sự lựa chọn hơn.
  - Tích hợp hàm `mapApiProduct` tại `AiResult.tsx` để đồng bộ cấu trúc dữ liệu của sản phẩm nhận từ backend, tự động ánh xạ `mainImageUrl` thành `image`, khắc phục triệt để lỗi hiển thị ảnh sản phẩm bị hỏng (broken image).
  - Bổ sung cấu trúc dữ liệu đầy đủ cho các sản phẩm gợi ý mẫu trong `FALLBACK_RESULT` (gồm đầy đủ ảnh, tên, giá của Gói tiết kiệm và Gói cân bằng) giúp hiển thị danh sách sản phẩm đẹp mắt ngay cả khi hệ thống rơi vào trạng thái tư vấn mặc định do gián đoạn mạng.
  - Khắc phục lỗi TPM (Tokens Per Minute) limit của tài khoản free khi gửi dữ liệu catalog quá dài (vượt quá 6,000 tokens của model `llama-3.1-8b-instant`).
  - Nâng cấp model mặc định sang `llama-3.3-70b-versatile` có giới hạn TPM cao hơn (12,000 TPM) và chất lượng tư vấn tốt hơn.
  - Tối ưu hóa kích thước prompt bằng cách giới hạn số lượng sản phẩm tải từ catalog xuống còn tối đa 20 sản phẩm (hoặc 10 sản phẩm mỗi loại cho luồng cả hai), giúp giảm hơn 40% dung lượng payload gửi đi và đảm bảo an toàn tuyệt đối trước giới hạn token.
  - Khắc phục lỗi không hiển thị danh sách sản phẩm khuyên dùng ("Tổng 0 sản phẩm") sau khi nhận kết quả tư vấn AI do danh mục tĩnh trong `data/store.ts` bị làm rỗng sau khi chuyển sản phẩm sang MySQL backend.
  - Cấu hình khớp nối sản phẩm đề cử với danh sách sản phẩm thật lấy từ API CSDL trong `groqApi.ts` và đính kèm trực tiếp thông tin đầy đủ vào thuộc tính `product`.
  - Cập nhật `AiResult.tsx` để ưu tiên render từ trường `item.product` động này, hiển thị lại đầy đủ ảnh sản phẩm, tên, giá, nút chọn mua nhanh và tổng tiền chính xác.
- Khôi phục và khóa tính năng sửa/xóa hạng Diamond tại Quản lý Hạng thành viên Admin (Restore and Read-Only Diamond Tier):
  - Loại bỏ bộ lọc loại trừ "diamond" khỏi visibleTiers memo block để hiển thị chính xác vị trí của Diamond trong bảng Hạng thành viên.
  - Vô hiệu hóa nút Sửa hạng (Pencil) và Tắt/Kích hoạt hạng (Trash2) cho dòng Diamond bằng thuộc tính disabled và style thiết kế grayed-out (`cursor-not-allowed`).
  - Ánh xạ huy hiệu Diamond về tệp ảnh `badge_platinum.png` để hiển thị visual khiên đặc quyền premium giống giao diện trang chủ.
  - Cập nhật bộ kiểm tra tên trùng lặp trong form tạo mới để báo lỗi chi tiết khi người dùng gõ tên "Diamond".
- Sửa lỗi nút đối chiếu API bị lặp trong Modal Chi tiết yêu cầu Shopee (Duplicate Shopee API Reconciliation Buttons Fix):
  - Loại bỏ hoàn toàn thuộc tính `action` ở tiêu đề `DetailCard` phần đối chiếu để xóa nút "Đối chiếu API" ở góc phải khi kết quả đối chiếu đã hiển thị.
  - Tích hợp nút "Đối chiếu API" vào bên trong khung nét đứt khi trạng thái là chưa đối chiếu, và giữ nguyên nút "Đối chiếu lại API" dưới thông tin chi tiết khi đã đối chiếu, đảm bảo không bao giờ xuất hiện đồng thời hai nút.
- Bổ sung phân trang cho danh sách Lịch sử giao dịch điểm Admin (Loyalty Transactions Pagination):
  - Tích hợp bộ điều khiển phân trang (15 dòng mỗi trang) kèm hiển thị chỉ số dòng, số trang và các nút điều hướng (Trước/Sau) chuyên nghiệp trong [LoyaltyTransactionsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/loyalty/LoyaltyTransactionsSection.tsx), hỗ trợ hiển thị lịch sử điểm tối ưu và mượt mà hơn.
- Vá lỗi hiển thị ảnh đại diện khách hàng (Customer Avatar Path Resolution Fix):
  - Bổ sung hàm tiện ích `buildImageUrl` để giải mã và tự động ánh xạ các đường dẫn tương đối `/uploads/avatars/` của avatar thành URL tuyệt đối trỏ tới backend phục vụ hiển thị chính xác ở các trang client ([ProfilePage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/ProfilePage.tsx), [AccountShell.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/AccountShell.tsx) và [AccountLayout.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/AccountLayout.tsx)).
  - Nâng cấp hàm `uploadAvatarImage` trong [UploadService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/UploadService.php) của backend để tự động sinh URL tuyệt đối trỏ tới file ảnh dựa trên cấu hình `public_url`.
- Sửa lỗi preflight CORS cho phương thức PATCH (PATCH Preflight CORS Issue):
  - Bổ sung `PATCH` vào danh sách `Access-Control-Allow-Methods` trong file cấu hình CORS [cors.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Helpers/cors.php) ở backend, cho phép frontend thực hiện thành công các thao tác cập nhật hồ sơ cá nhân qua API.
- Tích hợp huy hiệu hình khiên (Shield Badge Icons) từ trang chủ vào Quản lý Hạng thành viên Admin (Admin Loyalty Tiers Visual Upgrade):
  - Thay thế biểu tượng Lucide `Award` mặc định bằng các hình ảnh huy hiệu hình khiên đặc quyền từ trang khách hàng (`badge_silver.png`, `badge_gold.png`, `badge_platinum.png`).
  - Ánh xạ tự động tên hạng thành viên (không phân biệt chữ hoa thường) với tệp ảnh tương ứng và có cơ chế fallback về huy hiệu Silver cho các hạng khác.
  - Cải tiến component `TierMedal` để hiển thị ảnh với hiệu ứng đổ bóng `shadow-[0_4px_12px_rgba(15,23,42,0.06)]` cao cấp, tối ưu kích thước để hiển thị đẹp mắt trong cả bảng danh sách và phần xem trước (modal preview).
- Sửa lỗi định tuyến Trang soạn thảo Tin tức Admin (Admin News Editor Routing Registration Fix):
  - Cấu hình và đăng ký đầy đủ các tuyến đường (routes) `/admin/news/new` và `/admin/news/:id/edit` liên kết tới trang soạn thảo [AdminNewsEditorPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminNewsEditorPage.tsx) bên trong [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx), khắc phục triệt để lỗi hiển thị trang trắng (blank page) khi click nút "Viết bài mới" hoặc "Sửa bài" tại trang Quản lý Tin tức.

### Removed
- Loại bỏ 3 tab "Hạng thành viên", "Quà & Voucher" và "Cấu hình 3F Club" khỏi trang Admin 3F Club (Removed Tiers, Rewards, and Settings Tabs):
  - Ẩn hoàn toàn các Tab điều hướng tương ứng và gỡ bỏ các panel JSX liên quan khỏi [ThreeFClubPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ThreeFClubPage.tsx) để phục vụ quá trình cấu trúc lại tính năng sau này.
  - Dọn dẹp sạch các component con liên quan nhập khẩu (`MembershipTiersSection`, `LoyaltyRewardsSection`, `LoyaltyRedemptionsSection`, `ClubSettingsSection`).
- Loại bỏ Tab "Cấu hình điểm" trong Admin 3F Club (Removed Points Config Tab):
  - Loại bỏ hoàn toàn Tab "Cấu hình điểm" (Coins tab) và component cấu hình quy tắc đổi điểm khỏi trang [ThreeFClubPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ThreeFClubPage.tsx) theo yêu cầu tinh giản luồng quản trị.

## [2026-06-21]
### Added
- Nâng cấp hệ thống Quản lý Quy trình & Trạng thái Đơn hàng đa chiều (CRM + Loyalty + Automation-ready):
  - Tách biệt trạng thái đơn hàng thành 4 chiều độc lập: Trạng thái đơn hàng (Order status), Trạng thái thanh toán (Payment status), Trạng thái vận chuyển (Shipping status), và Trạng thái tích điểm (Loyalty status).
  - Cấu trúc CSDL động hỗ trợ quản lý trạng thái qua các bảng `workflow_statuses`, `workflow_transitions`, `automation_rules`, `customer_activity_logs`, `notification_channels`, và `shipping_providers`.
  - Tích hợp công cụ cập nhật trạng thái đa chiều và lọc luồng chuyển đổi được cấu hình động từ database phía Admin Drawer Chi tiết Đơn hàng.
  - Xây dựng API và CSDL tích lũy điểm an toàn (Loyalty Safety Engine): Đảm bảo tự động cộng/hủy điểm chuẩn xác, chống cộng điểm trùng lặp bằng ràng buộc transaction lock và kiểm tra transaction lịch sử unique.
  - Xây dựng Timeline nhật ký hoạt động khách hàng (CRM Timeline) ghi nhận chi tiết mọi hành vi liên quan đến đơn hàng, giao vận, tích điểm và thay đổi thông tin.
  - Thiết kế và phát triển trang cấu hình hệ thống chuyên nghiệp phía Admin tại route `/admin/settings/workflows` (`AdminWorkflowSettingsPage.tsx`) cho phép quản lý trạng thái, bước chuyển giao, automation rules, nhà vận chuyển và cổng thông báo.
  - Tích hợp liên kết menu "Cấu hình Quy trình" vào sidebar Admin và đăng ký Route bảo mật an toàn.
- Hoàn tất kiểm thử QA tự động & thủ công (Manual & Automated QA Run):
  - Xác nhận an toàn di trú cơ sở dữ liệu (idempotent database migrations) và cơ chế ánh xạ trạng thái cũ (old status mapping) an toàn không làm mất mát/ảnh hưởng đơn hàng hiện có.
  - Kiểm thử 8 kịch bản nghiệp vụ (Case A - H) tích hợp liên quan đến trạng thái chuyển đổi hợp lệ/không hợp lệ, cập nhật độc lập các trục trạng thái, và ngăn chặn sửa đổi/xóa các khóa hệ thống trọng yếu.
  - Kiểm thử tính bất biến điểm thưởng (Loyalty Points Idempotency): Xác thực cơ chế ngăn cộng điểm trùng lặp cho đơn hàng và xử lý hoàn tác điểm chuẩn xác khi hủy/trả đơn.
- Tái cấu trúc API (API Naming Cleanup Refactor):
  - Khởi tạo [ordersApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/ordersApi.ts) chứa các API truy vấn/cập nhật đơn hàng.
  - Khởi tạo [workflowApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/workflowApi.ts) chứa các API cấu hình trạng thái, bước chuyển đổi, automation rules, nhà vận chuyển và cổng thông báo.
  - Loại bỏ hoàn toàn các phương thức và types liên quan đến đơn hàng/workflows khỏi [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts), nâng cao tính đóng gói (cohesion) và giảm kích thước file.
  - Cập nhật tất cả các màn hình admin/client tiêu thụ API tương ứng.

## [2026-06-20]
### Added
- Triển khai hệ thống Tin tức chuyên nghiệp đầy đủ nghiệp vụ SEO và trang tin tức làm đẹp:
  - Thiết kế và tích hợp trang quản lý Tin tức phía Admin tại `/admin/news` (`AdminNewsPage.tsx`) hiển thị danh sách bài viết, lượt xem thực tế và huy hiệu Điểm SEO (SEO Score) tự động tính toán.
  - Tích hợp các nút hành động CRUD (Thêm, Sửa, Xóa) bài viết và trigger cào tin tức tự động từ web nguồn `3fstore.vn` bằng Sonner toast loading state.
  - Phát triển component SEO metadata [seo-metadata.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/blog/seo-metadata.tsx) quản lý động các thẻ tiêu đề, mô tả, từ khóa, Open Graph và cấu trúc dữ liệu JSON-LD (BlogPosting & BreadcrumbList) chuẩn SEO.
  - Phát triển component Mục lục bài viết tự động [blog-toc.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/blog/blog-toc.tsx) thiết kế theo phong cách Paddy chuyên nghiệp (gồm phần Giới thiệu, các thẻ Heading H2/H3 đánh số thứ tự tuần tự dạng 1., 2. và kết thúc bằng phần Sản phẩm gợi ý; tự động highlight bằng màu xanh dương thương hiệu dựa trên IntersectionObserver khi cuộn trang, hỗ trợ cuộn mượt smooth scroll bù trừ khoảng cách header sticky).
  - Tích hợp số thứ tự dạng huy hiệu hình tròn màu xanh dương đầy phong cách (blue circular number badges) tự động gắn vào các thẻ tiêu đề H2/H3 trong thân bài viết của [BlogDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/BlogDetail.tsx) thông qua bộ phân tách DOMParser.
  - Tái cấu trúc [BlogDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/BlogDetail.tsx) thành bố cục 3 cột (3-column layout) chuẩn mực cao cấp: cột trái chứa Mục lục & Chia sẻ, cột giữa chứa Nội dung bài viết chính và Sản phẩm gợi ý, cột phải chứa cột bài viết Xu Hướng (Trending list).
  - Triển khai thanh đo tiến trình đọc bài viết (Reading Progress Bar) 3px ở đỉnh trang cùng nút cuộn nhanh lên đầu trang (Scroll-To-Top) dạng vòng tròn tiến độ SVG trực quan.
  - Tích hợp thanh chia sẻ bài viết [blog-share.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/blog/blog-share.tsx) dạng các icon tròn tối giản nằm gọn gàng bên dưới mục lục ở cột trái, hỗ trợ sao chép liên kết bài viết và liên kết chia sẻ trực tiếp qua Facebook, Twitter/X, Telegram.
  - Triển khai khối sản phẩm gợi ý [blog-related-products.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/blog/blog-related-products.tsx) tự động truy vấn sản phẩm trong kho cửa hàng dựa theo từ khóa SEO của bài viết để tối ưu tỷ lệ chuyển đổi.
- Triển khai hệ thống Quản lý Banner động chuyên nghiệp (Banner Management System):
  - Thiết kế và di trú bảng CSDL `banners` với các chỉ số hoạt động, thứ tự sắp xếp và thống kê hiệu năng (bao gồm cơ chế tự động seed dữ liệu 3 ảnh banner chính của trang chủ khi khởi tạo bảng).
  - Viết Model `Banner.php` và Controller `BannerController.php` để lấy danh sách banner đang chạy theo placement, tăng lượt click/impression không đồng bộ, và cung cấp đầy đủ các API CRUD cho Admin.
  - Xây dựng API tải ảnh banner lên hệ thống `UploadService::uploadBannerImage` hỗ trợ chặn định dạng độc hại (chỉ cho phép JPG/JPEG/PNG/WEBP, dung lượng tối đa 5MB) lưu trữ an toàn trong `/public/uploads/banners/`.
  - Thiết lập định nghĩa vị trí hiển thị hợp lệ (`home_hero_slider`) và kiểm tra tính hợp lệ trên cả frontend và backend.
  - Thiết kế trang quản lý Banner phía Admin tại `/admin/banners` hiển thị các chỉ số KPI động (tổng số banner, số đang hoạt động, tổng số click), bộ lọc trạng thái hiển thị, cùng form Modal thêm/sửa tích hợp tải ảnh trực quan và liên kết điều hướng (đã lược bỏ thời gian chạy start/end và chữ nút CTA để tối ưu hoá giao diện).
  - Tích hợp banner động vào trang chủ `HeroSection.tsx` tự động tải các placement tương ứng, chạy tracking click/impression trong nền, và tự động fallback về tài nguyên tĩnh mặc định nếu không có dữ liệu từ API hoặc API bị lỗi.
- Triển khai hệ thống cào tin tức tự động và tích hợp Blog động:
  - Thiết kế và di trú bảng CSDL `blog_posts` lưu trữ tin tức với cơ chế tự động chạy di trú trên backend.
  - Phát triển bộ cào tin tức bằng PHP `BlogPostController::adminCrawl` chạy trực tiếp trên môi trường staging thông qua API, cho phép cào 100% dữ liệu bài viết (tiêu đề, slug, tóm tắt, ảnh đại diện, nội dung bài viết dạng rich-text HTML và tự động chuyển các liên kết ảnh/link tương đối thành tuyệt đối).
  - Viết Model `BlogPost.php` và Controller `BlogPostController.php` cung cấp các API lấy danh sách bài viết phân trang (`/api/blog-posts`) và chi tiết bài viết theo slug (`/api/blog-posts/:slug`).
  - Xây dựng các trang giao diện frontend: trang danh sách tin tức `/tin-tuc` (`BlogList.tsx`) hỗ trợ bộ lọc danh mục và tìm kiếm, cùng trang chi tiết tin tức `/tin-tuc/:slug` (`BlogDetail.tsx`) hiển thị nội dung rich HTML an toàn bằng `DOMPurify` kết hợp sidebar hiển thị các bài viết mới nhất.
  - Đồng bộ hóa component bài viết trên trang chủ `BlogNewsletter.tsx` để hiển thị 4 bài viết mới nhất lấy trực tiếp từ API thay thế cho mảng dữ liệu tĩnh cũ.
  - Thêm liên kết điều hướng "Tin tức" trên thanh Header (`Header.tsx`) cho cả giao diện desktop và mobile drawer.

### Changed
- Tái cấu trúc và đồng bộ hóa component Card sản phẩm (`ProductCard.tsx`):
  - Đồng bộ thiết kế card sản phẩm giữa trang Sản phẩm yêu thích (`WishlistPage.tsx`), trang danh mục sản phẩm (`ProductListing.tsx`), và slider trang chủ (`ProductSlider.tsx`).
  - Nâng cấp `ProductCard.tsx` sử dụng cấu trúc giao diện premium của `/products` (hiển thị thương hiệu, hiệu ứng gradient glow và sweeping light shimmer khi hover, bo tròn góc `rounded-[24px]` và shadow-glass).
  - Tích hợp prop `showBuyNow?: boolean` cho phép tùy biến hiển thị 1 nút "Thêm vào giỏ" hoặc 2 nút "Thêm vào giỏ" & "Mua ngay". Cập nhật mặc định `showBuyNow` thành `true` để tất cả các trang (bao gồm cả trang yêu thích và danh sách danh mục) hiển thị giao diện 2 nút hành động chuyên nghiệp đồng bộ với trang chủ.
  - Loại bỏ hoàn toàn khối mã HTML card sản phẩm viết lặp (inline) trong `ProductListing.tsx` và thay thế bằng component `<ProductCard>`.
  - Thiết lập hiển thị đánh giá trung bình mặc định thành `5.0` sao nếu rating bằng `4.8` hoặc khi lượt review (`reviews`) bằng `0`.
  - Định dạng hiển thị giá giảm/giá cũ (`product.oldPrice`) có dấu gạch ngang (`line-through`), kích thước font nhỏ hơn giá bán thực tế, và đổi thành màu xám rõ ràng (`text-gray-400`).
  - Sửa lỗi API danh sách yêu thích của backend (`CustomerWishlist.php`): thay vì trả về `oldPrice` bằng `null`, backend hiện tại lấy `minOriginalPrice` và `maxOriginalPrice` từ các variant hoạt động và tự động định dạng `oldPrice` dạng khoảng giá hoặc giá đơn tương ứng (ví dụ: `133.900đ - 645.900đ`) đồng bộ với giao diện.
  - Thay thế nhãn Brand text thô bằng thẻ Nhãn Danh mục dạng Pill bo góc (ví dụ: `Thức ăn khô`, `Thức ăn ướt`) với nền mờ nhạt và màu thương hiệu nổi bật, lấy thông tin tự động dựa trên tên và phân loại của sản phẩm.

## [2026-06-19]
### Added
- Triển khai tính năng Sản phẩm yêu thích (Wishlist) chuẩn nghiệp vụ:
  - Thiết kế bảng cơ sở dữ liệu `customer_wishlists` liên kết `customer_id` và `product_id` có index và unique constraint.
  - Viết Model `CustomerWishlist.php` và Controller `CustomerWishlistController.php` để lấy danh sách, toggle trạng thái yêu thích, và đồng bộ mảng ID từ local storage.
  - Tích hợp `WishlistContext.tsx` quản lý offline local storage cho Khách vãng lai (Guest) và tự động gọi API đồng bộ lên MySQL ngay khi đăng ký/đăng nhập thành công.
  - Tạo trang danh sách yêu thích `/wishlist` (`WishlistPage.tsx`) dạng lưới sản phẩm responsive, hỗ trợ trạng thái trống (Empty State) và kêu gọi hành động mua sắm.
  - Cập nhật huy hiệu đếm số lượng (Badge Count) trên icon Yêu thích của Header (`Header.tsx`).
  - Thêm nút Trái tim Toggle yêu thích có hiệu ứng scale và màu sắc bằng Framer Motion nổi bật trên ảnh `ProductCard.tsx` (ẩn trên desktop cho đến khi hover, hiện mặc định trên mobile) và trang chi tiết `ProductDetail.tsx`.
  - Tích hợp nút Trái tim và hiển thị trạng thái màu đỏ đồng bộ cho danh sách sản phẩm trên trang danh mục Tất cả sản phẩm (`ProductListing.tsx`).
  - Viết kịch bản kiểm thử API tích hợp `scratch/test-wishlist-api.js` chạy thành công.
- Kết nối dữ liệu thời gian thực cho Admin Dashboard từ database MySQL:
  - Cập nhật backend `AdminDashboardController.getRevenueChart` để trả về doanh thu VND thô dạng số thực thay vì chia sẵn 1.000.000.
  - Tích hợp biểu đồ doanh thu `admin-revenue-chart.tsx` gọi API và hỗ trợ bộ lọc động 7 ngày / 30 ngày.
  - Triển khai thuật toán vẽ biểu đồ đường SVG tự động điều chỉnh tỷ lệ trục Y theo doanh thu lớn nhất của chu kỳ.
  - Tự động tính toán các chỉ số hộp tổng kết dưới biểu đồ (Tổng doanh thu, Tổng đơn hàng, Giá trị đơn trung bình, Đơn hàng TB/ngày) và so sánh phần trăm xu hướng tăng/giảm với kỳ trước đó.
- Tinh chỉnh trang quản lý và Dashboard của Admin:
  - Loại bỏ nút "Xuất CSV" và toàn bộ logic gọi API xuất file CSV khỏi trang Quản lý khách hàng (`AdminCustomersPage.tsx`).
  - Loại bỏ các chỉ số "Tỷ lệ chuyển đổi", "Giá trị đơn trung bình", "Đơn hoàn tất" và "Sản phẩm sắp hết hàng" khỏi Dashboard.
  - Thiết kế Dashboard KPI section nhỏ gọn, tinh tế và đẹp mắt với đúng 6 chỉ số còn lại (*Doanh thu hôm nay, Số đơn hôm nay, Đơn chờ xác nhận, Đơn đang giao, Khách hàng mới, Điểm 3F Club đã cộng*) nằm gọn trên một hàng ngang duy nhất ở màn hình desktop (`lg:grid-cols-6`).
  - Cải tiến component `AdminKpiCard.tsx` hỗ trợ co giãn linh hoạt và tối ưu kích thước text/padding để đảm bảo hiển thị hoàn hảo, không bị tràn hay lỗi dòng trên mọi kích cỡ màn hình.
  - Loại bỏ hai panel biểu đồ/danh sách *"Nguồn đơn hàng"* (donut chart) và *"Lead tư vấn mới nhất"* (AI leads list) khỏi Dashboard để tinh giản giao diện.
  - Sắp xếp lại hàng dưới của Dashboard thành 3 cột cân đối (`lg:grid-cols-3`): *"Yêu cầu Shopee mới nhất"*, *"Top sản phẩm bán chạy"* và *"Top nhu cầu thú cưng"*. Cả 3 panel đều có chiều cao đồng bộ `h-[360px]` giúp giao diện đạt trạng thái cân bằng tuyệt đối.
  - Sửa lỗi chính tả không có dấu tiếng Việt tại component *"Top sản phẩm bán chạy"* (`AdminTopProducts.tsx`): cập nhật tiêu đề thành *"Top sản phẩm bán chạy"*, phụ đề thành *"Sản phẩm có doanh số cao nhất"*, nút action thành *"7 ngày qua"*, nhãn số lượng thành *"Đã bán"*, và sửa định dạng đơn vị tiền tệ từ `"d"` thành ký hiệu chuẩn `"đ"`.

## [2026-06-17]
### Added
- Triển khai tính năng Tìm kiếm Sản phẩm Real-time trên Production:
  - Xây dựng component `ProductSearchBox.tsx` hỗ trợ tự động gợi ý dropdown (sản phẩm, phân loại, giá, rating, số đã bán), debounce 300ms, abort stale requests và bắt phím (ArrowUp, ArrowDown, Escape, Enter) cùng click-outside.
  - Tích hợp ô tìm kiếm mới vào desktop/mobile headers thay cho ô input tĩnh cũ.
  - Đồng bộ hóa tham số tìm kiếm `q` trên thanh URL với trang danh sách sản phẩm `ProductListing.tsx` và tự động cập nhật tiêu đề kết quả tìm kiếm.
  - Cập nhật backend `Product::listProducts` hỗ trợ tìm kiếm khớp chuỗi theo tên, thương hiệu, mô tả, slug sản phẩm và SKU/tên variant.
  - Sửa lỗi PDO `Invalid parameter number` bằng cách sử dụng các placeholder độc lập cho từng vị trí truy vấn.
  - Thêm cơ chế sắp xếp theo mức độ liên quan (relevance scoring) ưu tiên khớp đầu tên, sau đó là chứa trong tên, và thương hiệu.
  - Triển khai limit clamping tới max 20 sản phẩm cho gợi ý tìm kiếm để bảo vệ tài nguyên hệ thống.
- Tái cấu trúc toàn bộ luồng Giỏ hàng & Thanh toán và nghiệp vụ mã giảm giá trên Production:
  - Thiết kế layout 2 cột trên desktop (trái: giỏ hàng, thông tin khách, địa chỉ; phải: mã giảm giá, phương thức thanh toán, tổng tiền và nút đặt hàng) và tự động xếp cột dọc chuẩn nghiệp vụ trên mobile.
  - Tích hợp API hành chính Việt Nam v2 (`provinces.open-api.vn/api/v2`) tự động tải tỉnh/phường sau sáp nhập 07/2025, bỏ field Quận/Huyện trong luồng checkout mới.
  - Di trú database an toàn: tự động thêm cột `coupon_code` vào bảng `orders`, tạo bảng `coupons` và `coupon_usages` và tự động seed mã `GIAM50K` trên môi trường local/production.
  - Viết controller validation `/api/coupons/validate` kiểm tra tính hợp lệ của mã giảm giá (giá trị tối thiểu, giới hạn sử dụng toàn cục và theo khách hàng, ngày hiệu lực) và tính số tiền giảm chính xác.
  - Bảo vệ giao dịch (`createOrder`): validate lại coupon trên server, cập nhật số lần dùng và ghi log `coupon_usages` đồng bộ trong single transaction database.
  - Đồng bộ hiển thị đầy đủ mã giảm giá, giảm giá, tạm tính, phí vận chuyển và tổng tiền sau giảm tại trang Success, Theo dõi đơn hàng (Tracking), và trang Admin Orders (bảng danh sách và chi tiết Drawer).

### Fixed
- Sửa lỗi import components recruiter (`@/components/recruiter/...`) tại trang `RecruiterProfileReputation.tsx` bằng cách chuyển thành `@/src/components/recruiter/...` để phù hợp với alias `@` trỏ vào project root.
- Loại bỏ hoàn toàn section chọn Phương thức vận chuyển, hardcode phí ship = 0đ cả ở frontend và backend.
- Chuyển widget chọn phương thức thanh toán (COD / VietQR) từ form địa chỉ sang cột Summary bên phải trên trang Checkout.
- Đồng bộ số tiền VietQR tự động quét mã bằng tổng tiền thực tế sau khi trừ giảm giá của coupon.

### Added
- Triển khai luồng kết nối "Kết nối Shopee" (OAuth Connection Flow) cho 3F Store / 3F Club:
  - Thiết kế bảng `shopee_oauth_states` để bảo vệ chống giả mạo trạng thái kết nối và di trú an toàn bảng `shopee_tokens` mà không làm mất dữ liệu cũ.
  - Xây dựng `ShopeeService.php` cung cấp các helper ký chữ ký số HMAC-SHA256, xây dựng URL ủy quyền, trao đổi mã code lấy token, làm mới token và tải chi tiết shop/đơn hàng từ Shopee Open Platform API.
  - Bổ sung route admin `/api/admin/shopee/connect` tạo state ngẫu nhiên và route callback `/api/shopee/callback` (hỗ trợ cả dấu gạch chéo phụ) để xử lý hoàn tất quá trình xác thực và tự động redirect.
  - Thiết kế UI "Kết nối Shopee" với trạng thái đồng bộ hóa thời gian thực và tự động xử lý popup Sonner Toast từ query params trên trang quản trị `/admin/3f-club`.
- Triển khai tính năng Quick Add To Cart Modal (Chọn variant và số lượng nhanh ngoài danh sách sản phẩm):
  - Cập nhật các kiểu dữ liệu `Product` và `ProductVariant` trong `types/store.ts` và `src/api/productsApi.ts` để lưu trữ đầy đủ thông tin phân loại sản phẩm.
  - Tạo component `QuickAddToCartModal.tsx` thực hiện hiển thị modal, tải chi tiết sản phẩm, chọn variants linh hoạt, giới hạn số lượng theo tồn kho và thực hiện thêm giỏ/mua ngay.
  - Tích hợp modal và cấu hình hệ thống toast thông báo chung trên toàn trang di động & desktop tại `src/App.tsx`.
  - Cập nhật các nút thêm giỏ/mua ngay trên các product card tại `ProductCard.tsx`, `ProductListing.tsx`, `PetFoodSection.tsx`, và `SaleSection.tsx` để mở modal nhanh.
- Phân tích và triển khai toàn bộ luồng mua hàng cho 3F Store từ trang chủ đến hoàn tất đơn hàng và tích điểm 3F Club:
  - Thiết kế và triển khai cơ sở dữ liệu `orders_schema.sql` cho đơn hàng (`orders`, `order_items`, `order_status_logs`, `order_payment_proofs`).
  - Viết các models backend PHP: `Customer.php`, `Order.php`, `OrderItem.php` quản lý trạng thái, lịch sử logs và thông tin khách hàng giao hàng.
  - Xây dựng `InventoryService.php` thực hiện các cơ chế khóa dòng (`FOR UPDATE`) để giữ chỗ tồn kho khi tạo đơn (`reserve_order`), giải phóng khi hủy đơn (`release_order`), và trừ kho thật khi hoàn tất đơn (`fulfill_order`).
  - Tích hợp tính năng tích lũy điểm thưởng 3F Club tự động dựa trên quy tắc cấu hình động khi admin chuyển đơn hàng sang trạng thái `completed`. Đảm bảo tính idempotent tránh cộng điểm lặp.
  - Viết script tự động kiểm thử toàn bộ vòng đời đơn hàng, tồn kho và điểm thưởng `scripts/test-order-flow.php` chạy thành công.
  - Cập nhật frontend `src/api/productsApi.ts` với các API khách hàng (`createOrder`, `getOrderDetails`, `checkOrdersByPhone`).
  - Nâng cấp `ProductDetail.tsx` hỗ trợ chọn phân loại sản phẩm, cảnh báo chọn phân loại, cập nhật giá/SKU/ảnh/tồn kho động và disable các nút khi hết hàng.
  - Kết nối giỏ hàng và trang thanh toán `CartCheckout.tsx` gọi trực tiếp API `createOrder` của backend, xóa sạch giỏ hàng khi thành công và chuyển hướng.
  - Xây dựng trang `OrderSuccess.tsx` hiển thị mã đơn, thông tin nhận hàng, và hỗ trợ quét mã VietQR tự động điền thông tin chuyển khoản ngân hàng nếu chọn Bank Transfer.
  - Phát triển trang `OrderTracking.tsx` (/orders/:orderCode và /order-check) hiển thị timeline trạng thái đơn hàng và điểm thưởng tích lũy dự kiến/thực tế.
  - Cấu hình lại thanh điều hướng header `Header.tsx` liên kết trang Tra cứu đơn hàng và trang thành viên 3F Club.
  - Xây dựng trang quản lý đơn hàng Admin (`/admin/orders`) hỗ trợ tìm kiếm, lọc theo trạng thái/thanh toán, xem chi tiết và thực hiện chuyển đổi trạng thái (xác nhận, đóng gói, giao hàng, hoàn tất, hủy) và duyệt thanh toán chuyển khoản ngân hàng.
- Di chuyển toàn bộ dữ liệu danh mục sản phẩm từ file tĩnh `data/products.json` sang cơ sở dữ liệu MySQL thật:
  - Khởi tạo database schema `product_catalog_schema.sql` gồm các bảng `product_categories`, `products`, `product_variants`, `product_images`, `product_import_batches`, `product_import_rows`, và `inventory_transactions`.
  - Sửa lỗi độ dài khóa index (max key length 3072 bytes) trong MySQL bằng cách prefix index trường `image_url` thành `image_url(255)`.
  - Cập nhật script `scripts/import-products-json-to-mysql.mjs` hỗ trợ nullish coalescing cho mật khẩu rỗng để chạy mượt mà trên môi trường local.
  - Di chuyển thành công toàn bộ **113 sản phẩm** và **910 variants** lên cả database local và production.
  - Tích hợp và kiểm thử các API RESTful sản phẩm, danh mục và chi tiết sản phẩm trên backend PHP MVC.
  - Vệ sinh và xóa bỏ các tệp script di trú tạm thời trên môi trường production để bảo mật hệ thống.

## [2026-06-15]
### Added
- Gom các trang quản trị 3F Club thành một trang duy nhất dạng tab tại `/admin/3f-club`:
  - Tách các trang `ShopeeRequestsPage.tsx` và `LoyaltySettingsPage.tsx` thành các component section tương ứng (`ShopeeRequestsSection.tsx` và `LoyaltySettingsSection.tsx`) giúp tái sử dụng và giữ nguyên các link route cũ để đảm bảo tính tương thích ngược.
  - Thiết kế trang `ThreeFClubPage.tsx` tích hợp 5 tab hoạt động thực tế kết nối trực tiếp với backend API: Yêu cầu Shopee, Cấu hình điểm, Quà đổi điểm, Yêu cầu đổi quà và Lịch sử điểm.
  - Tích hợp bộ đếm summary cards (Tổng yêu cầu, Đang chờ duyệt, API hợp lệ, Đã duyệt, Quy đổi hiện tại) nhận dữ liệu trực tiếp và cập nhật theo thời gian thực từ các section qua callbacks.
  - Cập nhật điều hướng `admin-sidebar.tsx` để gom nhóm gọn gàng và chỉ hiển thị duy nhất menu "3F Club" dẫn tới `/admin/3f-club`.
- Triển khai phân hệ Quà đổi điểm, Yêu cầu đổi quà, và Lịch sử điểm cho 3F Club:
  - Tạo các bảng MySQL mới: `loyalty_rewards` (lưu trữ quà tặng/voucher, loại quà, điểm yêu cầu, tồn kho, giới hạn), `loyalty_reward_redemptions` (lưu trữ lịch sử yêu cầu đổi quà của khách hàng, trạng thái xử lý, người duyệt), và `customer_point_transactions` (lưu trữ chi tiết các giao dịch cộng/trừ/hoàn điểm).
  - Viết các model PHP backend tương ứng (`LoyaltyRewardModel.php`, `LoyaltyRewardRedemptionModel.php`, `CustomerPointTransactionModel.php`) tích hợp cơ chế tự động tạo bảng (auto-migration) và seeding dữ liệu quà mẫu (Voucher 50.000đ, Combo súp thưởng PetQ, Freeship) một cách an toàn bên ngoài các database transaction bằng cách sử dụng static `$migrated` flag.
  - Cập nhật logic tích điểm khi duyệt đơn Shopee (`ShopeePointRequestController.php`) và kiểm tra điểm khả dụng (`CustomerPointController.php`) để tích hợp transaction log thực tế và tính toán điểm khả dụng động thay vì hardcode.
  - Triển khai các API RESTful trong `LoyaltyController.php` phục vụ quản trị (quản lý quà tặng, duyệt/từ chối/bàn giao yêu cầu đổi quà, xem lịch sử điểm) và khách hàng (tra cứu điểm, xem danh sách quà hoạt động, yêu cầu đổi quà có kiểm tra stock/limit/điểm khả dụng qua database transaction và tự động hoàn điểm/tăng lại stock khi từ chối).
  - Xây dựng các UI component section phía admin (`LoyaltyRewardsSection.tsx`, `LoyaltyRedemptionsSection.tsx`, `LoyaltyTransactionsSection.tsx`) với đầy đủ bảng danh sách, modal tạo/sửa quà, filter loại quà/trạng thái và các hành động xử lý duyệt/từ chối/đã giao có xác nhận và hiển thị thông báo toast.
  - Phát triển trang Đổi quà Tích điểm phía khách hàng (`CustomerRewardsPage.tsx`) tại route `/3f-club/rewards` cho phép nhập SĐT để tra cứu hạng thành viên, điểm khả dụng, lịch sử giao dịch/yêu cầu đổi quà và đổi quà trực tuyến.
- Phát triển phân hệ Cấu hình Quy tắc Tích điểm (Loyalty Point Rules Configuration):
  - Thiết kế bảng `loyalty_point_rules` lưu cấu hình: số tiền quy đổi mỗi điểm (`money_per_point`), làm tròn (`rounding_mode`), đơn tối thiểu (`min_order_amount`), điểm tối đa (`max_points_per_order`), hệ số nhân (`multiplier`), trạng thái kích hoạt (`is_active`), starts_at, ends_at.
  - Tạo model `LoyaltyPointRuleModel.php` xử lý DB và tự động khởi tạo/seed quy tắc Shopee mặc định (10.000đ = 1 điểm, floor làm tròn) khi class được khởi tạo.
  - Xây dựng service `LoyaltyPointService.php` tính toán điểm linh hoạt theo quy tắc active.
  - Cập nhật logic `approve()` trong `ShopeePointRequestController.php` và `PointService::calculateShopeePoints` để tính toán điểm dựa trên quy tắc động thay vì hardcode. Ưu tiên số tiền đối chiếu thực tế `shopee_api_order_amount` nếu đơn hàng valid.
  - Cung cấp các API admin quản trị: xem danh sách quy tắc, tạo quy tắc, cập nhật quy tắc, tắt kích hoạt quy tắc, và API xem trước kết quả tích điểm (`/api/admin/loyalty/calculate-preview`).
  - Đăng ký route và fallback mapping trong `Router.php` và `index.php`.
  - Phát triển giao diện cài đặt Admin (`src/pages/admin/LoyaltySettingsPage.tsx`) hiển thị quy tắc, form chỉnh sửa trực quan, xem trước điểm tích lũy (Live Preview Calculator) và lịch sử các cấu hình.
  - Tích hợp route `/admin/loyalty-settings` vào `App.tsx` và liên kết điều hướng `"Cấu hình điểm"` trong `AdminSidebar.tsx`.
- Sửa lỗi UI và logic hiển thị trạng thái/actions trang Admin Shopee Requests:
  - Khắc phục lỗi cú pháp JSX hiển thị trùng lặp mã đơn và thiếu đóng khối điều kiện trong `ShopeeRequestDetailModal.tsx`.
  - Giới hạn hiển thị và kích hoạt các action button Duyệt/Từ chối chỉ khi `processingStatus === "pending"`.
  - Cập nhật text footer modal theo trạng thái duyệt (`approved` -> "Yêu cầu này đã được duyệt và cộng điểm.", `rejected` -> "Yêu cầu này đã bị từ chối.").
  - Thêm cảnh báo xác nhận `window.confirm` khi duyệt đơn hàng chưa hợp lệ trên Shopee API.
  - Sửa logic thống kê trên dashboard (stats card) và các tabs đếm số lượng để cùng sử dụng thời gian tạo đơn (`createdAt`) làm bộ lọc chính, thay vì sử dụng `approvedAt`.
  - Bổ sung cảnh báo lệch tiền chi tiết (chênh lệch số tiền cụ thể) trong modal so sánh thông tin.
  - Hiển thị badge cảnh báo phụ `⚠ Đã duyệt thủ công` trong bảng danh sách và modal nếu đơn hàng đã được duyệt nhưng API Shopee không hợp lệ.
- Tích hợp tính năng đối chiếu đơn Shopee (Shopee order verification) cho yêu cầu tích điểm:
  - Thêm các cột kết quả đối chiếu vào database (`matched_shopee_order_id`, `shopee_api_status`, `shopee_api_order_amount`, `shopee_api_raw_json`, `verified_at`, `verification_note`) trong bảng `shopee_point_requests` qua tính năng auto-migration khi model khởi động.
  - Viết controller `ShopeeVerifyController` độc lập xử lý single verify (`POST /api/admin/shopee/requests/verify`) và bulk verify (`POST /api/admin/shopee/requests/verify-bulk`).
  - Nâng cấp `ShopeeApiService` hỗ trợ custom GET query parameters, lấy valid token thông minh và gọi API detail đơn hàng Shopee.
  - Bổ sung kiểm tra trùng lặp (duplicate) mã đơn hàng, đối chiếu chéo trạng thái đơn hàng (`COMPLETED`) và cho phép sai số tổng tiền làm tròn tối đa 100 VND.
- Phát triển kịch bản và tài liệu deploy backend bằng Python qua FTP:
  - Viết script `scripts/deploy_ftp.py` đồng bộ hóa nội dung `3f-api/` lên Plesk `/httpdocs` qua FTP, lọc bỏ các file nhạy cảm và dữ liệu (`.env`, `storage/uploads`, `storage/logs`).
  - Hỗ trợ so sánh dung lượng file để tối ưu tốc độ upload và tránh overwrite file không đổi.
  - Tự động tạo thư mục remote đệ quy nếu chưa tồn tại.
  - Cập nhật `.gitignore` để tự động bỏ qua cấu hình cục bộ `.deploy.env`.
  - Soạn thảo tài liệu hướng dẫn chạy deploy chi tiết trong `docs/deploy-ftp-python.md`.
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
