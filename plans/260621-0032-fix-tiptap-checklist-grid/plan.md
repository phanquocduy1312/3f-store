---
title: Fix TipTap Checklist Grid Layout and Alignment
description: Apply explicit grid-based columns to Tiptap TaskItem elements to align checkboxes inline and prevent line wrap issues.
status: planning
priority: high
effort: low
branch: feature/fix-tiptap-checklist-grid
tags: tiptap, checklist, css, grid
created: 2026-06-21
---

# Plan: Fix TipTap Checklist Grid Layout and Alignment

This plan implements a grid-template layout on task lists to guarantee inline alignment of check boxes and text blocks.

## Detailed Phases

- **[Phase 1: Grid Layout Implementation](file:///c:/Users/Admin/Downloads/ccc/plans/260621-0032-fix-tiptap-checklist-grid/phase-01-grid-implementation.md)** (Status: Pending Approval)
  - Replace flex styles with grid columns `20px 1fr` on `li[data-type="taskItem"]`.
  - Explicitly override block heights and margins on checkboxes and paragraphs.
  - Apply overrides to editor container, preview workspace, and public article views.
  - Run compiler checks.

## Key Dependencies
- `@tiptap/extension-task-list`
- `@tiptap/extension-task-item`
