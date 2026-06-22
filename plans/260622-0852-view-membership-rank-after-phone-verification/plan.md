# Plan: View Membership Rank After Phone Verification

Allow users to view their 3F Club membership rank and point details on the profile page once they have verified their phone number. Show an elegant, motivational teaser card if the phone number is not yet verified.

## User Review Required

> [!NOTE]
> The membership tier details (points balance, tier multiplier, progress to next tier) will be fetched directly from the existing `/api/customer/club/summary` endpoint.
> If the user has not verified their phone number, we will display a visually appealing "Locked" state card that prompts them to verify their phone number, with an interactive button to trigger the phone number verification process instantly.

## Proposed Changes

### Client Profile Page

#### [MODIFY] [ProfilePage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/ProfilePage.tsx)
- Import `getClubSummaryApi` and types from `@/src/api/customerClubApi`.
- Add states for `clubSummary` and `loadingClub`.
- Implement `fetchClubSummary` function to fetch membership details.
- Use `useEffect` to trigger `fetchClubSummary` when `profile.phoneVerifiedAt` is truthy.
- Design and implement the membership rank card inside the right-hand sidebar (`<aside className="space-y-5">`).
  - **Unverified State:** Render a premium card with a lock or shield icon, explaining that verification is required to unlock 3F Club membership features. Add a CTA button to activate verification (which automatically opens the phone change/verification state).
  - **Verified State:** Render a premium-looking card matching the current tier color (Silver, Gold, Diamond, or default) with:
    - Tier name and multiplier (e.g. `Gold (1.2x Point)`)
    - Available points balance
    - Progress bars to the next tier ( Spend progress & Order progress ) if a next tier is available.
    - An aesthetic success badge if they are at the highest level (Diamond).

## Verification Plan

### Manual Verification
1. Run the local development server (`npm run dev`).
2. Log in as a customer with an unverified phone number, go to `/account/profile` and verify that the "Locked/Teaser" membership card is visible.
3. Click "Xác thực số điện thoại ngay" on the card and verify that the verification input fields are shown.
4. Complete phone verification (using the development OTP if prompted).
5. Verify that the membership card automatically updates to display the active tier, points balance, and tier progress.
