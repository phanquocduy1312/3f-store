# Scout Report: Alert and Custom Toast Occurrences

- Date: 2026-06-17
- Slug: `integrate-sonner-alerts`
- Type: `scout`

## Findings
A systematic codebase scan was performed to search for default browser `alert` prompts and non-standard custom toast solutions.

### 1. Custom Toasts & Notification States
- **[ProductDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/ProductDetail.tsx)**: Uses local component state `showToast` to render a custom toast overlay on successful addition to cart. This should be replaced with `toast.success()`.

### 2. Browser Alerts
We found `alert()` or `window.alert()` calls in the following files:
- **[OrderTracking.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/OrderTracking.tsx)** (Line 69) - Phone number validation checks.
- **[CartCheckout.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/CartCheckout.tsx)** (Lines 59, 94, 97) - Address validations, order creation errors.
- **[AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx)** (Lines 121, 125, 128, 144, 147, 150) - Status transition feedback and error handling.
- **[SocialLogins.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Auth/SocialLogins.tsx)** (Line 8) - Simulated social sign-in.
- **[RegisterForm.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Auth/RegisterForm.tsx)** (Line 73) - Registration success message.
- **[PhoneAuthForm.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Auth/PhoneAuthForm.tsx)** (Lines 58, 91) - Successful phone/verification logins.
- **[LoginForm.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Auth/LoginForm.tsx)** (Line 45) - Login success messages.
- **[ShopeeManualRequestModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/ShopeeManualRequestModal.tsx)** (Lines 134, 198, 203) - Upload constraints and submission status.

## Action Plan
Rewrite all of the above references to import and utilize `sonner` toasts.
