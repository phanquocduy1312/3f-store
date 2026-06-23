# Phase 03: Frontend Client Integration

## Context Links
- [HeroSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/HeroSection.tsx)
- [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)

## Overview
- **Priority**: Medium
- **Current Status**: Planning
- **Description**: Replace static image paths in the homepage `HeroSection` with dynamic data fetched from the banners API. Add click event tracking to measure banner performance.

## Key Insights
- Public banners API filters by placement positions (`home_hero_slider`, `home_promo_top_right`, `home_promo_bottom_right`).
- Need placeholder states (shimmer or CSS loading effects) to prevent layout shifts.
- Clicking a banner should invoke the click tracker API `POST /api/banners/{id}/click` asynchronously without blocking user navigation.

## Requirements
- Add public fetch helper `getActiveBanners(position)` and click event tracker `trackBannerClick(id)` in `src/api/productsApi.ts`.
- Update `HeroSection.tsx` to call API on component mount.
- Dynamically render banners inside Swiper:
  - If dynamic banners list is empty, fallback to static assets (`/assets/images/banner-1.webp`, etc.).
  - Map variables correctly: `banner.image_url`, `banner.link_url`, `banner.title_text`, `banner.subtitle_text`, `banner.cta_text`.
- Attach onClick handlers to all banner link wrappers to fire the click tracker API.

## Architecture
```
[User Clicks Banner] ---> [Trigger trackBannerClick(id) background promise] ---> [Navigate to link_url]
```

## Related Code Files
- **[MODIFY]** `components/HeroSection.tsx`
- **[MODIFY]** `src/api/productsApi.ts`

## Implementation Steps
1. Define the public API call methods in `src/api/productsApi.ts`.
2. Open `components/HeroSection.tsx` and set state hooks for loaded slider banners and promo banners.
3. Fetch data inside `useEffect` hook.
4. Replace static swiper items with dynamic items, displaying overlay title/subtitle/CTA texts if provided.
5. Replace the static AI advisor and Voucher cards with dynamic entries fetched from positions `home_promo_top_right` and `home_promo_bottom_right` respectively.
6. Attach a click event function to increment the stats count.

## Todo List
- [ ] Implement client API calls in `productsApi.ts`
- [ ] Add state hooks and fetch inside `HeroSection.tsx`
- [ ] Update swiper slides to render dynamic banners
- [ ] Update top/bottom promo cards on the right dynamically
- [ ] Implement async click tracking trigger

## Success Criteria
- Banners render correctly using database entries.
- Homepage falls back to default static banners if database is empty or connection fails.
- Clicking banners increases the database counter `clicks_count` successfully.

## Risk Assessment
- *Risk*: Page load delay due to network roundtrips.
- *Mitigation*: Fallback quickly to static defaults if requests time out, keeping user experience smooth.

## Security Considerations
- Validate redirect links before navigations to prevent redirects to dangerous external websites (only allow relative links or validated domains).

## Next Steps
- Deliver plan to user for review and approval.
