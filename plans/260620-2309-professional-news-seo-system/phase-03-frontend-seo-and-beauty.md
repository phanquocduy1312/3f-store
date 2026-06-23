# Phase 3: Premium Client UI/UX & SEO

## Context Links
- Research: [researcher-260620-2309-professional-news-seo-system.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/researcher-260620-2309-professional-news-seo-system.md)

## Overview
- Priority: High
- Status: Pending
- Description: Upgrade the public blog list and article detail pages with dynamic document head tag injection, structured JSON-LD graphs, scroll tracking widgets, and integrated e-commerce conversion triggers.

## Key Insights
- Standard Single Page Apps (SPA) don't naturally serve pre-rendered SEO content. Injecting canonical links, Open Graph, and JSON-LD structured data dynamically allows modern search engines to parse rich indexing cards.
- Adding heading slugs directly in the rendering HTML body allows us to highlight the active section inside the Table of Contents sidebar using standard `IntersectionObserver` elements.
- Connecting articles to products dynamically by keyword matching improves cross-selling.

## Requirements
- Dynamic meta tagging in `BlogDetail` (updating `<title>`, description, og:title, og:image, og:description, canonical, and JSON-LD Structured Data script tags on mount/update).
- Scroll progress indicator bar (0% to 100% width at top of page).
- Scroll-to-top button with circular percentage progress.
- Sticky/collapsible Table of Contents (ToC) dynamically compiled from article headings (`h2/h3`) and active item tracking.
- Related products section matching article topics, fetching products from the backend and rendering card actions (add-to-cart).

## Related Code Files
- [MODIFY] [BlogList.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/BlogList.tsx)
- [MODIFY] [BlogDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/BlogDetail.tsx)
- [NEW] [blog-toc.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/blog/blog-toc.tsx)
- [NEW] [blog-share.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/blog/blog-share.tsx)
- [NEW] [blog-related-products.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/blog/blog-related-products.tsx)
- [NEW] [seo-metadata.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/blog/seo-metadata.tsx)

## Implementation Steps
1. **Metadata Component**: Build `seo-metadata.tsx` to handle dynamic title, meta tags, and structured JSON-LD scripting inside the DOM.
2. **Table of Contents**: Build `blog-toc.tsx` using `IntersectionObserver` to highlight headings dynamically. Update `BlogDetail.tsx` to parse and inject IDs into headings before rendering.
3. **Share Widget**: Build `blog-share.tsx` with share handlers.
4. **Cross-Sell Component**: Create `blog-related-products.tsx` to fetch matching products from the `/api/products` endpoint and display them.

## Todo List
- [ ] Implement `seo-metadata.tsx` utility component
- [ ] Build the `blog-toc.tsx` Table of Contents component
- [ ] Refactor `BlogDetail.tsx` to insert heading slugs and integrate metadata
- [ ] Build the `blog-share.tsx` share bar component
- [ ] Build the `blog-related-products.tsx` cross-sell slider
- [ ] Style reading progress bar and circular scroll-to-top indicators

## Success Criteria
- Page title changes dynamically to `[SEO Title] | 3F Store`.
- JSON-LD script contains clean `BlogPosting` and `BreadcrumbList` graphs.
- Table of Contents automatically lists article sections and highlights them on scroll.
- Clicking a ToC item scrolls smoothly to the target section.
- Under the article, a product carousel displays matching items (e.g. Pate & Snack if the blog is about cat treats).
- All builds compile successfully.
