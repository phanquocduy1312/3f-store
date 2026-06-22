# Cook Report: Polish and Harden Admin Orders Workflow Modals

Completed implementation of safety guards and wording updates for Edit Status and Edit Transition modals.

## Changes Done

### Frontend
- **Edit Status Modal**:
  - Updated label "Mã hệ thống" to "Mã hệ thống (không thể sửa)".
  - Disabled active state toggle for all 9 critical order lifecycle status keys and statuses used by active transitions.
  - Added warning helper: *"Trạng thái này đang được dùng trong quy trình đơn hàng nên không thể tắt."*
- **Edit Transition Modal**:
  - Renamed toggle checkbox label to "Đang sử dụng bước chuyển này".
  - Added helper message explaining transition reason requirements.
  - Intercepted deactivation of critical transitions with `window.confirm`.
  - Forced `requires_reason` to be checked and disabled for dangerous transitions:
    - `pending_confirmation -> cancelled`
    - `delivered -> return_requested`
    - `return_requested -> return_completed`

### Backend
- Added safety checks in `WorkflowController.php` under `updateOrderStatusConfig` blocking deactivation of all 9 critical status keys.
- Added validation check in `updateOrderTransitionConfig` ensuring dangerous transitions cannot be saved with `requires_reason = 0`.

## Testing & Verification
- Checked TypeScript compiler types: `npx tsc --noEmit` passed.
- Run production bundler: `npm run build` compiled successfully.
- Synced updated files to the Plesk staging host using FTP.
