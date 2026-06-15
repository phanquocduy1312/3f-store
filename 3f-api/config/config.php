<?php
/**
 * Application Configuration
 */

return [
    "database" => [
        "host"     => (getenv("DB_HOST") !== false) ? getenv("DB_HOST") : "localhost",
        "name"     => (getenv("DB_NAME") !== false) ? getenv("DB_NAME") : "3f",
        "username" => (getenv("DB_USER") !== false) ? getenv("DB_USER") : "3f_user",
        "password" => (getenv("DB_PASS") !== false) ? getenv("DB_PASS") : "0932368720Ab",
        "charset"  => (getenv("DB_CHARSET") !== false) ? getenv("DB_CHARSET") : "utf8mb4"
    ],
    "app" => [
        "base_url"   => "http://localhost/3f-api/public",
        "upload_url" => "/storage/uploads"
    ],
    "ocr" => [
        "provider" => "ocr_space",
        "api_key"  => "K83643676288957",
        "endpoint" => "https://api.ocr.space/parse/image"
    ],
    "shopee" => [
        "env"          => getenv("SHOPEE_ENV") ?: "sandbox",
        "partner_id"   => getenv("SHOPEE_PARTNER_ID") ?: "1235833",
        "partner_key"  => getenv("SHOPEE_PARTNER_KEY") ?: "",
        "redirect_url" => getenv("SHOPEE_REDIRECT_URL") ?: "https://trial1506895.mbws.vn/api/shopee/callback",
        "base_url"     => getenv("SHOPEE_BASE_URL") ?: "https://partner.test-stable.shopeemobile.com"
    ]
];
