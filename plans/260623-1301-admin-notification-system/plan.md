---
title: Admin Notification System
description: Build a real-time notification system in the admin panel to alert administrators about new orders, reviews, and Shopee requests.
status: proposed
priority: high
effort: medium
branch: dev
tags: [admin, notification, features]
created: 2026-06-23
---

# Admin Notification System

Implement an admin notification center with unread badges, automated event triggers, and a dropdown in the admin header.

## Phases

1. [Phase 1: DB Schema & Backend API](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1301-admin-notification-system/phase-01-db-backend.md)
   - Create `admin_notifications` table in Database.
   - Register endpoints in `index.php` and implement `AdminNotificationController.php`.
2. [Phase 2: Event Triggers integration](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1301-admin-notification-system/phase-02-event-triggers.md)
   - Add notification triggers to Order, Shopee request, and Product review creation flows.
3. [Phase 3: Frontend Admin Header Dropdown](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1301-admin-notification-system/phase-03-frontend.md)
   - Refactor `admin-header.tsx` to display real-time badge count, handle polling, and show dropdown with interactive links.
