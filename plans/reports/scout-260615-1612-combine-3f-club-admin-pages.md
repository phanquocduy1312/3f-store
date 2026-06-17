# Scout Report: Combine 3F Club Admin Pages

Scouting the frontend code structure to merge the Shopee Requests page and Loyalty Settings page into a unified 3F Club page.

## File Discovery
The following key files are involved in the refactoring:
- [ShopeeRequestsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ShopeeRequestsPage.tsx): Main admin page for managing Shopee requests.
- [LoyaltySettingsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/LoyaltySettingsPage.tsx): Main admin page for loyalty configurations.
- [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx): Sidebar containing paths to admin modules.
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx): Routes configuration.

## Key Insights
1. **Layout Wrappers**: Both `ShopeeRequestsPage.tsx` and `LoyaltySettingsPage.tsx` duplicate `AdminSidebar`, `AdminHeader`, and footer wrappers. Extracting the content to sections will simplify both files and allow them to be embedded in a tabbed layout.
2. **Toast Notifications**: Both sections utilize a custom `useToast` hook and require a `ToastContainer` to render notifications. The unified page will need to ensure Toast containers/contexts do not conflict.
3. **Sidebar Updates**: The sidebar has separate items for `Yêu cầu Shopee`, `3F Club` (no link), and `Cấu hình điểm`. We will collapse this into a single `3F Club` item pointing to `/admin/3f-club`.
