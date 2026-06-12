<?php
/**
 * Application Configuration
 */

return [
    "database" => [
        "host"     => "localhost",
        "name"     => "3f",
        "username" => "root",
        "password" => "",
        "charset"  => "utf8mb4"
    ],
    "app" => [
        "base_url"   => "http://localhost/3f-api/public",
        "upload_url" => "/storage/uploads"
    ],
    "ocr" => [
        "provider" => "ocr_space",
        "api_key"  => "K83643676288957",
        "endpoint" => "https://api.ocr.space/parse/image"
    ]
];
