# Phase 3: Frontend Integration & Configuration

## Overview
- Priority: Medium
- Current Status: Planning
- Description: Design and write the Admin configuration tab interfaces and client dashboard updates.

## Related Code Files
- **[MODIFY]** [AdminWorkflowSettingsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminWorkflowSettingsPage.tsx) or [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx): Add Settings configuration tab.
- **[MODIFY]** [CustomerClubPage.tsx] / [Loyalty Dashboard]: Update customer dashboard to show point statuses, verification banners, and conversion calculations.

## Implementation Steps
1. Add a new tab `Cấu hình 3F Club` inside the Admin panel (either under settings or orders page depending on user preference).
2. Render five configuration sections:
   - **Cách tính điểm**: Money-to-point spending ratios.
   - **Hạng thành viên**: Thresholds and maximum order discount caps.
   - **Hạn điểm**: Expiry months.
   - **Kênh bán hàng**: Platform multipliers (Website vs Shopee/TikTok).
   - **OTP & Bảo mật**: OTP requirements toggle.
3. Bind form fields to POST/PUT calls that update rows in the backend database setting table.
4. Update the Customer Loyalty dashboard:
   - If phone number is unverified, show a prominent banner warning `“Xác thực SĐT để sử dụng điểm”` and a CTA to request OTP.
   - Show the dynamic conversion statement: `“1.000 điểm = 20.000đ giá trị đổi quà/voucher”` loaded from settings.

## Success Criteria
- Setting saves from Admin UI immediately update calculation results on new orders.
- Unverified customers are locked out of redemption, and verification forms trigger valid OTP flows.
