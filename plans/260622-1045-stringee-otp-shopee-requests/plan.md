---
title: Stringee OTP Integration for Shopee Point Requests
description: Secure Shopee point request submissions with single-use Stringee OTP SMS verification.
status: in-progress
priority: high
effort: medium
branch: dev
tags: [otp, stringee, security, shopee]
created: 2026-06-22
---

# Plan Overview: Stringee OTP Shopee Point Requests

This plan implements secure Stringee SMS OTP verification prior to Shopee point request creation.

## Phases

1. **[Phase 1: Backend Implementation](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1045-stringee-otp-shopee-requests/phase-01-backend.md)**
   - Status: pending
   - Tasks: Implement Stringee API provider client, configure `.env`, update OTP purpose, add single-use token consumption, and audit log.

2. **[Phase 2: Frontend & Admin Updates](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1045-stringee-otp-shopee-requests/phase-02-frontend.md)**
   - Status: pending
   - Tasks: Update Shopee submission modal to require OTP verification for all, send OTP with purpose `shopee_point_request`, pass token to backend, and show OTP stats in admin panel.

## Key Dependencies
- Stringee API Credentials (`STRINGEE_SID`, `STRINGEE_SECRET`, `STRINGEE_FROM`).
- Hashed verification records on `otp_requests`.
