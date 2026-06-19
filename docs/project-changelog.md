# Project Changelog

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
