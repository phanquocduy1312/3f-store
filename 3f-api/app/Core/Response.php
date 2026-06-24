<?php
namespace App\Core;

class Response {
    /**
     * Responds with structured JSON format and status code.
     *
     * @param mixed $data Response payload.
     * @param int $statusCode HTTP status code.
     */
    public static function json($data, $statusCode = 200) {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code($statusCode);
        }
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        if (getenv('TESTING_MODE') === 'true') {
            throw new \Exception("TEST_JSON_RESPONSE_STOP");
        }
        exit;
    }
}
// Force deploy: 2026-06-24 11:15

