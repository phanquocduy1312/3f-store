# Phase 1: DB Schema & Backend API

## Overview
- **Priority**: High
- **Status**: Proposed
- **Description**: Setup table `admin_notifications` using the model self-migration pattern and build backend endpoints in `AdminNotificationController.php`.

## Proposed Changes

### [NEW] [AdminNotification.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/AdminNotification.php)
Implement `AdminNotification` model with:
- `migrate()` to auto-create `admin_notifications` table.
- `createNotification($title, $message, $type, $refType, $refId)`.
- `listNotifications($limit)`.
- `getUnreadCount()`.
- `markRead($id)`.
- `markAllRead()`.
- `deleteNotification($id)`.

### [NEW] [AdminNotificationController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/AdminNotificationController.php)
Implement controller with admin auth validation:
- `list()` -> `GET /api/admin/notifications`
- `unreadCount()` -> `GET /api/admin/notifications/unread-count`
- `markRead()` -> `POST /api/admin/notifications/mark-read`
- `delete()` -> `POST /api/admin/notifications/delete`

### [MODIFY] [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)
- Pre-instantiate `new \App\Models\AdminNotification()` at start.
- Register notification endpoints:
  - `GET /api/admin/notifications`
  - `GET /api/admin/notifications/unread-count`
  - `POST /api/admin/notifications/mark-read`
  - `POST /api/admin/notifications/delete`

## Verification Plan
### Automated Tests
- Run cURL or postman requests to verify endpoint responses:
  - `curl -H "Authorization: Bearer <token>" http://localhost/api/admin/notifications/unread-count`
