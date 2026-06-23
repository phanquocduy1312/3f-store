# Phase 2: Event Triggers Integration

## Overview
- **Priority**: High
- **Status**: Proposed
- **Description**: Add code triggers inside key controller actions to automatically create notifications.

## Proposed Changes

### [MODIFY] [OrderController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/OrderController.php)
In the checkout `create()` action, after transaction commits:
- Trigger `order_created` notification:
  ```php
  (new \App\Models\AdminNotification())->createNotification(
      "Đơn hàng mới #" . $orderCode,
      "Khách hàng " . $customerName . " (" . $customerPhone . ") vừa đặt một đơn hàng mới trị giá " . number_format($total) . "đ",
      "order_created",
      "order",
      $orderCode
  );
  ```

### [MODIFY] [ShopeePointRequestController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ShopeePointRequestController.php)
In the `create()` action, after request successfully inserts:
- Trigger `shopee_request` notification:
  ```php
  (new \App\Models\AdminNotification())->createNotification(
      "Yêu cầu Shopee mới",
      "Khách hàng " . $customerName . " (" . $phone . ") vừa gửi yêu cầu tích điểm cho đơn Shopee #" . $shopeeOrderCode,
      "shopee_request",
      "shopee_point_request",
      $requestId
  );
  ```

### [MODIFY] [ProductReviewController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ProductReviewController.php)
In the `create()` action, after review successfully inserts:
- Trigger `review_created` notification:
  ```php
  (new \App\Models\AdminNotification())->createNotification(
      "Đánh giá sản phẩm mới",
      "Khách hàng " . ($customer['full_name'] ?? $customer['name'] ?? 'Khách') . " vừa đánh giá " . ($payload['rating'] ?? 5) . " sao cho sản phẩm.",
      "review_created",
      "review",
      $review['id']
  );
  ```

## Verification Plan
### Manual Verification
- Simulate order creation, Shopee request submission, and review submission, then verify that appropriate records are successfully generated in the `admin_notifications` database table.
