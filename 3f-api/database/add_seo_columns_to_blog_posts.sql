-- Migration script to add SEO metadata and view tracking columns to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN seo_title VARCHAR(255) NULL AFTER title,
ADD COLUMN seo_description TEXT NULL AFTER summary,
ADD COLUMN seo_keywords VARCHAR(255) NULL AFTER author,
ADD COLUMN thumbnail_alt VARCHAR(255) NULL AFTER thumbnail_url,
ADD COLUMN status VARCHAR(50) DEFAULT 'published' AFTER author,
ADD COLUMN view_count INT DEFAULT 0 AFTER published_at,
ADD COLUMN seo_score INT DEFAULT 0 AFTER view_count;

