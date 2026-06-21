# Phase 1: TipTap Formatting and CSS Styling Fix

## Context Links
- Root Overview Plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260621-0025-fix-tiptap-editor-toolbar-headings/plan.md)

## Overview
- **Priority**: High
- **Status**: Pending Approval
- **Description**: Ensure H2/H3/H4 tags apply successfully inside the TipTap content editor, resolve editor-specific heading sizing using high-priority CSS styles, configure mouse click/down events to maintain editor focus, and validate user input parameters.

## Key Insights
1. **StarterKit Heading Configuration**: Setting `levels: [2, 3, 4]` explicitly inside `StarterKit` prevents headings from colliding with default browser/extension overrides.
2. **Preventing Focus Loss**: Applying `onMouseDown={(e) => e.preventDefault()}` on all toolbar buttons keeps the cursor focused inside the editor, allowing formatting actions (like bold, italic, H2) to be applied seamlessly without selection loss.
3. **Dedicated Styles for Editor**: Target styles specifically inside the editor using `.ProseMirror h2`, `.ProseMirror h3`, and `.ProseMirror h4` to ensure headings look visually distinct.

## Requirements
- **Functional**:
  - Selection heading overrides (H2, H3, H4) must generate real HTML headings.
  - Active button states must align with standard formats (Bold, List, Heading levels).
  - Block `javascript:` scheme and validate `http/https//` URLs for links and images.
  - Console log HTML payloads only in development mode.
- **Non-functional**:
  - Keep modified files under 200 lines.

## Related Code Files

### [MODIFY]
1. [tiptap-editor.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/tiptap-editor.tsx) — Reconfigure StarterKit and add CSS styles.
2. [news-editor-toolbar.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/news-editor-toolbar.tsx) — Apply button click attributes, validation logic, and dedicated Unlink actions.

## Implementation Steps

### 1. Reconfigure Tiptap Editor & Add CSS
- Update [tiptap-editor.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/tiptap-editor.tsx):
  - Configure `StarterKit` headings to accept `levels: [2, 3, 4]`.
  - Add specific `.ProseMirror` styling selectors inside the stylesheet wrapper.
  - Add development logging within the `onUpdate` event.

### 2. Refactor Toolbar Controls & Validation
- Update [news-editor-toolbar.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/news-editor-toolbar.tsx):
  - Add `onMouseDown` handlers to all buttons.
  - Include dedicated `Unlink` button.
  - Add link/image URL prefix validation logic and restrict execution of scripting protocols.

## Todo List
- [ ] Configure `levels: [2, 3, 4]` on `StarterKit` in `tiptap-editor.tsx`
- [ ] Insert CSS styling rules for `.ProseMirror` heading tags
- [ ] Add `import.meta.env.DEV` console logger to `onUpdate`
- [ ] Implement `onMouseDown` prevent-default on toolbar action helpers
- [ ] Add dedicated Unlink button disabled state check
- [ ] Implement URL protocol validation on link and image url prompts
- [ ] Run compiler check and production build verification

## Success Criteria
- Formatting toggles apply HTML markup tags to selections.
- Clicking any toolbar button keeps the cursor selection in focus inside the editor.
- Compilation succeeds.
