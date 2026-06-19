# Kế hoạch làm lại trang Profile khách hàng

## Mục tiêu

Làm lại khu vực `/account/*` thành trung tâm tài khoản khách hàng đúng nghiệp vụ thương mại điện tử pet store, không chỉ là form sửa thông tin cá nhân.

Trang mới cần giúp khách hàng:

- Xem nhanh trạng thái tài khoản, đơn hàng, voucher, điểm 3F Club.
- Cập nhật hồ sơ cá nhân và ảnh đại diện.
- Quản lý số điện thoại, email, địa chỉ giao hàng.
- Theo dõi đơn hàng và xem chi tiết sản phẩm trong đơn.
- Quản lý hồ sơ thú cưng để phục vụ AI Pet Advisor và gợi ý sản phẩm.
- Quản lý bảo mật: mật khẩu, phiên đăng nhập, đăng xuất thiết bị.

## Phạm vi màn hình

### Route chính

- `/account/profile`: hồ sơ cá nhân, xác thực liên hệ, trạng thái hoàn thiện hồ sơ.
- `/account/orders`: lịch sử đơn hàng, filter trạng thái, chi tiết đơn, sản phẩm trong đơn.
- `/account/addresses`: sổ địa chỉ, địa chỉ mặc định, thêm/sửa/xóa.
- `/account/pets`: hồ sơ thú cưng, thêm/sửa/xóa pet.
- `/account/security`: đổi mật khẩu, phiên đăng nhập, đăng xuất thiết bị.

### File frontend liên quan

- `src/App.tsx`
- `src/pages/client/account/AccountShell.tsx`
- `src/pages/client/account/ProfilePage.tsx`
- `src/pages/client/account/OrdersPage.tsx`
- `src/pages/client/account/AddressesPage.tsx`
- `src/pages/client/account/PetsPage.tsx`
- `src/pages/client/account/SecurityPage.tsx`
- `src/components/Account/*`
- `src/api/customerProfileApi.ts`
- `src/api/customerOrdersApi.ts`
- `src/api/customerAddressesApi.ts`
- `src/api/customerPetsApi.ts`
- `src/api/customerSecurityApi.ts`

## UX định hướng

### Tổng thể account

Account shell cần có:

- Header tài khoản: avatar, tên khách, trạng thái xác minh, số điện thoại/email.
- Summary nhanh: tổng đơn hàng, voucher khả dụng, phần trăm hoàn thiện hồ sơ.
- Sidebar/tab điều hướng rõ: Hồ sơ, Đơn hàng, Địa chỉ, Thú cưng, Bảo mật.
- Responsive tốt:
  - Desktop: sidebar trái, content phải.
  - Mobile/tablet: navigation ngang có scroll, card gọn, không tràn chữ.

Không làm landing page trong account. Màn đầu phải là công cụ quản lý tài khoản thực tế.

### Profile page

Cấu trúc đề xuất:

1. Profile summary card
   - Avatar lớn.
   - Họ tên.
   - Badge xác minh số điện thoại.
   - Progress hoàn thiện hồ sơ.

2. Form thông tin cá nhân
   - Họ tên.
   - Email.
   - Ngày sinh.
   - Giới tính.
   - Nút lưu có loading state.

3. Xác thực liên hệ
   - Số điện thoại hiện tại.
   - Trạng thái verified/unverified.
   - Đổi số điện thoại bằng OTP.
   - Email và trạng thái xác minh.

4. Account metadata
   - Ngày tham gia.
   - Có/chưa có mật khẩu.
   - Gợi ý bước còn thiếu để hoàn thiện hồ sơ.

### Orders page

Nghiệp vụ cần có:

- Tab filter: Tất cả, Chờ xác nhận, Đang xử lý, Đang giao, Hoàn tất, Đã hủy.
- Mỗi order hiển thị:
  - Mã đơn.
  - Ngày tạo.
  - Trạng thái đơn.
  - Trạng thái thanh toán.
  - Tổng tiền.
  - Danh sách sản phẩm rút gọn.
