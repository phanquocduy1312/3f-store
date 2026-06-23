<?php
namespace App\Controllers;

use App\Core\Response;
use App\Core\Request;
use App\Models\ContactMessage;
use Exception;

class ContactController {
    /**
     * POST /api/contact
     */
    public function submit() {
        try {
            $input = Request::json();

            // 1. Honeypot check
            if (!empty($input['company_website'])) {
                // Reject silently
                Response::json([
                    "success" => true,
                    "message" => "3F Store đã nhận được thông tin. Tụi mình sẽ liên hệ lại trong thời gian sớm nhất."
                ], 200);
                return;
            }

            // 2. Extract inputs
            $name = isset($input['name']) ? trim((string)$input['name']) : '';
            $phone = isset($input['phone']) ? trim((string)$input['phone']) : '';
            $email = isset($input['email']) ? trim((string)$input['email']) : '';
            $topic = isset($input['topic']) ? trim((string)$input['topic']) : '';
            $message = isset($input['message']) ? trim((string)$input['message']) : '';

            $errors = [];

            // 3. Validation
            if (empty($name)) {
                $errors['name'] = "Họ và tên là bắt buộc.";
            } elseif (mb_strlen($name) > 100) {
                $errors['name'] = "Họ và tên không được vượt quá 100 ký tự.";
            }

            if (empty($phone)) {
                $errors['phone'] = "Số điện thoại là bắt buộc.";
            } else {
                // Vietnamese phone number regex format
                $phoneRegex = '/^(?:\+84|0)(?:3|5|7|8|9)[0-9]{8}$/';
                if (!preg_match($phoneRegex, $phone)) {
                    $errors['phone'] = "Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0909913889).";
                }
            }

            if (!empty($email)) {
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $errors['email'] = "Địa chỉ email không đúng định dạng.";
                } elseif (strlen($email) > 100) {
                    $errors['email'] = "Email không được vượt quá 100 ký tự.";
                }
            }

            $allowedTopics = ['product_consulting', 'order_inquiry', 'after_sales_support', 'business_cooperation', 'other'];
            if (empty($topic)) {
                $errors['topic'] = "Vui lòng chọn chủ đề liên hệ.";
            } elseif (!in_array($topic, $allowedTopics)) {
                $errors['topic'] = "Chủ đề liên hệ không hợp lệ.";
            }

            if (empty($message)) {
                $errors['message'] = "Nội dung cần hỗ trợ là bắt buộc.";
            } elseif (mb_strlen($message) < 10) {
                $errors['message'] = "Nội dung cần hỗ trợ phải có ít nhất 10 ký tự.";
            } elseif (mb_strlen($message) > 2000) {
                $errors['message'] = "Nội dung cần hỗ trợ không được vượt quá 2000 ký tự.";
            }

            if (!empty($errors)) {
                Response::json([
                    "success" => false,
                    "message" => "Thông tin liên hệ chưa hợp lệ.",
                    "errors" => $errors
                ], 400);
                return;
            }

            // 4. Save to Database
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
            if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                $ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
            }
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

            $model = new ContactMessage();
            $model->saveMessage([
                'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                'phone' => htmlspecialchars($phone, ENT_QUOTES, 'UTF-8'),
                'email' => htmlspecialchars($email, ENT_QUOTES, 'UTF-8'),
                'topic' => htmlspecialchars($topic, ENT_QUOTES, 'UTF-8'),
                'message' => htmlspecialchars($message, ENT_QUOTES, 'UTF-8'),
                'ip_address' => substr(htmlspecialchars($ipAddress, ENT_QUOTES, 'UTF-8'), 0, 50),
                'user_agent' => substr(htmlspecialchars($userAgent, ENT_QUOTES, 'UTF-8'), 0, 255),
                'status' => 'new',
                'source' => 'website_contact'
            ]);

            Response::json([
                "success" => true,
                "message" => "3F Store đã nhận được thông tin. Tụi mình sẽ liên hệ lại trong thời gian sớm nhất."
            ], 200);

        } catch (Exception $e) {
            Response::json([
                "success" => false,
                "message" => "Có lỗi xảy ra: " . $e->getMessage()
            ], 500);
        }
    }
}
