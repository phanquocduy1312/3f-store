# Scout Report: TipTap Editor List Formatting Fix

- **Date**: 260621
- **Time**: 0026
- **Slug**: fix-tiptap-list-formatting
- **Type**: scout

## Findings & Root Cause Analysis

We investigated the issue with bullet lists, ordered lists, and checklists not rendering properly inside the Tiptap editor and public pages:

1. **DOMPurify Sanitization Overreach**:
   - The editor uses `DOMPurify.sanitize(value)` to render previews.
   - The public site uses `DOMPurify.sanitize(rawHtml)` to clean data.
   - By default, DOMPurify strips custom attributes like `data-type` and `data-checked` and removes checkbox `<input>` tags. This strips the structural markup from checklists and lists on load, preview, and save, reverting them to normal unstyled text.
   - **Fix**: Update the `DOMPurify.sanitize` invocations to allow `input` tags and `data-type`/`data-checked` attributes.

2. **Tailwind List CSS Resets**:
   - Tailwind resets all base browser HTML styles, meaning `ul` and `ol` elements lose padding and default bullet/number styles inside the editor window.
   - **Fix**: Inject explicit `.ProseMirror ul`, `.ProseMirror ol` list-style rules inside the Tiptap CSS wrapper.
