# Technical Research: Professional SEO News System for 3F Store

This report outlines the design, SEO requirements, and administrative capabilities required to implement a professional-grade blog/news system for 3F Store.

## 1. Database Schema Enhancements
To support granular SEO controls, we must expand the `blog_posts` table:
```sql
ALTER TABLE blog_posts 
ADD COLUMN seo_title VARCHAR(255) NULL AFTER title,
ADD COLUMN seo_description VARCHAR(500) NULL AFTER summary,
ADD COLUMN seo_keywords VARCHAR(255) NULL AFTER author,
ADD COLUMN view_count INT DEFAULT 0 AFTER published_at;
```
- **seo_title**: Custom Title tag override (falling back to standard title if null).
- **seo_description**: Custom Meta Description override (falling back to summary if null).
- **seo_keywords**: Comma-separated focus keywords/tags.
- **view_count**: To track popular articles.

## 2. Advanced Frontend SEO Architecture
To satisfy search engine crawler requirements and rich social media shares:

### Dynamic Document Head Injection
We will implement an injection utility that dynamically inserts:
- `<title>`: `${seo_title || title} | 3F Store`
- `<meta name="description" content="...">`: `${seo_description || summary}`
- `<link rel="canonical" href="...">`: Pointer to absolute URL.
- **Open Graph (og:*) & Twitter Cards**:
  - `og:type` = "article"
  - `og:title`, `og:description`, `og:image` (using thumbnail)
  - `article:published_time`, `article:author`

### JSON-LD Structured Data
Search engines rely heavily on Structured Data. We will dynamically output two JSON-LD graphs in `BlogDetail`:
1. **BlogPosting Schema**:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "BlogPosting",
     "mainEntityOfPage": { "@type": "WebPage", "@id": "canonical_url" },
     "headline": "title",
     "description": "summary",
     "image": "thumbnail_url",
     "datePublished": "published_at",
     "author": { "@type": "Person", "name": "author_name" },
     "publisher": {
       "@type": "Organization",
       "name": "3F Store",
       "logo": { "@type": "ImageObject", "url": "https://3fstore.vn/assets/logo/logo.webp" }
     }
   }
   ```
2. **BreadcrumbList Schema**: Maps `Trang chủ > Tin tức > [Article Title]` to help Google display breadcrumb trails in search results.

---

## 3. High-Fidelity UI/UX & Typography
We will build a reading interface designed for readability, matching premium content hubs:

- **Viewport Progress Indicator**: A slim header bar (`bg-forest h-1`) tracking scroll completion.
- **Table of Contents (ToC)**:
  - Scraped dynamically from `h2/h3` tags in content.
  - Generates anchor IDs dynamically.
  - Active section is highlighted in the sidebar using an `IntersectionObserver` hook.
- **Typography Matrix**:
  - Max reading width clamped to `72ch` (approx `680px` on desktop) for comfort.
  - Font family: Inter/Outfit combination.
  - Font size: `text-base` scaling to `text-lg` (18px) for body text with `leading-relaxed` (1.75 line-height).
  - High-contrast typography: Dark ink headings (`text-ink`), slate body (`text-ink/80`), forest accents.
- **Conversion Widgets**:
  - Related product suggestions: Queries catalog for products matching article categories/keywords (e.g. pate, dog food) and displays a horizontal card slider under the post with direct "Add to Cart".
  - Call-To-Action (CTA) panel: Embedded promo banner offering member-only discounts.

---

## 4. Admin Content Operations (CRUD)
The Admin panel (`/admin/news`) will manage articles:

- **List view**: Grid of posts showing publishing status, views, and an "SEO Quality Badge".
- **Form Modal/Page**:
  - **Rich Text Editor**: TipTap editor integration supporting bold, italic, H2, H3, lists, tables, and image insertions.
  - **Live SEO Assistant Panel**: Real-time evaluation of:
    - Focus keyword present in Title / Meta description / Content (density > 1%).
    - Word count (optimal > 500 words).
    - Meta description length (optimal 120-160 chars).
    - Title length (optimal 50-60 chars).
  - **Crawler Portal**: Trigger manual crawlers directly from the Admin UI.
