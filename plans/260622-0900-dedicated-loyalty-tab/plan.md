# Plan: Dedicated Membership Rank Tab in Sidebar

Move the 3F Club membership status and rank card out of the "Hồ sơ cá nhân" (Personal Profile) page and place it inside a new dedicated navigation tab "Thành viên 3F Club" on the left-hand account sidebar.

## Proposed Changes

### Client Navigation & Routing

#### [MODIFY] [AccountShell.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/AccountShell.tsx)
- Add the "Thành viên 3F Club" navigation item to the left-hand menu.
  - Name: "Thành viên 3F Club"
  - Path: `/account/club`
  - Icon: `Award`

#### [MODIFY] [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- Lazily import `ClubPage` from `./pages/client/account/ClubPage`.
- Register the `/account/club` route inside the protected customer layout block.

### Client Profile Page Cleanup & Auto-Trigger

#### [MODIFY] [ProfilePage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/ProfilePage.tsx)
- Remove the membership rank card and associated states (`clubSummary`, `loadingClub`, `clubError`, `isLocked`) from the sidebar.
- Add an effect to check for query parameters (e.g. `?verify=phone`) on mount. If present, automatically set `isChangingPhone` to true, populate the phone number, and scroll smoothly to the verification card.

### New Dedicated Club Page

#### [NEW] [ClubPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/ClubPage.tsx)
- Create a new page displaying membership rank information.
- Fetch club summary from `/api/customer/club/summary`.
- **Unverified State:** Render a beautiful, full-sized locked card prompting users to verify their phone number, with a CTA button that redirects them to `/account/profile?verify=phone`.
- **Verified State:** Render a premium active card matching their tier color showing:
  - Points balance.
  - Multiplier & payment limit.
  - Next tier spend and order counts progress.
  - Highest tier badge.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to verify type safety.
- Run `npm run build` to verify production bundling.

### Manual Verification
- Log in and verify that the sidebar contains the new "Thành viên 3F Club" tab.
- Click the tab as an unverified user, verify that the locked card is rendered, and click the CTA to verify that it redirects to profile page and opens phone verification.
- Verify that a verified user sees their rank, points, and progression in a beautiful layout.
