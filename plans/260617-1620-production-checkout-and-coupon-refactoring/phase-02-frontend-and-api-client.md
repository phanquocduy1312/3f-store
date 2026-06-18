# Phase 2: Frontend Layout & Administrative Division API

**Related Files:**
* Provinces API client: [vietnamProvincesApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/vietnamProvincesApi.ts)
* Products/Orders API: [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)
* Cart & Checkout Page: [CartCheckout.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/CartCheckout.tsx)
* Delivery Form component: [DeliveryForm.tsx](file:///c:/Users/Admin/Downloads/ccc/components/CartCheckout/DeliveryForm.tsx)
* Order Summary component: [OrderSummary.tsx](file:///c:/Users/Admin/Downloads/ccc/components/CartCheckout/OrderSummary.tsx)

---

## 1. Vietnam Administrative divisions v2 Client (`vietnamProvincesApi.ts`)
Create a client to fetch divisions from `https://provinces.open-api.vn/api/v2/`:
* `getProvinces()`: Fetch all provinces.
* `getProvinceDetail(code)`: Fetch specific province detail including wards (using `depth=2`).

---

## 2. API Coupon Validation Helpers (`productsApi.ts`)
Create typescript client helpers for validating coupon codes on backend:
* `validateCoupon(code, subtotal, items, customerPhone)` calling `POST /api/coupons/validate`.

---

## 3. Delivery Form Component Refactoring (`DeliveryForm.tsx`)
Update form inputs to use the new v2 administrative divisions:
* Load list of provinces on mount.
* On province select, load its wards dynamically.
* Remove "Quận / Huyện" field entirely to reflect the v2 level configuration.
* Keep detailed address line input and notes input.
* Return raw codes and names to parent (`CartCheckout.tsx`) for submission.

---

## 4. Order Summary Component Refactoring (`OrderSummary.tsx`)
Modify component logic to handle the new coupon validation UI:
* Remove the shipping method selection widget (shipping fee is hardcoded to 0).
* Remove the hardcoded quick voucher select buttons.
* Add text input field with placeholder "Nhập mã giảm giá" and an "Áp dụng" button.
* Display applied coupon badge (e.g. GIAM50K, discount value, and a "Gỡ mã" button).
* Show grand total calculations correctly.

---

## 5. Cart Checkout Main Page Refactoring (`CartCheckout.tsx`)
Reorganize component layout and state:
* Implement 2-column grid layout for desktop, single column for mobile.
* Position Cart items, Customer Info, and Delivery Form in the Left Column.
* Position Coupon Input, Payment method options, Summary breakdown, and Checkout button in the Right Column (sticky).
* Verify mobile rendering follows specific sequence (Sản phẩm -> Khách hàng -> Địa chỉ -> Mã giảm giá -> Thanh toán -> Tổng tiền).
* Remove shipping fee logic (hardcode fee = 0).
* Move payment method selection from left column delivery form to the right column.
* Format address payload sent to backend as:
  ```json
  {
    "receiverName": "...",
    "phone": "...",
    "provinceCode": "...",
    "provinceName": "...",
    "wardCode": "...",
    "wardName": "...",
    "addressLine": "...",
    "note": "..."
  }
  ```
* Include `couponCode` parameter in checkout payload.
