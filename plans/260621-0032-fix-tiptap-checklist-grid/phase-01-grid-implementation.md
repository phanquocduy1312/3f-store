# Phase 1: Grid Layout Implementation for Checklists

## Context Links
- Root Overview Plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260621-0032-fix-tiptap-checklist-grid/plan.md)

## Overview
- **Priority**: High
- **Status**: Pending Approval
- **Description**: Override the tasklist and taskitem CSS using a strict grid layout system to ensure checkboxes and content stay inline on the same line.

## Key Insights
1. **Grid column segregation**: Utilizing a `20px 1fr` grid template explicitly binds the checkbox to column 1 and the text container to column 2. This structure overrides any block styles imposed by Tailwind or global styles.
2. **Global target scopes**: Styling rules must apply to `.ProseMirror` (editor), `.blog-tiptap-preview` (preview mode), and `.article-rich-content` (public post page) to keep rendering identical across all views.

## Related Code Files

### [MODIFY]
1. [tiptap-editor.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/tiptap-editor.tsx) — Replace the custom tasklist styling block with the exact grid selectors requested.

## Implementation Steps

### 1. Update stylesheet in `tiptap-editor.tsx`
- Replace styling definitions for `ul[data-type="taskList"]` and `li[data-type="taskItem"]` with grid layout rules.

## Todo List
- [ ] Configure `taskList` and `taskItem` with grid displays in `tiptap-editor.tsx`
- [ ] Align checklist checkbox sizes and column spans
- [ ] Validate layout and compile status

## Success Criteria
- Checkboxes and list content reside on the same line.
- Compilation succeeds.
