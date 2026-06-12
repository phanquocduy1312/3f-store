# Scout Report - Create PHP Backend for 3F Club

This report details the requirements, folder structure, database schema, and design specifications for the PHP/MySQL backend of the Shopee Point Request feature.

## Directory Structure to Create
We will create a self-contained `3f-api/` directory with the following structure:
```
3f-api/
├── config/
│   └── database.php
├── helpers/
│   ├── response.php
│   ├── validation.php
│   ├── points.php
│   └── upload.php
├── api/
│   ├── shopee-order-scan.php
│   ├── shopee-request-create.php
│   ├── shopee-request-list.php
│   ├── shopee-request-detail.php
│   ├── shopee-request-approve.php
│   ├── shopee-request-reject.php
│   └── customer-points.php
├── uploads/
│   └── shopee-orders/
└── schema.sql
```

## Relational Database Schema
We will define and implement the following database tables in the `3f` database:

1. **`uploaded_order_images`**: Stores references to uploaded order receipt images.
2. **`order_image_scans`**: Stores mock OCR scan output and confidence details.
3. **`shopee_point_requests`**: Stores customers' point requests (including phone, shopee order code, amount, status, etc.).

All code will be implemented in pure PHP (no framework, no composer) with clean, isolated files, ready to be deployed on shared hosting with cPanel.
