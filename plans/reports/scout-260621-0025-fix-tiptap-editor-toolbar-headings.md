# Scout Report: TipTap Editor Toolbar and Headings Fix

- **Date**: 260621
- **Time**: 0025
- **Slug**: fix-tiptap-editor-toolbar-headings
- **Type**: scout

## Findings & Root Cause Analysis

We investigated the issue where H2/H3/H4 tags and other formatting buttons in the Tiptap editor toolbar did not work:

1. **StarterKit Heading levels**:
   `StarterKit` by default enables heading levels 1-6. However, without explicit level configuration, some heading events may collide or fail to bind properly with toggles. We will configure it explicitly:
   `StarterKit.configure({ heading: { levels: [2, 3, 4] } })`.

2. **Toolbar focus loss**:
   When clicking toolbar buttons, the browser changes focus from the editor content area to the button element. This clears the cursor selection and prevents the Tiptap command chain from applying formatting to the selected text.
   - **Fix**: Apply `onMouseDown={(e) => e.preventDefault()}` on all button elements in the toolbar. This prevents the button from grabbing focus and preserves the editor text selection when clicked.

3. **Editor CSS Heading styling**:
   The editor container's custom styles did not apply properly to `.ProseMirror` children. Standardizing the typography styles for headings, lists, tables, and blockquotes inside `.ProseMirror` guarantees that H2/H3/H4 headings look distinct and styled inside the editor window.

4. **URL & Schema validation**:
   The existing URL prompt did not check for security schemas. We will add validations to reject `javascript:` links and force absolute `http/https` or relative `/` routes.
