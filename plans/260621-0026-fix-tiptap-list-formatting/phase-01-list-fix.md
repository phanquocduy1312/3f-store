# Phase 1: TipTap List Formatting and Sanitizer Check

## Context Links
- Root Overview Plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260621-0026-fix-tiptap-list-formatting/plan.md)

## Overview
- **Priority**: High
- **Status**: Pending Approval
- **Description**: Ensure bullet lists, ordered lists, and checklists generate actual HTML structures (`<ul>`, `<ol>`, `<ul data-type="taskList">`), and make lists visually clear and styled within both the editor container and the public rendering pages.

## Key Insights
1. **Sanitizer Loss**: The default DOMPurify configuration strips `input` tags and custom HTML attributes like `data-type` and `data-checked`. This results in the loss of checklist states and styling tags during save, preview, or detail render.
   - **Fix**: Configure DOMPurify to allow `input` tags and `data-type`, `data-checked`, `type`, `checked`, `disabled` attributes.
2. **List CSS reset in Tailwind**: Tailwind's CSS reset strips bullet markers and padding. Adding high-specificity styling overrides specifically targeting `.ProseMirror ul`, `.ProseMirror ol` restores discs, decimals, circles, and squares.

## Requirements
- **Functional**:
  - Bullet list should create standard HTML `<ul>` structures.
  - Ordered list should create standard HTML `<ol>` structures.
  - Task/Checklist should create checklist nodes with inputs.
  - HTML elements must be preserved on save, load, and public display.

## Related Code Files

### [MODIFY]
1. [tiptap-editor.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/tiptap-editor.tsx) — Add custom list styles and update DOMPurify allowlist.
2. [BlogDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/BlogDetail.tsx) — Update DOMPurify allowlist on public page.

## Implementation Steps

### 1. Configure DOMPurify Allowlist
- Modify `src/components/admin/tiptap-editor.tsx` and `src/pages/BlogDetail.tsx` to set:
  ```typescript
  DOMPurify.sanitize(html, {
    ADD_TAGS: ["input"],
    ADD_ATTR: ["data-type", "data-checked", "type", "checked", "disabled"]
  })
  ```

### 2. Inject List CSS Rules
- Update styles in `tiptap-editor.tsx` to include CSS properties for ordered list markers (decimal, lower-alpha) and bullet shapes (disc, circle, square).

## Todo List
- [ ] Add DOMPurify custom configuration to `tiptap-editor.tsx`
- [ ] Add DOMPurify custom configuration to `BlogDetail.tsx`
- [ ] Define `.ProseMirror` and public HTML custom list styles
- [ ] Run compiler check and production build verification

## Success Criteria
- Bullets and numbers render cleanly inside editor.
- Checklists can be ticked/unticked and preserve state after saving.
