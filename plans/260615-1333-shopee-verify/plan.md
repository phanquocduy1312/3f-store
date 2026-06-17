---
title: Shopee Order Verification
description: Implement verify and verify-bulk endpoints to validate Shopee order details against Shopee Sandbox API for loyalty point requests.
status: in-progress
priority: high
effort: medium
branch: main
tags: [shopee, verify, database, api, backend]
created: 2026-06-15
---

# Shopee Order Verification Plan

This plan outlines implementing single and bulk verification endpoints for Shopee point requests.

## Phases

1. **Phase 1: Logic & Database Updates** (Status: In Progress)
   - [Phase Details](file:///c:/Users/Admin/Downloads/ccc/plans/260615-1333-shopee-verify/phase-01-verify-logic.md)
   - Add database schema columns (auto-migrated via model)
   - Enhance `ShopeeApiService` to support GET queries, token refreshing, and order details lookup
   - Update `ShopeePointRequest` model to update verification details and check duplicates
   - Update `Router` and `public/index.php` with POST endpoints
   - Implement `verify()` and `verifyBulk()` in `ShopeePointRequestController`

## Key Dependencies

- Shopee API Credentials configured in environment
- Database connection
