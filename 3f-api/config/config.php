<?php
/**
 * Application Configuration
 */

return [
    "database" => [
        "host"     => getenv("DB_HOST") ?: ($_ENV["DB_HOST"] ?? ($_SERVER["DB_HOST"] ?? "localhost")),
        "name"     => getenv("DB_NAME") ?: ($_ENV["DB_NAME"] ?? ($_SERVER["DB_NAME"] ?? "3f")),
        "username" => getenv("DB_USER") ?: ($_ENV["DB_USER"] ?? ($_SERVER["DB_USER"] ?? "3f_user")),
        "password" => getenv("DB_PASS") ?: ($_ENV["DB_PASS"] ?? ($_SERVER["DB_PASS"] ?? "")),
        "charset"  => getenv("DB_CHARSET") ?: ($_ENV["DB_CHARSET"] ?? ($_SERVER["DB_CHARSET"] ?? "utf8mb4"))
    ],

    "app" => [
        "env"        => getenv("APP_ENV") ?: "production",
        "base_url"   => getenv("APP_URL") ?: "https://trial1506895.mbws.vn",
        "public_url" => getenv("APP_PUBLIC_URL") ?: "https://trial1506895.mbws.vn",
        "upload_url" => getenv("APP_UPLOAD_URL") ?: "/storage/uploads"
    ],

    "ocr" => [
        "provider" => getenv("OCR_PROVIDER") ?: "ocr_space",
        "api_key"  => getenv("OCR_SPACE_API_KEY") ?: "",
        "endpoint" => getenv("OCR_SPACE_ENDPOINT") ?: "https://api.ocr.space/parse/image"
    ],

    "shopee" => [
        "env"                   => getenv("SHOPEE_ENV") ?: "live",
        "partner_id"            => getenv("SHOPEE_PARTNER_ID") ?: "2036804",
        "partner_key"           => getenv("SHOPEE_PARTNER_KEY") ?: "shpk4677485a79656177444669655758414c5a56684f71424a74724f65636875",
        "redirect_url"          => getenv("SHOPEE_REDIRECT_URL") ?: "https://trial1506895.mbws.vn/api/shopee/callback",
        "base_url"              => getenv("SHOPEE_BASE_URL") ?: "https://partner.shopeemobile.com",
        "auth_base_url"         => getenv("SHOPEE_AUTH_BASE_URL") ?: "https://partner.shopeemobile.com",
        "api_base_url"          => getenv("SHOPEE_API_BASE_URL") ?: "https://partner.shopeemobile.com/api/v2",
        "frontend_redirect_url" => getenv("SHOPEE_FRONTEND_REDIRECT_URL") ?: "https://3f-store.vercel.app/admin/3f-club"
    ]
];