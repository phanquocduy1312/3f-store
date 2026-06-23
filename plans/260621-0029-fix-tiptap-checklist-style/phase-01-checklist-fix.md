# Phase 1: Checklist CSS and Layout Alignment Fix

## Context Links
- Root Overview Plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260621-0029-fix-tiptap-checklist-style/plan.md)

## Overview
- **Priority**: High
- **Status**: Pending Approval
- **Description**: Apply CSS properties to make task checklist items align on the same line as their checkbox inputs in the editor, and verify bullet/ordered lists are styled separately.

## Key Insights
1. **Checklist line wraps**: The CSS property `li` has default block or list-item display rules. Applying `display: flex !important` and `align-items: flex-start !important` on `li[data-type="taskItem"]` aligns the checkbox and the label side-by-side on the same line.
2. **Flexible box sizing**: Enforce `flex: 0 0 auto !important` on the label wrapper and `flex: 1 1 auto !important` on the content container to prevent checkbox columns from compressing or wrapping.

## Related Code Files

### [MODIFY]
1. [tiptap-editor.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/tiptap-editor.tsx) — Replace the styling block with exact checklist flex layout properties and `:not([data-type='taskList'])` list rules.

## Implementation Steps

### 1. Replace CSS Style Rules
- Update styles in `tiptap-editor.tsx` to configure `li[data-type="taskItem"]` with flex direction, align-items, margins, and inline label rules.

## Todo List
- [ ] Implement flex layout and flex-start alignment for `li[data-type="taskItem"]` in `tiptap-editor.tsx`
- [ ] Define bullet/ordered list rules with `:not([data-type='taskList'])` to prevent collisions
- [ ] Verify checklist render and compiler status

## Success Criteria
- Checkbox and text content display on the same line inside the editor and preview.
- Bullet lists and ordered lists render markers correctly.
