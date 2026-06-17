# Brainstorming Report: Quick Add To Cart Modal

## Goals
Implement a seamless "Quick Add to Cart / Buy Now" experience for the 3F Store. When users click the cart or "Buy Now" button on any product card, they should be prompted with a fast and responsive variant selection modal rather than being redirected to the product details page.

## Technical Architecture & State Management
To support opening this modal from different list pages (homepage sections, product sliders, product search listing page) without prop-drilling:
1. **Event-driven trigger**: We will use a lightweight window custom event `open-quick-add` to open the modal from any component.
2. **Global placement**: Register `<QuickAddToCartModal />` once in the main `src/App.tsx` layout.
3. **Lazy API fetching**: The product cards only have summary product information. Upon triggering the event, the modal shows a loading spinner, fetches the full product details (including images, options, and variants), and maps option selections dynamically.

## Selected Variant Resolution
- Maintain `selectedOptions` state as a key-value dictionary: `{ [optionGroupName]: selectedValue }`.
- Compare selected options to the variant parameters (`option1Value`, `option2Value`, `option3Value`) to resolve the target `ProductVariant`.
- Update modal display: pricing, original price, discount badge, selected variant image, SKU, and available stock dynamically.
- Implement constraint checks: Disable CTA if selected options are incomplete or if the variant is out of stock. Cap quantity adjustments within the active variant's inventory level.

## Mapped Types & Fields
We will extend `ProductVariant` and `Product` interfaces in `types/store.ts` and `src/api/productsApi.ts` to expose variant attributes (`optionValue`, `optionName`) and option group structures.
