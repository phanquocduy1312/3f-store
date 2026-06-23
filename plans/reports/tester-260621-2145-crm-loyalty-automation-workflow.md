# QA Test Execution Report: CRM/Loyalty/Automation Workflow

- **Date**: 2026-06-21
- **Time**: 21:45
- **Task Slug**: crm-loyalty-automation-workflow
- **Status**: **PASS (Production-Ready)**

---

## 1. Database Migration Safety & Verification
- **New Columns on `orders` Table**: Checked and verified presence of:
  - `order_status`, `payment_status`, `shipping_status`, `loyalty_status`, `order_source`, `assigned_staff_id`, `internal_note`, `customer_note`, `cancelled_reason`, `returned_reason`, `completed_at`, `cancelled_at`.
  - **Status**: **PASS**
- **New Dynamic Workflow Tables**: Checked and verified existence of:
  - `workflow_statuses`, `workflow_transitions`, `automation_rules`, `customer_activity_logs`, `notification_channels`, `shipping_providers`.
  - **Status**: **PASS**
- **Idempotency**: Running the migration script multiple times runs successfully without duplicate key errors, duplicate seed data, or schema alteration failures.
  - **Status**: **PASS**
- **Old Status Mapping**: Checked that all existing orders with legacy statuses (`pending`, `confirmed`, `packing`, `shipping`, `completed`, `cancelled`) are mapped safely to the new workflow keys:
  - `pending` -> `pending_confirmation`
  - `confirmed` -> `confirmed`
  - `packing` -> `preparing`
  - `shipping` -> `shipping`
  - `completed` -> `completed`
  - `cancelled` -> `cancelled`
  - **Status**: **PASS**

---

## 2. Backend API Runtime Verification
Tested and validated the following operations on staging:
- **GET Workflow Statuses**: Loads configured statuses correctly grouped by dimensions (`order`, `payment`, `shipping`, `loyalty`).
- **GET Workflow Transitions**: Loads transition rules defining valid source-destination pairs.
- **Update Status Group**: Order/Payment/Shipping/Loyalty state machine updates are decoupled and run independently.
- **Reject Invalid Transition**: Directly jumping from `pending_confirmation` to `completed` is blocked by transition rule checks.
- **Reject Critical Keys Rename/Delete**: Core system keys (`completed`, `cancelled`, `paid`, `refunded`, `credited`) are protected on backend and UI from deletion/renaming.
- **Timeline / Customer Activity Logging**: All transitions write proper records to `order_status_logs` and `customer_activity_logs`.
- **Status**: **PASS**

---

## 3. Frontend & UI Verification
- **Admin Orders UI / Detail Drawer**: Verified four separate status widgets (`Trạng thái đơn hàng`, `Trạng thái thanh toán`, `Trạng thái vận chuyển`, `Trạng thái tích điểm`) show correct current values, restrict actions to permitted transitions, require notes/reasons when defined, write logs, and do not cause state pollution between groups.
- **Workflow Settings UI**: Verified `/admin/settings/workflows` loads statuses and transitions by group, allows labels/color/sort updates, locks system keys, and updates available transitions list dynamically.
- **Customer Pages Compatibility**: Verified that the Order Tracking and Client Order History pages load successfully and map complex internal statuses into friendly localized tags:
  - `Chờ xác nhận`, `Đang xử lý`, `Đang giao`, `Giao thành công`, `Hoàn tất`, `Đã hủy`.
- **Status**: **PASS**

---

## 4. Loyalty Points Safety & Idempotency
- **Double Credit Protection**: Point transaction reference unique check (`order_id`/`event`) locks transaction and prevents duplicate awarding for completed orders.
- **Reversal Safety**: Order cancellation or return triggers point reversal (`cancel_web_order`), and prevents double cancellation or negative balance exploits.
- **Status**: **PASS**

---

## 5. Manual Test Scenarios

| Case | Scenario Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **Case A** | Load existing order with old status mapping | Renders with new status tag | Mapped and loaded correctly | **PASS** |
| **Case B** | Change order_status from `pending_confirmation` to `confirmed` | Writes status log & customer activity log | Logs written successfully | **PASS** |
| **Case C** | Change payment_status from `unpaid` to `paid` | Only payment_status changes; order_status remains | Decoupled state transition verified | **PASS** |
| **Case D** | Change shipping_status from `no_shipment` to `shipment_created` | Only shipping_status changes | Decoupled shipping transition verified | **PASS** |
| **Case E** | Invalid transition attempt | API rejects action | Blocked with HTTP error | **PASS** |
| **Case F** | Edit/Delete protected workflow key | UI locks and backend blocks edit | System keys preserved | **PASS** |
| **Case G** | Complete order (points awarded) | Points credited once; subsequent attempts ignored | Idempotency verified (23 points) | **PASS** |
| **Case H** | Cancel/Return order (points reversed) | Points reversed once; subsequent attempts ignored | Reversal idempotency verified | **PASS** |

---

## 6. Code & API Refactoring Summary
To clean up API organization, we extracted order and workflow operations out of [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts):
1. **[NEW]** [ordersApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/ordersApi.ts): Contains client and admin order CRUD, status update, and allowed transition APIs.
2. **[NEW]** [workflowApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/workflowApi.ts): Contains workflow configuration settings (statuses, transitions, automation rules, carriers, notification channels).
3. **[MODIFY]** [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts): Removed redundant code blocks (lines 502-732).
4. **[MODIFY]** Affected frontend files updated to use new clean imports:
   - [OrderTracking.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/OrderTracking.tsx)
   - [OrderSuccess.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/OrderSuccess.tsx)
   - [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx)
   - [AdminWorkflowSettingsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminWorkflowSettingsPage.tsx)
   - [CustomerOrdersTab.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/customers/tabs/CustomerOrdersTab.tsx)

- **Verification Build Check**: `npx tsc --noEmit` and `npm run build` compiled successfully without warnings.

---

## 7. Security Cleanup
- **Staging Test File**: Temporary testing script `test_workflows_qa.php` on staging server has been securely deleted.

**Conclusion**: This feature is **PRODUCTION-READY** and fully validated.
