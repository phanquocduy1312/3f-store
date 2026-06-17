# Codebase Scouting Report - Admin Security & Hardening

This scout report maps the codebase structure, endpoints, routers, and files related to implementing administrative authentication, API protection, audit logs, and CSRF/CORS security.

## Target Directories & Files

- **`3f-api/app/Core/Router.php`**: Handlers route mapping. We must integrate auth middleware checks here.
- **`3f-api/app/Helpers/cors.php`**: CORS policy configuration. Needs to be updated to restrict production origins.
- **`3f-api/public/index.php`**: Registers PHP controller routes and maps database migrations.
- **`3f-api/app/Controllers/`**: Contains controllers for Shopee request moderation, Loyalty configuration, Order status updates, and Product adjustments.
- **`src/App.tsx`**: Defines react-router endpoints. Needs route guarding to block `/admin/*` without an admin token.
- **`src/api/productsApi.ts`**: Contains AJAX fetching helpers. Needs Bearer token appending and 401 interception.
- **`components/admin/admin-sidebar.tsx`**: Side menu. Needs to display the active admin user and expose a logout button.

## Admin APIs to Protect

All endpoints matching `/api/admin/...` need protection:
- Orders Management: `/api/admin/orders`, `/api/admin/orders/update-status`, `/api/admin/orders/mark-paid`
- Products Management: `/api/admin/products`, `/api/admin/products/detail`, `/api/admin/products/save`, `/api/admin/products/toggle-active`, `/api/admin/products/reclassify`
- Loyalty Settings: `/api/admin/loyalty/point-rules`, `/api/admin/loyalty/point-rules/update`, `/api/admin/loyalty/point-rules/deactivate`, `/api/admin/loyalty/calculate-preview`, `/api/admin/loyalty/rewards`, `/api/admin/loyalty/rewards/upload-image`, `/api/admin/loyalty/rewards/update`, `/api/admin/loyalty/rewards/deactivate`, `/api/admin/loyalty/rewards/toggle-active`, `/api/admin/loyalty/rewards/import-vouchers`, `/api/admin/loyalty/rewards/vouchers`, `/api/admin/loyalty/redemptions`, `/api/admin/loyalty/redemptions/approve`, `/api/admin/loyalty/redemptions/reject`, `/api/admin/loyalty/redemptions/fulfill`, `/api/admin/loyalty/transactions`, `/api/admin/loyalty/voucher-pool`, `/api/admin/loyalty/voucher-pool/import`, `/api/admin/loyalty/tiers`, `/api/admin/loyalty/tiers/save`, `/api/admin/loyalty/tiers/active`, `/api/admin/loyalty/tiers/preview`, `/api/admin/loyalty/campaigns`, `/api/admin/loyalty/campaigns/save`, `/api/admin/loyalty/campaigns/active`, `/api/admin/loyalty/preview-points`, `/api/admin/loyalty/analytics`, `/api/admin/customers/loyalty`
- Shopee Integration: `/api/admin/shopee/requests`, `/api/admin/shopee/requests/detail`, `/api/admin/shopee/requests/approve`, `/api/admin/shopee/requests/reject`, `/api/admin/shopee/requests/verify`, `/api/admin/shopee/requests/verify-bulk`, `/api/admin/shopee/auth-url`, `/api/admin/shopee/connection-status`
