# Cook Report: Polish Admin Orders Workflow Modals

**Date**: 2026-06-21
**Time**: 22:40
**Task Slug**: polish-admin-orders-workflow-modals

## 1. Accomplished Updates

### A. Edit Status Modal Refinements
* Changed the label of the read-only input field from "Mã hệ thống" to "Mã hệ thống (không thể sửa)" in [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx).
* Added a clear Vietnamese helper text: *"Mã này dùng nội bộ để đồng bộ đơn hàng, không thể chỉnh sửa."*
* Added deactivation checkbox disabling logic for all 9 default main order lifecycle statuses: `pending_confirmation`, `confirmed`, `preparing`, `shipping`, `delivered`, `completed`, `return_requested`, `return_completed`, and `cancelled`.
* Added condition check that prevents turning off statuses if they are currently utilized by active transitions.
* Rendered warning helper text: *"Trạng thái này đang được dùng trong quy trình đơn hàng nên không thể tắt."* directly under the checkbox when disabled.
* Enforced input validations on the status edit form: "Lưu thay đổi" is disabled if the label is empty, the color is not a valid 3/6-digit hex code (`/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/`), or the sort order is NaN.

### B. Edit Transition Modal Refinements
* Renamed active transition checkbox label from "Bật bước chuyển này" to "Đang sử dụng bước chuyển này".
* Added helper details for the required reason checkbox: *"Nên bật với các thao tác như Hủy đơn, Hoàn tiền, Giao thất bại hoặc Đổi/trả."*
* Integrated a modal confirmation warning (`window.confirm`) when standard admins try to toggle off any default critical transition:
  * pending_confirmation -> confirmed (Chờ xác nhận → Đã xác nhận)
  * confirmed -> preparing (Đã xác nhận → Đang chuẩn bị hàng)
  * preparing -> awaiting_pickup_or_booking (Đang chuẩn bị hàng → Chờ lấy hàng / đặt ship)
  * awaiting_pickup_or_booking -> shipping (Chờ lấy hàng / đặt ship → Đang giao)
  * shipping -> delivered (Đang giao → Giao thành công)
  * delivered -> completed (Giao thành công → Hoàn tất)
* Warning Text: *"Tắt bước chuyển này có thể làm nhân viên không xử lý tiếp được đơn ở trạng thái liên quan. Bạn chắc chắn muốn tắt?"*
* Enforced input validations on the transition form: "Lưu thay đổi" is disabled if the button label is empty or the sort order is not a number.

---

## 2. Verification Results
* **Type Compilation**: Checked via `npx tsc --noEmit` which completed successfully with **no errors**.
* **Production Build**: Ran `npm run build` which succeeded and bundled all chunks (built in 6.99s).
