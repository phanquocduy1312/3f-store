---
title: Migrate Product Catalog to MySQL
description: Import product catalog from products.json to MySQL database, expose backend API, and configure frontend to use it.
status: in_progress
priority: high
effort: medium
branch: main
tags: database, mysql, php, react
created: 2026-06-17
---

# Overview Plan: Product Catalog Migration

This plan coordinates the migration of the 3F Store product catalog from a static JSON file to a MySQL database and backend PHP API.

## Phases

### [Phase 1: Local Import & Verification](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1200-migrate-product-catalog-to-mysql/phase-01-database-import.md)
* **Goal**: Setup database tables, run import script, verify product/variant counts locally.
* **Status**: In Progress

### [Phase 2: Frontend Integration & Deployment](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1200-migrate-product-catalog-to-mysql/phase-02-verification-and-deployment.md)
* **Goal**: Verify React frontend communication, deploy backend changes to Plesk production, run import on production, and perform final E2E verification.
* **Status**: Pending

## Key Dependencies
* Local MySQL server running.
* PHP backend running on `localhost/3f-api`.
* FTP deployment script `scripts/deploy_ftp.py` verified.
