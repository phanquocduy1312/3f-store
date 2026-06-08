# Codebase Summary

## 1. Tech Stack
- **Framework:** React + Vite
- **Language:** TypeScript (`.tsx` and `.ts`)
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Icons:** Lucide React, FontAwesome
- **Animations:** Framer Motion

## 2. Directory Structure
```
ccc/
├── components/        # Reusable UI components (ProductCard, Header, Footer)
├── data/              # Mock data and global store logic (store.ts)
├── docs/              # Project documentation (this folder)
├── public/            # Static assets (images, logos)
├── src/
│   ├── App.tsx        # Main application routing and wrapper
│   ├── main.tsx       # Entry point
│   ├── pages/         # Page components (Home, Products, ProductDetail)
│   └── ...
├── tailwind.config.ts # Tailwind CSS configuration
└── vite.config.mjs    # Vite bundler configuration
```

## 3. Key Components
- **`App.tsx`**: Chứa `BrowserRouter`, `Routes` và layout chung (Header, Footer).
- **`store.ts`**: Quản lý state và dữ liệu (mock data) sản phẩm. Cung cấp hàm `getProductById` để lấy dữ liệu.
- **`ProductCard.tsx`**: Component hiển thị thông tin tóm tắt của một sản phẩm, sử dụng Framer Motion để tạo hiệu ứng hover.
- **`ProductDetail.tsx`**: Trang chi tiết sản phẩm phức tạp với gallery cuộn dính (sticky left panel) và nội dung scroll bên phải.