- Chi tiết đơn mở tại chỗ hoặc chuyển route tracking:
  - Thông tin giao hàng.
  - Sản phẩm, phân loại, số lượng, giá.
  - Tạm tính, phí ship, giảm giá, tổng cộng.
  - Timeline trạng thái.
- Hành động:
  - Theo dõi đơn.
  - Hủy đơn nếu trạng thái cho phép.
  - Mua lại nếu API hỗ trợ.

### Addresses page

Nghiệp vụ cần có:

- Danh sách địa chỉ theo thứ tự: mặc định trước, mới nhất sau.
- Thêm địa chỉ mới.
- Sửa địa chỉ.
- Xóa địa chỉ không mặc định.
- Đặt làm mặc định.
- Empty state có CTA thêm địa chỉ.

Modal địa chỉ cần có:

- Người nhận.
- Số điện thoại.
- Tỉnh/thành.
- Phường/xã.
- Địa chỉ chi tiết.
- Loại địa chỉ: nhà riêng, văn phòng, khác.
- Checkbox đặt mặc định.

### Pets page

Nghiệp vụ cần có:

- Danh sách pet dạng card.
- Thêm/sửa/xóa pet.
- Trường dữ liệu:
  - Tên pet.
  - Loài: chó, mèo, khác.
  - Giống.
  - Giới tính.
  - Ngày sinh.
  - Cân nặng.
  - Dị ứng.
  - Món yêu thích.
  - Ghi chú sức khỏe.
- Nêu rõ dữ liệu pet sẽ phục vụ AI Pet Advisor và gợi ý sản phẩm.

### Security page

Nghiệp vụ cần có:

- Đổi mật khẩu:
  - Nếu tài khoản chưa có mật khẩu: tạo mật khẩu mới.
  - Nếu đã có mật khẩu: yêu cầu mật khẩu hiện tại.
- Danh sách phiên đăng nhập:
  - Thiết bị/user agent.
  - IP.
  - Thời gian đăng nhập.
  - Badge phiên hiện tại.
- Hành động:
  - Hủy từng phiên khác.
  - Đăng xuất tất cả thiết bị khác.

## API contract cần kiểm tra

### Profile

`GET /api/customer/profile`

Cần trả:

```ts
{
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  birthday: string | null;
  gender: string | null;
  phoneVerifiedAt: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  hasPassword: boolean;
  stats: {
    totalOrders: number;
    processingOrders: number;
    availableVouchers: number;
    profileCompletion: number;
  };
}
```

`PATCH /api/customer/profile`

Cần hỗ trợ:

- `fullName`
- `email`
- `birthday`
- `gender`
- `avatarUrl`

`POST /api/customer/profile/request-phone-change`

Cần trả:

- `success`
- `message`
- `devOtp` chỉ trong môi trường dev.

`POST /api/customer/profile/verify-phone-change`

Cần đổi số điện thoại và đánh dấu verified.

### Orders

`GET /api/customer/orders`

Cần trả order có đủ:

- `items`
- `totalAmount`
- `subtotalAmount`
- `shippingFee`
- `discountAmount`
- `couponCode`
- `status_logs` nếu có.

Nếu endpoint hiện tại chỉ trả summary, cần bổ sung backend để tránh frontend phải fallback.

### Addresses

`GET /api/customer/addresses`

`POST /api/customer/addresses`

`PATCH /api/customer/addresses/:id`

`DELETE /api/customer/addresses/:id`

`POST /api/customer/addresses/:id/default`

### Pets

`GET /api/customer/pets`

`POST /api/customer/pets`

`PATCH /api/customer/pets/:id`

`DELETE /api/customer/pets/:id`

### Security

`POST /api/customer/security/change-password`

`GET /api/customer/security/sessions`

`DELETE /api/customer/security/sessions/:id`

`POST /api/customer/security/logout-all`

## Phân kỳ triển khai

### Phase 1: Account shell và profile

Mục tiêu: tạo nền UI/UX chuẩn cho toàn bộ account.

Tasks:

- [ ] Chuẩn hóa `AccountShell.tsx`: header, summary, nav responsive.
- [ ] Làm lại `ProfilePage.tsx` với bố cục profile summary, form cá nhân, xác thực liên hệ.
- [ ] Sửa toàn bộ text tiếng Việt lỗi mã hóa ở khu vực profile.
- [ ] Kiểm tra loading, empty, error state.
- [ ] Build pass.

