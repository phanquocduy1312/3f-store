---
title: Fix TipTap Editor Toolbar and Headings Formatting
description: Ensure all Tiptap headings, lists, align, and table commands function properly. Implement style guidelines and validation rules for link/image inputs.
status: planning
priority: high
effort: low
branch: feature/fix-tiptap-formatting
tags: tiptap, editor, formatting, heading
created: 2026-06-21
---

# Plan: Fix TipTap Editor Toolbar and Headings Formatting

This plan corrects commands, CSS styles, link/image validations, and button prevent-default configurations inside the CMS editor.

## Detailed Phases

- **[Phase 1: TipTap Formatting Fix](file:///c:/Users/Admin/Downloads/ccc/plans/260625-0025-fix-tiptap-editor-toolbar-headings/phase-01-tiptap-fix.md)** (Status: Pending Approval)
  - Reconfigure StarterKit with level constraints `[2, 3, 4]` for headings.
  - Implement CSS specifications for `.ProseMirror` headings and table elements inside editor.
  - Add button attributes `type="button"`, `disabled={!editor}`, and `onMouseDown={e => e.preventDefault()}` on all toolbar elements.
  - Validate URL protocols on link insertions and block `javascript:` links.
  - Insert dev-only console logger for HTML payloads.

## Key Dependencies
- `@tiptap/react`
- `@tiptap/starter-kit`
