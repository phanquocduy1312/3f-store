---
title: WordPress-like CMS Admin News Editor Overhaul
description: Replace the modal news editor with a full-page WordPress-like editor route, complete TipTap toolbar actions, and Yoast-like SEO panel.
status: planning
priority: high
effort: medium
branch: feature/wordpress-news-editor
tags: admin, cms, tiptap, seo
created: 2026-06-21
---

# Plan: WordPress-like Admin News Editor Overhaul

This plan details the complete rewrite of the Admin News Editor in 3F Store to follow standard WordPress CMS flows.

## Detailed Phases

- **[Phase 1: Implementation](file:///c:/Users/Admin/Downloads/ccc/plans/260621-0015-wordpress-like-admin-news-editor/phase-01-implementation.md)** (Status: Pending Approval)
  - Safe backend migrations update
  - App routing setup for `/admin/news/new` and `/admin/news/:id/edit`
  - Modular subcomponents: Toolbar, Sidebar panels, SEO scoring panel
  - Tiptap editor extension updates (task lists, character count)
  - Complete WordPress-style page layout implementation
  - Connect list page to routes and test build

## Key Dependencies
- Node.js environment
- PHP backend database connection
- TipTap React extensions
