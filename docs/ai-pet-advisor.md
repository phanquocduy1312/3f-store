# Hướng dẫn chi tiết: Tính năng AI Tư Vấn Pet (AI Pet Advisor)

Tài liệu này mô tả toàn bộ quy trình hoạt động hiện tại, các tính năng chính và cách thức AI trả lời/gợi ý của tính năng **AI Pet Advisor Popup** trên hệ thống 3F Store.

---

## 1. Quy trình hiện tại của AI Tư Vấn Pet (Flow)

Quy trình tư vấn được thiết kế dưới dạng bài trắc nghiệm (Quiz) hiển thị qua Popup/Bottom Sheet, gồm các bước chính:

1. **Khởi tạo & Hiển thị (Trigger):**
   - **Tự động:** Popup tự động bật lên sau 7 giây kể từ khi người dùng vào trang.
   - **Thủ công:** Người dùng có thể tự mở thông qua nút "Pet Advisor" trên header hoặc nút nổi (floating button).
   - **Cơ chế lưu trữ:** Nếu người dùng đóng popup, hệ thống lưu `pet_popup_closed_at` vào SessionStorage để tránh làm phiền liên tục. Nếu đã hoàn thành tư vấn, lưu `pet_quiz_submitted_at` vào LocalStorage.

2. **Bước 1: Chọn loại thú cưng (Pet Type)**
   - Hệ thống hỏi người dùng đang nuôi "Chó", "Mèo", hoặc "Cả Hai".
   - Nếu chọn "Cả Hai", hệ thống sẽ hỏi tiếp: "Anh/chị muốn tư vấn bé nào trước?" để xác định luồng tư vấn chính (activeFlow).

3. **Bước 2: Trả lời câu hỏi Trắc nghiệm (Quiz Flow)**
   - Hệ thống sẽ hiển thị một chuỗi các câu hỏi dựa trên loại thú cưng được chọn (chó hoặc mèo).
   - **Luồng cho Chó (Dog Quiz):**
     - Giai đoạn tuổi (Dưới 6 tháng, 6–12 tháng, 1–7 tuổi, trên 7 tuổi)
     - Giống chó (Poodle, Pomeranian, Corgi, Golden, Khác...)
     - Cân nặng (Dưới 2kg, 2-5kg, 5-10kg...)
     - Loại lông (Ngắn, dài, rụng nhiều)
     - Nhu cầu chính (Ăn hàng ngày, kén ăn, tiêu hóa, da lông, tăng cân...)
     - Thức ăn hiện tại (Royal Canin, SmartHeart, Tự nấu...)
     - Ngân sách hàng tháng (Dưới 500k, 500k-1tr...)
   - **Luồng cho Mèo (Cat Quiz):**
     - Giai đoạn tuổi (Kitten, Adult, Senior)
     - Giống mèo (Anh lông ngắn, Ba Tư, Mèo ta...)
     - Loại lông
     - Nhu cầu chính (Búi lông - Hairball, đa mèo, tiêu hóa, tiết niệu...)
     - Số lượng mèo đang nuôi (1 bé, 2 bé, 3-5 bé...)
     - Tình trạng triệt sản (Đã/Chưa triệt sản)
     - Thức ăn hiện tại
     - Ngân sách hàng tháng

4. **Bước 3: Thu thập thông tin liên hệ (Contact Form)**
   - Yêu cầu nhập Tên, Số điện thoại và Email để nhận kết quả tư vấn và mã giảm giá (voucher).

5. **Bước 4: Xử lý và Hiển thị Kết quả (AI Result)**
   - Gửi toàn bộ dữ liệu (câu trả lời + thông tin liên hệ) tới AI (Groq API).
   - Hiển thị màn hình chờ (AiLoading) kèm Mascot animation.
   - Nhận và hiển thị kết quả tư vấn gồm: Lời khuyên, danh sách sản phẩm gợi ý, mẹo chăm sóc, và tặng Voucher.

---

## 2. Các Tính năng chính của Hệ thống

- **Dynamic Quiz Configuration:** Bộ câu hỏi được cấu hình động trong `quizConfig.ts`, hỗ trợ câu hỏi dạng chọn một (single_choice), chọn nhiều (multi_choice) và có thể mở ra ô nhập text tùy chỉnh (ví dụ: khi chọn "Khác").
- **Local Storage State Persistence:** Trạng thái của quiz được tự động lưu vào `localStorage` (chìa khóa `pet_advisor_state`). Nhờ đó, nếu người dùng vô tình tải lại trang (F5) hay tắt trình duyệt, họ vẫn có thể tiếp tục tại bước đang làm dở.
- **Tích hợp Groq API:** Sử dụng LLM tốc độ cao qua nền tảng Groq (model mặc định: `llama-3.1-8b-instant`) để tạo ra kết quả tư vấn cá nhân hóa thay vì dùng logic if-else cứng nhắc.
- **Fallback Mechanism (Cơ chế Dự phòng):** 
  - Trong trường hợp không có API Key hoặc gặp lỗi kết nối với Groq API, hệ thống sẽ tự động bắt lỗi và hiển thị **Kết quả mẫu mặc định (Fallback Result)** (được lấy từ `mockAiResult.ts`) kèm theo thông báo lỗi nhẹ nhàng trên UI, giúp gián đoạn trải nghiệm không bị đứt gãy.
