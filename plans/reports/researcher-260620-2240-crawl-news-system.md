# Researcher Report: News Crawling & Dynamic Blog Integration

## 1. Feasibility Analysis
Crawling `https://3fstore.vn/tin-tuc` is 100% feasible. It is a public site built on Sapo (Bizweb) with standard static HTML rendering. The layout is clean and predictable.

## 2. Scraping Architecture
We can scrape the news in a two-stage process using a Python script:
1. **List Page Scraper**: Iterates through page parameters (`/tin-tuc?page=X`) to capture:
   - **Title & Slug**: Title and path URL from the `<h3>` or `<a>` tags.
   - **Thumbnail Image**: Extracted from `<img class="lazy" data-src="...">` inside the `news-item` block.
   - **Summary**: Extracted from `div.article-sum` text.
   - **Date**: Extracted from `p.news-item-date` (e.g. `Wednesday, 04 October, 2023`).
2. **Detail Page Scraper**: Visits each article URL to extract:
   - **Full Rich-Text/HTML Content**: Inside `<div class="article-details nd-toc-content">`. This contains headings, paragraphs, and formatted images. We will keep the rich HTML tags intact for formatting and absolute-ize image URLs (`//bizweb.dktcdn.net` to `https://bizweb.dktcdn.net`).
   - **Author**: From `span.author` or `.article-main` meta block.

## 3. Database Schema (`blog_posts`)
```sql
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `summary` TEXT NULL,
  `content` LONGTEXT NOT NULL,
  `thumbnail_url` VARCHAR(500) NULL,
  `author` VARCHAR(100) DEFAULT 'Admin',
  `published_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_published_at` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 4. Backend API
- **Endpoint**: `GET /api/blog-posts` - Returns list of active posts, ordered by `published_at DESC`, with optional pagination.
- **Endpoint**: `GET /api/blog-posts/:slug` - Returns detail of a single post by slug.
- **Controller**: `BlogPostController.php`
- **Model**: `BlogPost.php`

## 5. Frontend UI Integration
- **Navigation**: Add "Tin tức" to `components/Header.tsx` navbar.
- **Pages**:
  - `src/pages/BlogList.tsx` (Route: `/tin-tuc`): Displays the blog grid, category tags, search bar, and pagination.
  - `src/pages/BlogDetail.tsx` (Route: `/tin-tuc/:slug`): Displays H1 title, author, publication date, and the rich HTML content with standard typography styling.
- **Home Integration**: Dynamically query `/api/blog-posts` in `components/BlogNewsletter.tsx` to display the 4 most recent articles.
