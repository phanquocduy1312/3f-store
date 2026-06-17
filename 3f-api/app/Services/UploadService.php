<?php
namespace App\Services;

use Exception;
use finfo;

class UploadService {
    private static function validateImageFile($file, $maxSizeMb = 5) {
        if (!isset($file['error']) || is_array($file['error'])) {
            throw new Exception("Thong so file khong hop le.");
        }

        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                throw new Exception("Khong co file nao duoc upload.");
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new Exception("Kich thuoc file vuot qua gioi han cho phep.");
            default:
                throw new Exception("Loi upload file khong xac dinh.");
        }

        $maxSize = $maxSizeMb * 1024 * 1024;
        if ($file['size'] > $maxSize) {
            throw new Exception("Kich thuoc anh vuot qua gioi han {$maxSizeMb}MB.");
        }

        $allowedMimes = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp'
        ];

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);

        if (!array_key_exists($mimeType, $allowedMimes)) {
            throw new Exception("Dinh dang file khong hop le. Chi chap nhan JPG, JPEG, PNG, WEBP.");
        }

        return [$mimeType, $allowedMimes[$mimeType]];
    }

    /**
     * Handles order receipt image upload and returns metadata.
     *
     * @param array $file Uploaded file from $_FILES.
     * @return array Metadata details.
     * @throws Exception If upload fails validation or storage fails.
     */
    public static function uploadOrderImage($file) {
        [$mimeType, $extension] = self::validateImageFile($file, 5);

        $storageDir = dirname(__DIR__, 2) . '/storage/uploads/shopee-orders/';
        if (!is_dir($storageDir)) {
            if (!mkdir($storageDir, 0755, true)) {
                throw new Exception("Khong the tao thu muc luu tru anh.");
            }
        }

        $timestamp = date('Ymd_His');
        try {
            $random = bin2hex(random_bytes(4));
        } catch (Exception $e) {
            $random = mt_rand(10000000, 99999999);
        }

        $storedFilename = "order_{$timestamp}_{$random}.{$extension}";
        $filePath = $storageDir . $storedFilename;

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new Exception("Khong the luu file da upload.");
        }

        return [
            "original_filename" => $file['name'],
            "stored_filename"   => $storedFilename,
            "file_path"         => $filePath,
            "file_url"          => "/storage/uploads/shopee-orders/" . $storedFilename,
            "mime_type"         => $mimeType,
            "file_size"         => (int)$file['size']
        ];
    }

    /**
     * Handles loyalty reward image upload and returns a public URL.
     *
     * The canonical copy is stored in storage/uploads/rewards/. A public copy is
     * also placed under public/uploads/rewards/ so hosts serving only public/
     * can open the image directly at /uploads/rewards/...
     */
    public static function uploadRewardImage($file) {
        [$mimeType, $extension] = self::validateImageFile($file, 5);

        $rootDir = dirname(__DIR__, 2);
        $storageDir = $rootDir . '/storage/uploads/rewards/';
        $publicDir = $rootDir . '/public/uploads/rewards/';

        foreach ([$storageDir, $publicDir] as $dir) {
            if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
                throw new Exception("Khong the tao thu muc luu tru anh reward.");
            }
        }

        $timestamp = time();
        try {
            $random = bin2hex(random_bytes(4));
        } catch (Exception $e) {
            $random = mt_rand(10000000, 99999999);
        }

        $storedFilename = "reward_{$timestamp}_{$random}.{$extension}";
        $storagePath = $storageDir . $storedFilename;
        $publicPath = $publicDir . $storedFilename;

        if (!move_uploaded_file($file['tmp_name'], $storagePath)) {
            throw new Exception("Khong the luu file anh reward da upload.");
        }

        if (!copy($storagePath, $publicPath)) {
            @unlink($storagePath);
            throw new Exception("Khong the tao file anh public cho reward.");
        }

        $config = require dirname(__DIR__, 2) . '/config/config.php';
        $publicBaseUrl = rtrim($config['app']['public_url'] ?? '', '/');
        $relativeUrl = "/uploads/rewards/" . $storedFilename;

        return [
            "original_filename" => $file['name'],
            "stored_filename"   => $storedFilename,
            "file_path"         => $storagePath,
            "public_path"       => $publicPath,
            "image_url"         => $publicBaseUrl ? $publicBaseUrl . $relativeUrl : $relativeUrl,
            "mime_type"         => $mimeType,
            "file_size"         => (int)$file['size']
        ];
    }
}