- **Responsive UI & Animation:** Tối ưu hóa UI/UX với hiệu ứng chuyển cảnh từ thư viện `framer-motion`. Popup ở Desktop sẽ hiển thị chính giữa màn hình với Side Visual (có nền gradient + icon chân mèo), trong khi ở Mobile hiển thị dưới dạng Bottom Sheet (kéo từ dưới lên).

---

## 3. Cách AI trả lời & Gợi ý (AI Payload & Prompt)

Sự thông minh của AI được vận hành thông qua hàm `getPetAdviceFromGroq` trong file `groqApi.ts`.

### A. Dữ liệu gửi đi (Payload)
Hệ thống gom tất cả câu trả lời của khách hàng và danh sách sản phẩm hiện có của shop để gửi cho AI, bao gồm:
- **Thông tin khách hàng:** Tên, SĐT, Email.
- **Hồ sơ thú cưng (Pet Profile):** Loại thú cưng, giai đoạn tuổi, giống loài, trọng lượng, tình trạng lông, nhu cầu (vd: kén ăn, trị búi lông), tình trạng triệt sản, thức ăn hiện tại và ngân sách.
- **Ngữ cảnh cửa hàng (Store Context):**
  - Tên thương hiệu: "3F Store"
  - Voucher tặng: "30.000đ"
  - Danh mục sản phẩm (Product Catalog): Lấy trực tiếp từ database (tối đa 30 sản phẩm phù hợp loại thú cưng), cung cấp ID, tên sản phẩm, danh mục và giá để AI lựa chọn.

### B. System Prompt (Lệnh Hệ thống cho AI)
AI được thiết lập (roleplay) với các chỉ thị bắt buộc (bằng tiếng Việt):
1. **Vai trò:** Bạn là 3F AI Pet Advisor, trợ lý tư vấn chăm sóc chó mèo cho 3F Store.
2. **Phong cách:** Tiếng Việt, thân thiện, chuyên nghiệp, ngắn gọn. Gọi thú cưng là "bé".
3. **Nhiệm vụ cốt lõi:** LỌC RA ĐÚNG 5 SẢN PHẨM TỐT NHẤT từ `product_catalog` được cung cấp sao cho phù hợp với nhu cầu, độ tuổi, giống loài của bé.
4. **Giới hạn an toàn:** Không chẩn đoán bệnh, không kê đơn thuốc.
5. **Ràng buộc Output:** Phải chọn sản phẩm có thật (sử dụng ID sản phẩm). Kết thúc bằng lời kêu gọi hành động (CTA) sử dụng voucher.
6. **Định dạng trả về:** Bắt buộc là JSON hợp lệ (`response_format: { type: "json_object" }`), không chứa markdown.

### C. Định dạng Kết quả trả về (JSON Response Format)
Kết quả trả về được map vào `AiResultData` interface và bắt buộc phải có các trường sau:

- **`summary`**: Tóm tắt hồ sơ thú cưng thành 1 câu ngắn gọn (Vd: "Bé là mèo Anh lông ngắn, trưởng thành, có nhu cầu dưỡng da lông và ngân sách 1-2 triệu.").
- **`advice`**: Đoạn tư vấn chính chi tiết, giải thích lý do chế độ ăn này phù hợp với "bé".
- **`recommended_products`**: Một mảng (array) chứa tối đa 5 sản phẩm được gợi ý. Mỗi mục chứa:
  - `id`: Mã ID của sản phẩm để frontend link tới trang chi tiết.
  - `reason`: Lý do ngắn gọn, thuyết phục giải thích tại sao chọn sản phẩm này.
- **`care_tips`**: Một mảng các mẹo chăm sóc phụ thêm (Vd: "Nên trộn thức ăn mới dần trong 5-7 ngày", "Chuẩn bị đủ nước sạch").
- **`warning`**: Các cảnh báo cần thiết (nếu không có thì trả chuỗi rỗng).
- **`cta` / `voucher_code`**: Lời kêu gọi hành động và mã giảm giá (Mặc định được set ở frontend là `3F30K`).

Khi có kết quả từ AI, Component `AiResult.tsx` sẽ render các trường dữ liệu này một cách trực quan, cho phép người dùng click "Xem sản phẩm gợi ý", "Liên hệ chuyên gia tư vấn", hoặc "Chia sẻ qua Zalo".
