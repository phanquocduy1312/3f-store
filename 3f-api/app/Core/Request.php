<?php
namespace App\Core;

class Request {
    private static $jsonData = null;

    /**
     * Retrieves HTTP request method.
     */
    public static function method() {
        return $_SERVER['REQUEST_METHOD'];
    }

    /**
     * Parses JSON request body.
     */
    public static function json() {
        if (self::$jsonData === null) {
            $rawInput = file_get_contents('php://input');
            self::$jsonData = json_decode($rawInput, true) ?: [];
        }
        return self::$jsonData;
    }

    /**
     * Retrieves request input. Parses both standard POST and JSON POST.
     */
    public static function input($key, $default = null) {
        $method = self::method();
        if ($method === 'POST' || $method === 'PUT') {
            $contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
            if (stripos($contentType, 'application/json') !== false) {
                $json = self::json();
                return isset($json[$key]) ? $json[$key] : $default;
            }
            return isset($_POST[$key]) ? $_POST[$key] : $default;
        }
        return self::query($key, $default);
    }

    /**
     * Retrieves files from form-data.
     */
    public static function file($key) {
        return isset($_FILES[$key]) ? $_FILES[$key] : null;
    }

    /**
     * Retrieves URL query parameters.
     */
    public static function query($key, $default = null) {
        return isset($_GET[$key]) ? $_GET[$key] : $default;
    }
}
