# Scout Report: Mobile Responsiveness Audit

This report highlights responsiveness gaps and visual layout issues on mobile devices for the 3F Store website.

## Gaps Audited

### 1. Navigation & Header (`components/Header.tsx`)
- **Issue**: The hamburger menu button is present (`lg:hidden`), but clicking it does nothing. Mobile navigation is completely missing.
- **Solution**: Implement a slide-in responsive drawer displaying the navigation tree, search, user login links, and shopping cart.

### 2. Category Section (`components/CategorySection.tsx`)
- **Issue**: Stacks as a single vertical column on mobile, which is too long and takes up excessive vertical space.
- **Solution**: Change to a clean 2-column grid (`grid-cols-2`) on mobile and 3-column on tablet (`md:grid-cols-3`).

### 3. PetFood Section (`components/PetFoodSection.tsx`)
- **Issue**: Banner cards contain large illustrative images that wrap poorly or look disproportionately tall on mobile screens. Swiper pagination styling needs alignment.
- **Solution**: Adjust layout classes, scale down images, and improve absolute positioning for mobile screens.

### 4. Big Deals Section (`components/BigDealsSection.tsx`)
- **Issue**: **CRITICAL BARRIER.** Uses absolute positioning overlay (`absolute inset-x-6 top-24 bottom-6`) over the background image `sale.webp`. On mobile screens, the image height shrinks to ~150px, forcing the Swiper content to overflow and completely break.
- **Solution**: Bypass the absolute frame image on mobile. Use a custom CSS gradient box with static layouts instead. Maintain the frame overlay ONLY on desktop (`lg:`).

### 5. Product Listing (`components/ProductListing.tsx`)
- **Issue**: The entire filter sidebar is `hidden lg:flex`. On mobile/tablet, filters are completely inaccessible, meaning customers cannot filter items.
- **Solution**: Add a floating action button "Lọc sản phẩm" on mobile that triggers a slide-up drawer containing the sidebar filters.

### 6. Blog & Newsletter (`components/BlogNewsletter.tsx`)
- **Issue**: In the newsletter banner, the absolute animal image (`dogandcat.webp`) collides with form inputs and labels on mobile.
- **Solution**: Shift absolute image positioning, or hide it on mobile to keep form inputs clean and prominent.

## Action Plan
A detailed plan is being created under `plans/260608-1112-upgrade-mobile-responsiveness/`.
