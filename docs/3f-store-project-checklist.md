# 3F STORE × 3F CLUB — CHECKLIST ĐỐI CHIẾU TÍNH NĂNG THỰC TẾ

Tài liệu đối chiếu và quản lý tiến độ các hạng mục tính năng của dự án 3F Store & 3F Club. Tất cả thông tin và trạng thái được trích xuất trực tiếp từ codebase và cơ sở dữ liệu thực tế (Cập nhật ngày 22/06/2026).

| # | Mã tính năng | Tên / Mô tả tính năng | Độ ưu tiên | Trạng thái | Ghi chú kỹ thuật thực tế (Codebase) |
|---|---|---|---|---|---|
| **1** | **Phân hệ Đăng ký & Xác thực (A1.x)** | | | | |
| 1 | A1.1 | Đăng nhập bằng Số điện thoại + xác thực mã OTP | P0 | ✅ Xong | Tích hợp Stringee OTP Gateway cùng Resend Email fallback. Sử dụng Provider Adapter Pattern. |
| 2 | A1.2 | Đếm ngược timeout OTP 60s và chặn resend trong 60s | P0 | ✅ Xong | Chặn spam OTP phía client và server thông qua OtpService. |
| 3 | A1.3 | Tự động tạo tài khoản khách hàng khi xác thực OTP lần đầu | P0 | ✅ Xong | Tạo tài khoản tự động bằng SĐT trong CustomerAuthController, không bắt buộc nhập mật khẩu. |
| 4 | A1.4 | Cơ chế duy trì trạng thái đăng nhập bằng JWT Cookie | P0 | ✅ Xong | Lưu JWT token trong HTTP-Only cookie chống XSS/CSRF. |
| 5 | A1.5 | Liên kết đăng nhập qua Google / Facebook | P1 | ✅ Xong | Đã tích hợp cơ chế liên kết tài khoản mạng xã hội ở frontend & backend. |
| 6 | A1.6 | Tự động cộng 50.000 điểm Welcome Bonus khi đăng ký | P0 | ✅ Xong | Tự động ghi nhận giao dịch cộng 50K điểm chào mừng khi kích hoạt tài khoản. |
| **2** | **Phân hệ Trang Khách hàng & 3F Club (A2.x)** | | | | |
| 7 | A2.1 | Chuyển phân hệ 3F Club thành Tab riêng biệt bên trái điều hướng | P0 | ✅ Xong | Địa chỉ /account/club hoạt động độc lập, hiển thị thông tin thành viên. |
| 8 | A2.2 | Hiển thị hạng thành viên động (Member, Silver, Gold, Diamond) | P0 | ✅ Xong | Hiển thị động hạng thành viên, hệ số tích điểm (multiplier) và giới hạn quy đổi (cap percent). |
| 9 | A2.3 | Thanh tiến trình kép tích lũy thăng hạng rolling 12 tháng | P0 | ✅ Xong | Đo lường số đơn hàng và tổng chi tiêu thực tế để hiển thị thanh tiến trình thăng hạng tiếp theo. |
| 10 | A2.4 | Hiển thị Locked Teaser Card khi chưa liên kết số điện thoại | P1 | ✅ Xong | Ẩn các chức năng đổi quà, hiển thị card khóa yêu cầu xác thực SĐT trước. |
| 11 | A2.5 | Nút CTA dẫn hướng và cuộn mượt đến vùng xác thực SĐT | P1 | ✅ Xong | Cuộn mượt xuống khu vực xác thực số điện thoại trên trang Profile. |
| 12 | A2.6 | Lịch sử tích lũy điểm và đổi quà của khách hàng | P0 | ✅ Xong | Hiển thị lưới lịch sử các giao dịch cộng/trừ điểm từ bảng loyalty_point_transactions. |
| **3** | **Phân hệ Tư vấn AI - Pet Advisor (A3.x)** | | | | |
| 13 | A3.1 | Popup Tư vấn AI Pet Advisor khảo sát thông tin thú cưng | P0 | ✅ Xong | Popup khảo sát thông tin loài, giống, tuổi, cân nặng, sức khỏe thú cưng. |
| 14 | A3.2 | Di chuyển logic gọi API Groq từ Client sang Proxy an toàn phía Backend | P0 | ✅ Xong | Định tuyến API thông qua đầu cuối bảo mật /api/customer/pet-advisor/consult. |
| 15 | A3.3 | Sử dụng model Llama-3.3-70b-versatile với giới hạn catalog thông minh | P0 | ✅ Xong | Chỉ gửi tối đa 20 sản phẩm phổ biến nhất từ database lên Groq để tránh lỗi TPM 413. |
| 16 | A3.4 | Tối ưu hóa matching sản phẩm bằng ID số thay vì slug dài | P0 | ✅ Xong | AI khớp nối trực tiếp qua ID sản phẩm thực tế, giảm thiểu lỗi khớp sản phẩm null. |
| 17 | A3.5 | AI đề xuất tối đa 9 sản phẩm chia đều cho 3 nhóm lựa chọn | P0 | ✅ Xong | Đề xuất tối đa 3 sản phẩm mỗi nhóm: Tiết kiệm (saving), Cân bằng (balanced), Cao cấp (premium). |
| 18 | A3.6 | Tự động ánh xạ mainImageUrl thành image tại frontend | P0 | ✅ Xong | Đảm bảo hình ảnh sản phẩm được hiển thị chính xác, sửa lỗi broken image. |
| 19 | A3.7 | Màn hình kết quả tư vấn AI chuyên nghiệp | P0 | ✅ Xong | Giao diện kết quả gồm Tóm tắt sức khỏe, Lời khuyên, Cảnh báo (nếu nặng) và voucher tặng kèm. |
| 20 | A3.8 | Khớp nối sản phẩm gợi ý trực quan từ database thực tế | P0 | ✅ Xong | Hiển thị ảnh sản phẩm thật, tên sản phẩm, giá bán thực tế và nút chọn mua nhanh. |
| 21 | A3.9 | Tự động lưu hồ sơ tư vấn vào CSDL customer_pets | P0 | ✅ Xong | Tạo và lưu trữ hồ sơ thú cưng kèm kết quả tư vấn AI vào cơ sở dữ liệu khi thành viên đăng nhập. |
| 22 | A3.10 | Trang quản lý Lịch sử tư vấn dinh dưỡng của tôi | P0 | ✅ Xong | Hiển thị danh sách lịch sử tư vấn của khách hàng trong trang Account. |
| 23 | A3.11 | Tích hợp khối Thông tin đầu vào của bé vào modal chi tiết tư vấn | P0 | ✅ Xong | Hiển thị các thông tin khảo sát ban đầu cùng với lời khuyên chi tiết từ AI. |
| 24 | A3.12 | Cấu trúc dữ liệu đầy đủ cho FALLBACK_RESULT khi hệ thống gián đoạn | P0 | ✅ Xong | Hiển thị kết quả tư vấn tiêu chuẩn và sản phẩm thực tế dự phòng khi API Groq bị lỗi hoặc quá hạn ngạch. |
| **4** | **Phân hệ Mua sắm, Giỏ hàng & Thanh toán (A4.x)** | | | | |
| 25 | A4.1 | Tìm kiếm sản phẩm real-time có dropdown tự động gợi ý | P0 | ✅ Xong | Debounce 300ms, tìm kiếm và gợi ý nhanh sản phẩm theo tên/phân loại trên thanh tìm kiếm. |
| 26 | A4.2 | Trang chi tiết sản phẩm đầy đủ thông tin | P0 | ✅ Xong | Trang PDP hiển thị mô tả sản phẩm, bộ sưu tập hình ảnh, chọn phân loại variant cập nhật giá bán. |
| 27 | A4.3 | Chọn variants nhanh ngoài danh sách sản phẩm | P1 | ✅ Xong | Quick Add to Cart Modal cho phép chọn variant và thêm nhanh vào giỏ ngay từ trang danh sách. |
| 28 | A4.4 | Giao diện thanh toán 1-page checkout | P0 | ✅ Xong | Giao diện Cart & Checkout tích hợp trên 1 trang duy nhất, tối ưu trải nghiệm đặt hàng. |
| 29 | A4.5 | Validate địa chỉ giao hàng bằng dropdown chuẩn Việt Nam | P0 | ✅ Xong | Tích hợp API hành chính VN v2, tự động load danh sách Tỉnh/Xã ở trang thanh toán. |
| 30 | A4.6 | Phê duyệt áp dụng mã giảm giá (coupon code) phía backend | P0 | ✅ Xong | Backend validate tính hợp lệ của coupon (thời gian, min order, số lượt dùng) và giảm trừ giá trị đơn hàng. |
| 31 | A4.7 | Thanh toán VietQR động tự động sinh mã QR | P0 | ✅ Xong | Tự động tạo link quét mã VietQR ngân hàng MB Bank chứa số tiền đơn hàng và nội dung chuyển khoản động. |
| 32 | A4.8 | Trang theo dõi trạng thái đơn hàng (Order Tracking) | P0 | ✅ Xong | Trang tra cứu đơn hàng hiển thị chi tiết timeline trạng thái thanh toán, giao nhận thực tế. |
| 33 | A4.9 | Tích hợp cổng thanh toán trực tuyến (SePay / Stripe) | P2 | ⬜ Chưa | Dự kiến trong tương lai để tích hợp cổng thanh toán tự động xác nhận qua ngân hàng hoặc cổng thẻ. |
| **5** | **Phân hệ Tin tức & Blog (A5.x)** | | | | |
| 34 | A5.1 | Trang danh sách tin tức chuẩn SEO phân trang | P1 | ✅ Xong | Trang danh sách blog hỗ trợ phân trang chuẩn SEO, lọc theo danh mục tin tức. |
| 35 | A5.2 | Trang chi tiết bài viết bố cục 3 cột chuyên nghiệp | P1 | ✅ Xong | Trang chi tiết bài viết có mục lục Table of Contents tự động highlight, thanh tiến trình đọc bài. |
| 36 | A5.3 | Tự động đánh số tiêu đề bài viết dạng huy hiệu tròn màu xanh | P1 | ✅ Xong | DOMParser tự động thêm huy hiệu số thứ tự trước tiêu đề H2/H3 bài viết. |
| 37 | A5.4 | Cào tin tức tự động từ web nguồn 3fstore.vn | P1 | ✅ Xong | Script backend tự động cào bài viết, chuyển đổi các đường dẫn ảnh tương đối sang tuyệt đối. |
| **6** | **Phân hệ Quản lý Đơn hàng Admin (A6.x)** | | | | |
| 38 | A6.1 | Danh sách đơn hàng phía Admin, bộ lọc đa chỉ số | P0 | ✅ Xong | Bộ lọc đơn hàng admin theo trạng thái đơn, thanh toán, giao nhận, mã đơn và thời gian. |
| 39 | A6.2 | Nhật ký hoạt động khách hàng CRM Timeline | P0 | ✅ Xong | Ghi nhận mọi biến động liên quan đến đơn hàng, giao vận, tích điểm của khách hàng. |
| 40 | A6.3 | Phân rã trạng thái đơn hàng thành 4 trục độc lập | P0 | ✅ Xong | Tách biệt rõ ràng 4 trạng thái độc lập của đơn hàng: Đơn, Thanh toán, Vận chuyển, Tích điểm. |
| 41 | A6.4 | Cấu hình quy trình đơn hàng và automation rules | P0 | ✅ Xong | Cấu hình các bước chuyển trạng thái hợp lệ, rules tự động hóa quy trình xử lý đơn hàng. |
| **7** | **Phân hệ Quản trị Catalog & Sản phẩm Admin (A7.x)** | | | | |
| 42 | A7.1 | Quản lý danh sách sản phẩm & danh mục | P0 | ✅ Xong | Giao diện CRUD danh mục thú cưng (chó/mèo), thương hiệu và sản phẩm. |
| 43 | A7.2 | Thiết kế lại giao diện Biến thể sản phẩm (Variant Cards) | P0 | ✅ Xong | Giao diện quản lý variant dạng thẻ trực quan, tự sinh SKU, validate trùng SKU và cuộn nhanh đến lỗi. |
| 44 | A7.3 | Lưu sản phẩm thiếu ảnh đại diện dưới dạng Cảnh báo (Warning) | P1 | ✅ Xong | Cho phép lưu thông tin sản phẩm và hiển thị cảnh báo warning thay vì chặn cứng không cho lưu. |
| **8** | **Phân hệ Quản lý Thành viên 3F Club Admin (A8.x)** | | | | |
| 45 | A8.1 | Quản lý yêu cầu tích điểm Shopee Requests | P0 | ✅ Xong | Duyệt đơn Shopee tích điểm qua API Shopee Sandbox, OCR quét hóa đơn Shopee ở Admin. |
| 46 | A8.2 | Loại bỏ tính năng tạo Shopee Request thủ công từ Client | P1 | ✅ Xong | Chỉ cho phép client tạo yêu cầu tích điểm tự động để chống gian lận. |
| 47 | A8.3 | Cấu hình Hạng thành viên động kết nối CSDL | P0 | ✅ Xong | Cho phép cấu hình chi tiêu thăng hạng, hệ số điểm thưởng và hạn mức đổi quà trong admin. |
| 48 | A8.4 | Khóa hạng Diamond ở chế độ Read-Only hoàn toàn | P1 | ✅ Xong | Hạng Diamond là hệ thống mặc định, khóa chức năng chỉnh sửa/xóa phía admin. |
| 49 | A8.5 | Quản lý Quà đổi điểm (Rewards) và duyệt yêu cầu đổi quà | P0 | ✅ Xong | CRUD danh mục quà tặng đổi điểm, danh sách redemptions và duyệt đổi quà tự động trừ điểm. |
| 50 | A8.6 | Quản lý Banners Slider trang chủ | P1 | ✅ Xong | CRUD banner trang chủ, thiết lập thời gian chạy và đo lường impressions/clicks chiến dịch. |
| 51 | A8.7 | Cộng / trừ điểm thủ công cho thành viên phía Admin | P2 | ⬜ Chưa | Nằm trong kế hoạch Phase 6 của lộ trình phát triển 3F Club CRM. |
| 52 | A8.8 | Xác thực OTP khi thực hiện đổi điểm / đổi quà | P2 | ⬜ Chưa | Nằm trong kế hoạch Phase 6 để bảo mật tài khoản điểm của thành viên. |
| 53 | A8.9 | Tính năng tích điểm Holding từ các kênh Shopee / TikTok | P2 | ⬜ Chưa | Nằm trong kế hoạch Phase 6 để ghi nhận điểm tạm giữ từ đơn hàng sàn thương mại điện tử. |
| 54 | A8.10 | Thông báo tự động nhắc nhở điểm 3F Club sắp hết hạn | P2 | ⬜ Chưa | Nằm trong kế hoạch Phase 6 gửi email cảnh báo điểm tích lũy sắp bị reset. |
