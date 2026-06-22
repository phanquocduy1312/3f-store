# Cook Report: Order Status Configuration Tab Integration

**Date**: 2026-06-21
**Time**: 22:22
**Task Slug**: order-status-tab-configuration

## 1. Objective
Bring the order status and transition configuration capability directly into the `/admin/orders` page as a tab, bypassing the complex settings workflow pages for store admins. This view must be clean, Vietnamese-localized, and strictly focus on the `order` status group.

## 2. API Design

### A. GET `/api/admin/orders/status-config`
Returns order statuses and transitions in a simplified form.
- Source tables: `workflow_statuses` and `workflow_transitions` filtered by `group_key = 'order'`.
- Sort by `sort_order` and `id`.

### B. PUT `/api/admin/orders/status-config/statuses/:id`
Updates a specific status.
- Allow updating: `label`, `color`, `sort_order`, `is_active`.
- Validation rules:
  - Critical status keys (`completed`, `cancelled`, `return_completed`, `delivered`) cannot be deactivated (`is_active` must remain 1).
  - Status key and group key are immutable.

### C. PUT `/api/admin/orders/status-config/transitions/:id`
Updates a specific transition.
- Allow updating: `label`, `requires_reason`, `is_active`, `sort_order`.
- Group key is immutable.

## 3. Frontend Layout in `/admin/orders`
We will introduce `activeTab = 'orders' | 'statuses'` using local state.
- **Tab list**:
  - `Danh sách đơn hàng`
  - `Cấu hình trạng thái`
- Clicking `Cấu hình trạng thái` shows:
  1. A simple grid/table of main order statuses: Label, Color (picker/input), Sort order, Terminal, Active toggle, Edit actions.
  2. A transition flow rule checklist: From, To, Button/Action Label, Requires Reason toggle, Active toggle, Edit actions.
  3. Safe validation: Disable editing system key entries. Show helpful tooltips in Vietnamese explaining "Trạng thái cuối" (Terminal state).

## 4. Sidebar Link Restrictions
- Restrict `/admin/settings/workflows` sidebar navigation item. The item will be hidden for standard admin roles and only exposed for super_admin/dev.
