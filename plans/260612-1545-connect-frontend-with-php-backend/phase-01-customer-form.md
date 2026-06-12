# Phase 1: Customer Form Integration

**Context Links**
- Scout Report: [scout-260612-1545-connect-frontend-with-php-backend.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260612-1545-connect-frontend-with-php-backend.md)
- Form Component: [threeFclup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/threeFclup.tsx)

## Overview
- Priority: High
- Current Status: In Progress
- Description: Connect customer-facing Shopee points scanning and creation forms with the real PHP backend.

## Key Insights
- Always clear scanning errors and warnings when initiating a new scan.
- Normalize Vietnamese phone number and amounts correctly before validation and payload building.
- Apply high-contrast visual cues (green border, label) on fields filled automatically.

## Requirements
- Support real multipart uploads to `/api/shopee/order-scan`.
- Reset previous scan inputs on new uploads to ensure outdated scanner results do not leak.
- Allow optional email entry and basic syntax verification.
- Prevent submission while scanning is active.

## Architecture
- Direct REST call from React frontend to PHP MVC backend endpoint on `API_BASE_URL`.

## Related Code Files
- [threeFclup.tsx](file:///c:/Users/Admin/Downloads/ccc/components/threeFclup.tsx)

## Implementation Steps
1. Refactor `handleOrderImageChange` to call `scanShopeeOrderImage(file)`.
2. Clear old state (scan result, warnings, errors) upon selecting a new file.
3. Apply auto-filled fields highlighting and transition them away after 2 seconds.
4. Bind `createShopeePointRequest` payload parameters properly.

## Todo List
- [ ] Refactor upload scan image handler
- [ ] Apply phone and currency format normalization
- [ ] Connect form submission callback to create point request API
- [ ] Verify form validation criteria

## Success Criteria
- Uploaded order images call the real OCR backend and fill values.
- Empty optional emails submit without issues.
- The submit button is properly disabled when required parameters are absent or invalid.
