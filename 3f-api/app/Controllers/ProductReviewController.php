<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\AuthMiddleware;
use App\Models\ProductReview;
use Exception;

class ProductReviewController {
    public function adminList() {
        try {
            AuthMiddleware::requireAdmin();
            $model = new ProductReview();
            $data = $model->adminList([
                'page' => Request::query('page', 1),
                'limit' => Request::query('limit', 20),
                'q' => Request::query('q', ''),
                'status' => Request::query('status', 'all'),
                'rating' => Request::query('rating', 0),
                'verified' => Request::query('verified', 'all'),
                'hasImages' => Request::query('hasImages', 'all'),
                'sort' => Request::query('sort', 'newest'),
            ]);

            Response::json(['success' => true, 'data' => $data], 200);
        } catch (Exception $e) {
            $code = $e->getCode();
            if ($code < 400 || $code > 499) {
                $code = 500;
            }
            Response::json(['success' => false, 'message' => $e->getMessage()], $code);
        }
    }

    public function adminDetail() {
        try {
            AuthMiddleware::requireAdmin();
            $id = (int)Request::query('id', 0);
            $review = (new ProductReview())->adminFindById((int)$id);
            if (!$review) {
                Response::json(['success' => false, 'message' => 'Không tìm thấy đánh giá.'], 404);
            }

            Response::json(['success' => true, 'data' => $review], 200);
        } catch (Exception $e) {
            $code = $e->getCode();
            if ($code < 400 || $code > 499) {
                $code = 500;
            }
            Response::json(['success' => false, 'message' => $e->getMessage()], $code);
        }
    }

    public function adminUpdateStatus() {
        try {
            AuthMiddleware::requireAdmin();
            $id = (int)Request::query('id', 0);
            $payload = Request::json();
            $status = trim((string)($payload['status'] ?? ''));
            $review = (new ProductReview())->adminUpdateStatus((int)$id, $status);

            Response::json([
                'success' => true,
                'message' => 'Đã cập nhật trạng thái đánh giá.',
                'data' => $review,
            ], 200);
        } catch (Exception $e) {
            $code = $e->getCode();
            if ($code < 400 || $code > 499) {
                $code = 500;
            }
            Response::json(['success' => false, 'message' => $e->getMessage()], $code);
        }
    }

    public function adminDelete() {
        try {
            AuthMiddleware::requireAdmin();
            $id = (int)Request::query('id', 0);
            (new ProductReview())->adminDelete((int)$id);
            Response::json([
                'success' => true,
                'message' => 'Đã xóa đánh giá.',
            ], 200);
        } catch (Exception $e) {
            $code = $e->getCode();
            if ($code < 400 || $code > 499) {
                $code = 500;
            }
            Response::json(['success' => false, 'message' => $e->getMessage()], $code);
        }
    }

    public function list() {
        try {
            $productId = (int)Request::query('productId', 0);
            if ($productId <= 0) {
                Response::json(['success' => false, 'message' => 'Missing product id.'], 400);
            }

            $model = new ProductReview();
            $data = $model->listForProduct($productId, [
                'page' => Request::query('page', 1),
                'limit' => Request::query('limit', 10),
                'rating' => Request::query('rating'),
                'hasImages' => Request::query('hasImages'),
                'verifiedOnly' => Request::query('verifiedOnly'),
            ]);

            Response::json(['success' => true, 'data' => $data], 200);
        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => 'Product review list error: ' . $e->getMessage()], 500);
        }
    }

    public function eligibility() {
        try {
            $productId = (int)Request::query('productId', 0);
            if ($productId <= 0) {
                Response::json(['success' => false, 'message' => 'Missing product id.'], 400);
            }

            $customer = AuthMiddleware::getCustomerOptional();
            if (!$customer) {
                Response::json([
                    'success' => true,
                    'data' => [
                        'eligible' => false,
                        'requiresLogin' => true,
                        'reason' => 'Vui lòng đăng nhập để đánh giá sản phẩm.',
                    ],
                ], 200);
            }

            $data = (new ProductReview())->getEligibility($productId, (int)$customer['id']);
            $data['requiresLogin'] = false;
            Response::json(['success' => true, 'data' => $data], 200);
        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => 'Review eligibility error: ' . $e->getMessage()], 500);
        }
    }

    public function create() {
        try {
            $productId = (int)Request::query('productId', 0);
            if ($productId <= 0) {
                Response::json(['success' => false, 'message' => 'Missing product id.'], 400);
            }

            $customer = AuthMiddleware::requireCustomer();
            $payload = Request::json();
            $review = (new ProductReview())->create($productId, (int)$customer['id'], $payload);

            try {
                (new \App\Models\AdminNotification())->createNotification(
                    "Đánh giá sản phẩm mới",
                    "Khách hàng " . ($customer['full_name'] ?? $customer['name'] ?? 'Khách') . " vừa đánh giá " . ($payload['rating'] ?? 5) . " sao cho sản phẩm.",
                    "review_created",
                    "review",
                    $review['id']
                );
            } catch (\Throwable $notiEx) {
                error_log("Failed to create admin notification for product review: " . $notiEx->getMessage());
            }

            Response::json([
                'success' => true,
                'message' => 'Đánh giá của bạn đã được ghi nhận.',
                'data' => $review,
            ], 201);
        } catch (Exception $e) {
            $code = $e->getCode();
            if ($code < 400 || $code > 499) {
                $code = 500;
            }
            Response::json(['success' => false, 'message' => $e->getMessage()], $code);
        }
    }
}
