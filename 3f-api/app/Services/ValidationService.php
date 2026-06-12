<?php
namespace App\Services;

class ValidationService {
    /**
     * Strips all non-digit characters from a phone number string.
     */
    public static function normalizePhone($phone) {
        if ($phone === null) return "";
        return preg_replace('/[^\d]/', '', (string)$phone);
    }

    /**
     * Validates if the phone number is a valid Vietnamese phone number.
     */
    public static function isValidVietnamPhone($phone) {
        $normalized = self::normalizePhone($phone);
        return preg_match('/^0\d{8,10}$/', $normalized) === 1;
    }

    /**
     * Normalizes money string representation to a clean integer.
     */
    public static function normalizeMoney($amount) {
        if ($amount === null || $amount === "") return 0;
        if (is_numeric($amount)) return (int)$amount;
        
        $cleaned = preg_replace('/[^\d]/', '', (string)$amount);
        return (int)$cleaned;
    }

    /**
     * Checks if email address has a valid optional format.
     */
    public static function isValidEmailOptional($email) {
        $trimmed = trim((string)$email);
        if ($trimmed === "") return true;
        return filter_var($trimmed, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Safely sanitizes text input: trims whitespace.
     */
    public static function sanitizeText($text) {
        if ($text === null) return "";
        return trim((string)$text);
    }
}
