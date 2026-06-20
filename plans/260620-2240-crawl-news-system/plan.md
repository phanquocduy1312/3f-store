---
title: Crawl News and Import System
description: Scrape all articles from 3fstore.vn/tin-tuc and build a dynamic blog system for 3F Store.
status: in-progress
priority: high
effort: medium
branch: feature/crawl-news-system
tags: [crawling, scraper, blog, api, mysql]
created: 2026-06-20
---

# Crawl News and Dynamic Blog Plan

This plan details the crawling, importing, and integration of news articles from `https://3fstore.vn/tin-tuc` into our application.

## Phases

### Phase 1: Scraping and Database Storage
* Create `blog_posts` table migration in PHP backend.
* Write a Python script to scrape all pages of the news section and details, importing directly into the database.
* Status: [Pending]
* Detail: [phase-01-crawling-and-import.md](file:///c:/Users/Admin/Downloads/ccc/plans/260620-2240-crawl-news-system/phase-01-crawling-and-import.md)

### Phase 2: PHP API Endpoints
* Implement `BlogPost` model and `BlogPostController`.
* Define routes in `index.php` for list and details of blog posts.
* Status: [Pending]

### Phase 3: Frontend Integration
* Add "Tin tức" route (`/tin-tuc` and `/tin-tuc/:slug`) and pages.
* Fetch blog posts dynamically from the PHP API in the homepage's `BlogNewsletter` component and the new pages.
* Update header navigation to include the "Tin tức" link.
* Status: [Pending]

## Dependencies
* Python interpreter with `BeautifulSoup4` and `pymysql`/`mysql-connector-python` (already verified on system).
* Backend migration and api connection.