Acceptance:

- `/account/profile` nhìn như trang tài khoản hoàn chỉnh, không phải form thô.
- Khách biết tài khoản đang thiếu gì và có CTA rõ để cập nhật.
- Form lưu hồ sơ, upload avatar, đổi số điện thoại không vỡ layout.

### Phase 2: Orders page

Mục tiêu: khách xem được lịch sử và chi tiết đơn hàng rõ ràng.

Tasks:

- [ ] Làm lại `OrdersPage.tsx` theo dạng danh sách order card.
- [ ] Thêm filter trạng thái.
- [ ] Hiển thị sản phẩm trong đơn.
- [ ] Hiển thị tổng tiền, thanh toán, giao hàng.
- [ ] Thêm empty state và CTA tiếp tục mua sắm.
- [ ] Kiểm tra endpoint có trả `items`; nếu không, bổ sung API/backend.

Acceptance:

- Khách không cần sang admin hoặc trang tracking để hiểu đơn có gì.
- Sản phẩm trong đơn hiển thị ảnh, tên, phân loại, số lượng, giá.

### Phase 3: Addresses page

Mục tiêu: sổ địa chỉ dùng được thật trong checkout.

Tasks:

- [ ] Làm Address modal thêm/sửa.
- [ ] Thêm set default.
- [ ] Không cho xóa địa chỉ mặc định nếu còn địa chỉ khác chưa set default.
- [ ] Đồng bộ style với account shell.

Acceptance:

- Khách thêm/sửa/xóa/đặt mặc định địa chỉ được.
- Empty state rõ ràng.

### Phase 4: Pets page

Mục tiêu: hồ sơ pet phục vụ cá nhân hóa mua sắm.

Tasks:

- [ ] Polish danh sách pet cards.
- [ ] Hoàn thiện modal thêm/sửa pet.
- [ ] Kiểm tra validation cho cân nặng, ngày sinh, loài.
- [ ] Thêm giải thích ngắn về AI Pet Advisor nhưng không biến thành landing page.

Acceptance:

- Khách quản lý pet nhanh.
- Dữ liệu pet đủ dùng cho tư vấn khẩu phần/gợi ý sản phẩm.

### Phase 5: Security page

Mục tiêu: khách tự quản lý an toàn tài khoản.

Tasks:

- [ ] Làm lại form đổi/tạo mật khẩu.
- [ ] Hiển thị phiên đăng nhập gọn, dễ hiểu.
- [ ] Thêm action hủy phiên/đăng xuất thiết bị khác.
- [ ] Confirm rõ với hành động nhạy cảm.

Acceptance:

- Khách biết tài khoản đang có mật khẩu chưa.
- Khách kiểm soát được các phiên đăng nhập.

### Phase 6: QA và polish

Tasks:

- [ ] Chạy `npm.cmd run build`.
- [ ] Test desktop 1366px.
- [ ] Test mobile width 390px.
- [ ] Kiểm tra text không tràn button/card.
- [ ] Kiểm tra các API fail hiển thị error state hợp lý.
- [ ] Kiểm tra không còn lỗi lazy route hoặc module rỗng do Vite cache.

## Rủi ro cần xử lý

- Một số file cũ có encoding lỗi, có thể cần rewrite UTF-8 sạch khi đụng đến.
- `.env` đang dùng remote API `https://trial1506895.mbws.vn`, nên sửa backend local không tác động màn hình nếu chưa deploy.
- Một số endpoint có thể chưa trả đủ dữ liệu, đặc biệt order items/status logs.
- Vite dev server từng cache module rỗng với file bị lỗi encoding; nếu gặp lại, nên đổi module hoặc restart dev server.

## Ưu tiên làm trước

1. Account shell và profile.
2. Orders page có chi tiết sản phẩm.
3. Addresses page.
4. Pets page.
5. Security page.

Thứ tự này hợp lý vì profile và orders là hai màn khách dùng nhiều nhất; địa chỉ ảnh hưởng trực tiếp checkout; pets và security hoàn thiện trải nghiệm sau.

