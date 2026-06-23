---
title: Fix TipTap Editor List Formatting and Markers
description: Fix bullet lists, ordered lists, and task/checklist layouts inside Tiptap, style custom list markers, and update sanitizer allowlists.
status: planning
priority: high
effort: low
branch: feature/fix-tiptap-lists
tags: tiptap, list, ordered-list, task-list, dompurify
created: 2026-06-21
---

# Plan: Fix TipTap Editor List Formatting and Markers

This plan resolves the list styling and sanitizer preservation issues for ordered lists, bullet lists, and checklists.

## Detailed Phases

- **[Phase 1: list Formatting Fix](file:///c:/Users/Admin/Downloads/ccc/plans/260621-0026-fix-tiptap-list-formatting/phase-01-list-fix.md)** (Status: Pending Approval)
  - Ensure Tiptap `bulletList`, `orderedList`, `TaskList`, and `TaskItem` extensions are active in `tiptap-editor.tsx`.
  - Add explicit CSS markers and spacing for lists and nested sublists inside `.ProseMirror` and editor previews.
  - Configure `DOMPurify.sanitize` to allow `input` tags and custom `data-type`/`data-checked` attributes in both the editor preview and the public detail page.
  - Manual verification checklist validation.

## Key Dependencies
- `dompurify`
- `@tiptap/extension-task-list`
- `@tiptap/extension-task-item`
