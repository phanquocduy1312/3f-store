# Phase 1: Implementation - Restore and Read-Only Diamond Tier

## Context Links
- [MembershipTiersSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/loyalty/MembershipTiersSection.tsx)

## Overview
- **Priority**: High
- **Current Status**: In Progress
- **Description**: Restore the Diamond tier display in the membership tiers table and disable all actions (edit/delete/toggle) for it.

## Key Insights
- Diamond tier is system-wide and its settings are computed via backend loyalty engine based on spend/orders.
- Deleting or editing it from the standard admin portal breaks system assumptions and seeding logic.

## Requirements
- Show `Diamond` in the admin tiers list.
- Keep the `Diamond` row uneditable and undeletable.
- Gray out and disable the Edit and Delete buttons for Diamond with clear cursor styling (`cursor-not-allowed`).
- Mapping the Diamond badge icon to `badge_platinum.png` correctly.

## Architecture
- React Frontend (Vite + TypeScript) rendering the list.
- Disabled buttons styled using Tailwind CSS subclasses.

## Related Code Files
- [MembershipTiersSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/loyalty/MembershipTiersSection.tsx)

## Implementation Steps
1. Support `disabled?: boolean` property in the `IconButton` component.
2. Render `disabled` styling when `disabled` is true (gray border, gray text, light gray background, no hover background, cursor-not-allowed).
3. Remove the `.filter((tier) => tier.name?.trim().toLowerCase() !== "diamond")` check from `visibleTiers` in `MembershipTiersSection.tsx`.
4. Update `getTierBadgeImage` to map `diamond` name to `/assets/images/badge_platinum.png`.
5. Pass `disabled={tier.name?.trim().toLowerCase() === "diamond"}` to both Pencil (Edit) and Trash2 (Delete/Toggle) `IconButton`s in the table.
6. Update validation message for "diamond" input name if users try to create a new tier with "diamond" as name.

## Todo List
- [ ] Support `disabled` prop in `IconButton`
- [ ] Remove Diamond exclusion from `visibleTiers`
- [ ] Map Diamond badge image to Platinum badge
- [ ] Disable edit & delete actions on Diamond tier row

## Success Criteria
- Diamond tier is shown in the table list.
- Edit and Delete icon buttons for Diamond tier are grayed out and not clickable.
- No React or TypeScript compilation errors.

## Risk Assessment
- None. Simple UI modifications.

## Security Considerations
- Read-only is enforced on frontend. Backend also prevents unauthorized modifications, but disabling it in UI completes the UX requirement.

## Next Steps
- Phase 2: Verification.
