<?php
namespace App\Services;

use Exception;
use finfo;

class UploadService {
    /**
     * Handles order receipt image upload and returns metadata.
     *
     * @param array $file Uploaded file from $_FILES.
     * @return array Metadata details.
     * @throws Exception If upload fails validation or storage fails.
     */
    public static function uploadOrderImage($file) {
        if (!isset($file['error']) || is_array($file['error'])) {
            throw new Exception("Thông số file không hợp lệ.");
        }

        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                throw new Exception("Không có file nào được upload.");
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new Exception("Kích thước file vượt quá giới hạn cho phép.");
            default:
                throw new Exception("Lỗi upload file không xác định.");
        }

        // Limit size to 5MB
        $maxSize = 5 * 1024 * 1024;
        if ($file['size'] > $maxSize) {
            throw new Exception("Kích thước ảnh vượt quá giới hạn 5MB.");
        }

        $allowedMimes = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp'
        ];

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);

        if (!array_key_exists($mimeType, $allowedMimes)) {
            throw new Exception("Định dạng file không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP.");
        }

        $extension = $allowedMimes[$mimeType];

        // Storage relative to root directory
        $storageDir = dirname(__DIR__, 2) . '/storage/uploads/shopee-orders/';
        if (!is_dir($storageDir)) {
            if (!mkdir($storageDir, 0755, true)) {
                throw new Exception("Không thể tạo thư mục lưu trữ ảnh.");
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
            throw new Exception("Không thể lưu file đã upload.");
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
}
