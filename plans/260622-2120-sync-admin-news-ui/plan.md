---
title: Synchronize Admin News UI
description: Update Admin News list and editor pages to synchronize layout, colors, elements, and styles with other premium admin pages.
status: in-progress
priority: medium
effort: low
branch: main
tags: [admin, ui, blog, style-sync]
created: 2026-06-22
---

# Plan Overview - Synchronize Admin News UI

Update `AdminNewsPage.tsx` and `AdminNewsEditorPage.tsx` to ensure their design elements, layout grid, container background colors, typography, tables, and pagination components match the premium look and feel of other admin modules (e.g. Products, Orders).

## Phases

- [Phase 1: Update AdminNewsPage Layout & Layout Styles](./phase-01-ui-sync.md) - Synchronize container backgrounds, header buttons, and KPI rows.
- [Phase 2: Update Filters & Table Styling](./phase-02-filters-table-sync.md) - Update category/status badges, search bar, dropdowns, table cards, pagination, and add the missing admin footer.
- [Phase 3: Update Editor Page background](./phase-03-editor-sync.md) - Minor style alignment on the edit page (e.g. page background).

## Key Dependencies
- React and Tailwind CSS components (`AdminSidebar`, `AdminHeader`)
- Lucide Icons
