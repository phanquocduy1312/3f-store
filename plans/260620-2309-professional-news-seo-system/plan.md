---
title: Professional SEO News System
description: Build a high-performance news section with structured JSON-LD, ToC, conversion widgets, and an Admin CRUD SEO tool.
status: completed
priority: high
effort: medium
branch: feature/professional-news-seo-system
tags: [seo, blog, admin, dynamic-ui, structured-data]
created: 2026-06-20
---

# Master Plan: Professional SEO News System

This plan details the roadmap to transform the existing basic news list into a high-converting, SEO-optimized, and premium content hub for 3F Store.

## Phases

### Phase 1: Database & Backend APIs
* Add SEO metadata columns to `blog_posts` table.
* Implement Admin CRUD APIs (Create, Read, Update, Delete) and image upload backend.
* Update controller response parameters to support SEO properties.
* Status: [Completed]
* Detail: [phase-01-database-and-backend.md](file:///c:/Users/Admin/Downloads/ccc/plans/260620-2309-professional-news-seo-system/phase-01-database-and-backend.md)

### Phase 2: Admin News Operations Panel
* Implement `/admin/news` dashboard listing all articles with analytics (views).
* Create a dedicated content composer utilizing TipTap editor.
* Build the Live SEO Checklist assistant panel (evaluating title, meta length, keyword density).
* Add UI button to trigger the Sapo web scraper manually.
* Status: [Completed]
* Detail: [phase-02-admin-news-management.md](file:///c:/Users/Admin/Downloads/ccc/plans/260620-2309-professional-news-seo-system/phase-02-admin-news-management.md)

### Phase 3: Premium Client UI/UX & SEO
* Implement dynamic document head meta tags injection (title, canonical, Open Graph).
* Inject JSON-LD Structured Data (BlogPosting and Breadcrumbs schema graphs).
* Build the dynamic scroll-progress indicator, Table of Contents (ToC) observer, and circular scroll-to-top component.
* Integrate related products carousel dynamically linked to the catalog.
* Status: [Completed]
* Detail: [phase-03-frontend-seo-and-beauty.md](file:///c:/Users/Admin/Downloads/ccc/plans/260620-2309-professional-news-seo-system/phase-03-frontend-seo-and-beauty.md)

## Key Dependencies
* TipTap Rich Text Editor dependencies for the React client.
* DOMPurify (already installed) to safely output dynamic HTML.
* Database migrations (updating staging database table schema).
