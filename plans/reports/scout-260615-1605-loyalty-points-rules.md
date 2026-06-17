# Scout Report: Loyalty Points Rules Module

## 1. Files Discovered and Proposed for Modification

### 1.1 Backend Component (app/)
- **Core Router**: [Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php)
  - Need to add new REST endpoints and route mappings for point rule configs.
- **Request Controller**: [ShopeePointRequestController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ShopeePointRequestController.php)
  - Replace hardcoded points calculation (`floor(amount / 10000)`) with the new service model in approval method.
- **Points Service**: [PointService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/PointService.php)
  - Refactor `calculateShopeePoints` method to call the new loyalty point service.
- **Schema File**: [schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/schema.sql)
  - Add `loyalty_point_rules` table schema structure.

### 1.2 Frontend Component (src/)
- **App Routes**: [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
  - Register the new `/admin/loyalty-settings` route.
- **Sidebar Component**: [AdminSidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx) (Need to check location)
  - Add a link to `/admin/loyalty-settings` to make navigation simple.

## 2. New Files to Create

### 2.1 Backend Component
- **Model**: `3f-api/app/Models/LoyaltyPointRuleModel.php`
  - Rule config database operations, plus table auto-migration logic.
- **Service**: `3f-api/app/Services/LoyaltyPointService.php`
  - Point calculations based on active rules.
- **Controller**: `3f-api/app/Controllers/LoyaltyController.php`
  - Loyalty point rules endpoints.

### 2.2 Frontend Component
- **Page Component**: `src/pages/admin/LoyaltySettingsPage.tsx`
  - UI for displaying/editing rules and point preview.
