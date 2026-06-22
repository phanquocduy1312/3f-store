# Phase 03: Verification & Deployment

## Context Links
- [deploy_ftp.py](file:///c:/Users/Admin/Downloads/ccc/scripts/deploy_ftp.py)

## Overview
- Priority: High
- Status: Pending
- Objective: Compile, build, and deploy tab configuration feature.

## Requirements
- Compile verification: `npx tsc --noEmit`
- Production bundling: `npm run build`
- Deploy tool: `python scripts/deploy_ftp.py`

## Manual Verification Steps
1. Navigate to `/admin/orders`.
2. Confirm both tabs display correctly.
3. Select "Cấu hình trạng thái".
4. Modify the label of a status (e.g. "Đang chuẩn bị hàng" to "Đang soạn hàng") or color.
5. Modify the action button name of a transition (e.g. "Hoàn tất" to "Chốt hoàn tất").
6. Navigate back to "Danh sách đơn hàng", open order details panel, and confirm that:
   - Status badges display the updated labels/colors.
   - Action buttons in the details slide-over footer show updated action labels.
7. Attempt to deactivate a system critical status (e.g., "cancelled" or "completed") and verify that backend validation rejects it with a user-friendly Vietnamese warning.
