# Code Standards & Guidelines

## 1. Naming Conventions
- **Files/Folders:** Kebab-case cho tên file chung (`development-rules.md`), PascalCase cho React Components (`ProductDetail.tsx`).
- **Variables/Functions:** camelCase (`getProductById`).
- **Classes/Types:** PascalCase (`ProductType`).

## 2. File Size Management
- Cố gắng giữ mỗi file mã nguồn (code) dưới **200 dòng**.
- Nếu một component vượt quá giới hạn này, hãy chia nhỏ thành các module phụ (vd: chia `ProductDetail` thành `ProductGallery`, `ProductInfo`).

## 3. Styling Rules
- Ưu tiên sử dụng **Tailwind CSS** cho các utility classes.
- Tránh viết CSS thuần vào `style={{}}` trừ trường hợp bắt buộc (dynamic calculation).
- Luôn sử dụng các classes responsive (`md:`, `lg:`) của Tailwind để hỗ trợ nhiều màn hình.
- Màu sắc, typography tuân thủ cấu hình trong `tailwind.config.ts`.

## 4. UI/UX Principles
- **Aesthetics:** Giao diện cần hiện đại, phong phú (gradient, glassmorphism, micro-animations bằng Framer Motion).
- Luôn chú trọng đến trải nghiệm người dùng, đặc biệt ở các trang Product Card (hiệu ứng hover, badge nổi bật) và Product Detail (cấu trúc hình ảnh sticky, cuộn mượt).

## 5. Development Workflow
- YAGNI (You Aren't Gonna Need It)
- KISS (Keep It Simple, Stupid)
- DRY (Don't Repeat Yourself)
- Luôn đảm bảo mã nguồn chạy được (`npm run dev` không có lỗi) và kiểm tra giao diện thực tế trước khi hoàn tất thay đổi.
