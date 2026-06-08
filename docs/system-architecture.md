# System Architecture

## 1. High-Level Architecture
Dự án được xây dựng theo mô hình Client-Side Rendering (CSR) tiêu chuẩn sử dụng React.
- **Frontend Layer:** Chịu trách nhiệm hiển thị UI, routing và quản lý state.
- **Data Layer:** Hiện tại sử dụng Mock Data (cứng) bên trong `store.ts`. Trong tương lai sẽ thay thế bằng API Fetching để gọi lên Backend thực.

## 2. Component Interaction & Data Flow
1. **Routing:** Người dùng truy cập URL, `react-router-dom` ở `App.tsx` quyết định component Page nào được render (`Home`, `Products`, `ProductDetail`).
2. **Data Fetching:** Component Page gọi các hàm từ `data/store.ts` (như `getProductById()`) để lấy dữ liệu.
3. **Rendering:** Dữ liệu được truyền dưới dạng Props xuống các UI components con (`ProductCard`, `ProductSlider`, `Image`...).
4. **State Management:** Sử dụng React Hooks cơ bản (`useState`, `useEffect`) cho các logic UI cục bộ (chọn phân loại, số lượng...).

## 3. Key Technical Decisions
- **Vite:** Thay thế Create React App (CRA) để tăng tốc độ build và HMR.
- **Tailwind CSS:** Hỗ trợ styling trực tiếp trên HTML elements, giúp duy trì tốc độ phát triển cực cao và giảm phình to file CSS.
- **Framer Motion:** Thư viện chuẩn được chọn để xử lý toàn bộ các animation (nhảy, lướt, fade in) nhằm đạt được mục tiêu UI/UX cao cấp (wao effect).
