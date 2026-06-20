# Brainstorming: Professional Banner Management System

## Architectural Considerations

To implement a professional banner management system for 3F Store, we need a flexible, dynamic system that supports promotional scheduling, placement grouping, and conversion analytics.

### 1. Placement Grouping
Banners will be classified by their target layout positions:
- `home_hero_slider`: The main banner carousel on the homepage (slots 1 to 3).
- `home_promo_top_right`: The AI Pet Advisor promo card.
- `home_promo_bottom_right`: The first-order discount / voucher card.

### 2. Database Schema Design (`banners` table)
```sql
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  position VARCHAR(50) NOT NULL, -- home_hero_slider, home_promo_top_right, etc.
  image_url VARCHAR(1000) NOT NULL,
  link_url VARCHAR(1000) NULL,
  title_text VARCHAR(500) NULL,      -- Overlay title text
  subtitle_text VARCHAR(500) NULL,   -- Overlay subtext
  cta_text VARCHAR(100) NULL,        -- Button label text
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  start_date DATETIME NULL,          -- Scheduled campaign start
  end_date DATETIME NULL,            -- Scheduled campaign end
  clicks_count INT NOT NULL DEFAULT 0,
  views_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_position (position),
  INDEX idx_active_dates (is_active, start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Backend API Interface (`BannerController.php`)
- `GET /api/banners`: Public fetch filters active banners by position, matching current server time with `start_date` and `end_date`.
- `GET /api/admin/banners`: Returns all banners with conversion performance stats.
- `POST /api/admin/banners`: Registers a new banner (handles multipart file upload).
- `PUT /api/admin/banners/:id`: Updates settings (sort order, text overlay, dates).
- `DELETE /api/admin/banners/:id`: Removals.
- `POST /api/banners/:id/click`: Increments `clicks_count` for analytics tracking.

### 4. Admin Management Panel Features
- **Grid Overview**: Sortable list displaying previews, active periods, placements, and conversion rates (CTR = Clicks/Views).
- **Campaign Form**: Easy creation and schedule picker.
- **Dynamic Sorting**: Drag and drop ordering for carousels.

### 5. Client Integration
- Fetch from `GET /api/banners?position=...` on app mount.
- Display placeholder shimmer cards during load states.
- Auto-click tracking triggers on interaction.
