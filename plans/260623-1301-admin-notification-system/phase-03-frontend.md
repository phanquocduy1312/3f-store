# Phase 3: Frontend Admin Header Dropdown

## Overview
- **Priority**: High
- **Status**: Proposed
- **Description**: Add the API wrapper in the frontend and rebuild the Notification Bell in the Admin Header to render a functional, premium dropdown list.

## Proposed Changes

### [NEW] [adminNotificationsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/adminNotificationsApi.ts)
Create a new file with notification API helpers:
- `getAdminNotifications()`
- `getAdminUnreadCount()`
- `markAdminNotificationRead(id?: number)`
- `deleteAdminNotification(id: number)`

### [MODIFY] [admin-header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-header.tsx)
- Re-architect the Notification Bell button:
  - Add state for `notifications`, `unreadCount`, `showDropdown`.
  - Fetch notifications and unread count on mount.
  - Setup polling (e.g., every 60 seconds) to update the unread count badge.
  - Build a beautiful, responsive notification dropdown containing list items with dynamic icons, title, description, time (using a simple fuzzy time formatter like `X minutes ago`), and click actions.
  - Tapping a notification marks it as read, redirects to the corresponding admin page (`/admin/orders`, `/admin/3f-club`, `/admin/reviews`), and closes the dropdown.
  - Provide a "Đánh dấu tất cả là đã đọc" link at the top of the dropdown.

## Verification Plan
### Manual Verification
- Log in as admin, check that the notification badge displays real unread counts.
- Click the Bell icon to toggle the dropdown, verify notification list item formatting, click-to-redirect, and mark all as read.
