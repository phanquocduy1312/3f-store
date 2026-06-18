# Phase 3: Verification & Integration Tests

**Methods:**
* Compilation checks: TypeScript typecheck and Vite bundler execution.
* Manual scenario checks.

---

## 1. Local Compile & Typecheck
Verify that all React/TypeScript additions are type-safe and bundler compiles correctly:
* Run command: `npx tsc --noEmit`
* Run command: `npm run build`

---

## 2. Test Cases for Coupon System

### Test Case 2.1: Invalid Coupon Code
* **Actions**: Enter `INVALIDCODE` and click "Áp dụng".
* **Expectations**: Button is active only when field is not empty; API returns `success: false`; UI displays error warning "Mã giảm giá không hợp lệ.".

### Test Case 2.2: Eligible Coupon Code
* **Actions**: Enter `GIAM50K` with items subtotaling >= 399.000đ.
* **Expectations**: Coupon validates successfully; subtotal displays applied voucher card; final total is decreased by 50.000đ.

### Test Case 2.3: Ineligible Coupon Code
* **Actions**: Enter `GIAM50K` with items subtotaling < 399.000đ.
* **Expectations**: API returns validation failure; UI displays error warning "Đơn hàng chưa đủ điều kiện áp dụng mã.".

### Test Case 2.4: Coupon Removal
* **Actions**: Apply `GIAM50K` successfully, then click "Gỡ mã".
* **Expectations**: Applied coupon state is cleared; totals revert to original amount.

---

## 3. Test Cases for Administrative Divisions v2 API

### Test Case 3.1: Province Loading
* **Actions**: Open checkout page.
* **Expectations**: Dynamic dropdown fetches and displays list of provinces from open-api.vn.

### Test Case 3.2: Ward Loading
* **Actions**: Select "Thành phố Hồ Chí Minh" as province.
* **Expectations**: Dynamic dropdown fetches and displays correct wards list of HCM.

### Test Case 3.3: Empty Selection Validation
* **Actions**: Click "Xác nhận & Đặt hàng" without filling out province or ward.
* **Expectations**: Checkout submission is blocked, prompting user to complete delivery info.

---

## 4. End-to-End Order Creation & Admin Sync

### Test Case 4.1: Order Placement with Coupon
* **Actions**: Checkout an order with coupon `GIAM50K`.
* **Expectations**: Checkout completes; client redirects to success page; DB order stores `coupon_code = 'GIAM50K'`, `discount = 50000.00`, and correct total. `coupon_usages` contains new log record.

### Test Case 4.2: Admin Panel Validation
* **Actions**: Open Admin dashboard order view, review placed order.
* **Expectations**: Table shows total amount after discount; order detail drawer correctly displays:
  - Tạm tính
  - Phí vận chuyển: 0đ
  - Mã giảm giá: GIAM50K
  - Giảm giá: -50.000đ
  - Tổng cộng
