---
title: Integrate Sonner Alerts
description: Replace default browser alerts and custom toast notifications with sonner toasts across the application.
status: completed
priority: medium
effort: low
branch: main
tags: frontend, alert, toast, sonner
created: 2026-06-17
---

# Plan: Integrate Sonner Alerts

## Overview
Currently, the application uses basic browser `alert()` popups and custom toast implementations. We will unify all alerts and toasts using the modern `sonner` library for a professional and consistent UI/UX.

## Phases
1. [Phase 1: Identify and Replace in Client Pages](phase-01-client-pages.md) - Replace alerts in client-facing pages: ProductDetail, CartCheckout, and OrderTracking.
2. [Phase 2: Replace in Authentication Components](phase-02-auth-components.md) - Replace alerts in RegisterForm, PhoneAuthForm, LoginForm, and SocialLogins.
3. [Phase 3: Replace in Admin Panel](phase-03-admin-panel.md) - Replace alerts in AdminOrdersPage and ShopeeManualRequestModal.
4. [Phase 4: Verification](phase-04-verification.md) - Verify using TypeScript checks and build testing.
