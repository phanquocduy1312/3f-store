# Phase 2: Frontend Hardening & Enforcement Details

## Context Links
- [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260624-1112-secure-roles-permissions/plan.md)
- [AccountFormModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/accounts/AccountFormModal.tsx)

## Overview
- **Priority**: Medium
- **Current Status**: In Progress
- **Description**: Secure the UI by disabling form controls for self-modification and restricting selection of top-tier roles based on the active administrator session.

## Requirements
- **Self-Edit Control Disabling**: Disable the "Role" selector and the "Kích hoạt" checkbox when editing the logged-in user's account.
- **Top-Tier Selection Lock**: Filter or disable the top-tier roles (`dev`, `admin`, `super_admin`) from the role selector dropdown if the currently logged-in user is not in one of these top-tier roles.
- **Warning text**: Display a clear warning notice explaining the restriction.

## Related Code Files
- [AccountFormModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/accounts/AccountFormModal.tsx) [MODIFY]

## Implementation Steps
- Add session parsing logic for the logged-in user to fetch their ID and role.
- Conditional disable parameters on the input controls.
- Filter the role options list dynamically before rendering.
- Add client-side validation logic prior to submit calls.

## Todo List
- [ ] Parse current user's role from session storage (`admin_user`) in `AccountFormModal.tsx`.
- [ ] Disable role dropdown and active checkbox if `editingAccount.id === currentAdminId`.
- [ ] Hide/disable top-tier roles (`dev`, `admin`, `super_admin`) in the select dropdown if `currentAdminRole` is not top-tier.
- [ ] Add Vietnamese helper warning messages.

## Success Criteria
- Editing self displays disabled role and active inputs.
- Non-top-tier logged-in admin (e.g. manager) editing another account cannot see or select the "Super Admin" role.
