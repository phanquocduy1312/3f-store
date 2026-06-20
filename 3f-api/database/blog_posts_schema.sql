CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    seo_title VARCHAR(255) NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT NULL,
    seo_description TEXT NULL,
    content LONGTEXT NOT NULL,
    thumbnail_url VARCHAR(500) NULL,
    thumbnail_alt VARCHAR(255) NULL,
    author VARCHAR(100) DEFAULT 'Admin',
    status VARCHAR(50) DEFAULT 'published',
    seo_keywords VARCHAR(255) NULL,
    published_at DATETIME NULL,
    view_count INT DEFAULT 0,
    seo_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_slug (slug),
    INDEX idx_published_at (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

