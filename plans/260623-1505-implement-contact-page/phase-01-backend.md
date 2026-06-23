# Phase 1: Database and Backend API

## Context Links
- [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)
- [Database.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Database.php)

## Requirements
- Create model `App\Models\ContactMessage` which migrates the table `contact_messages`.
- Columns: `id`, `name`, `phone`, `email`, `topic`, `message`, `status` (default 'new'), `source` (default 'website_contact'), `ip_address`, `user_agent`, `created_at`, `updated_at`.
- Validation: name (required, max 100), phone (required, VN format), email (optional, format), topic (required, in allowed list), message (required, min 10, max 2000).
- Allowed topics: `product_consulting`, `order_inquiry`, `after_sales_support`, `business_cooperation`, `other`.
- Anti-spam: check hidden Honeypot field `company_website`. Reject silently with success response if filled.

## Implementation Steps
1. Create `3f-api/app/Models/ContactMessage.php`.
2. Create `3f-api/app/Controllers/ContactController.php`.
3. Register `/api/contact` route and model instantiation in `3f-api/public/index.php`.

## Todo List
- [ ] Implement `ContactMessage.php` model
- [ ] Implement `ContactController.php` controller
- [ ] Register routes in `index.php`

## Success Criteria
- Validations block invalid payloads and return field-level errors.
- Submissions save correctly to `contact_messages` database table.
- Honeypot reject silently works.
