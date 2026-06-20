<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Banner;
use App\Models\AuditLog;
use App\Helpers\AuthMiddleware;
use App\Services\UploadService;
use Exception;

class BannerController {
    
    /**
     * GET /api/banners
     * Public endpoint to fetch active banners.
     */
    public function getActiveBanners() {
        try {
            $placement = Request::query('placement');
            $model = new Banner();
            
            $banners = $model->getActiveBanners($placement);
            
            Response::json([
                'success' => true,
                'data' => $banners
            ], 200);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/banners/:id/click
     * Public endpoint to track clicks.
     */
    public function trackClick() {
        try {
            $id = (int)Request::query('id', 0);
            if ($id <= 0) {
                Response::json(['success' => false, 'message' => 'ID banner không hợp lệ.'], 400);
            }
            
            $model = new Banner();
            $success = $model->incrementClickCount($id);
            
            Response::json([
                'success' => $success,
                'message' => $success ? 'Đã ghi nhận click.' : 'Không thể ghi nhận click.'
            ], 200);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/banners/:id/impression
     * Public endpoint to track views.
     */
    public function trackImpression() {
        try {
            $id = (int)Request::query('id', 0);
            if ($id <= 0) {
                Response::json(['success' => false, 'message' => 'ID banner không hợp lệ.'], 400);
            }
            
            $model = new Banner();
            $success = $model->incrementImpressionCount($id);
            
            Response::json([
                'success' => $success,
                'message' => $success ? 'Đã ghi nhận hiển thị.' : 'Không thể ghi nhận hiển thị.'
            ], 200);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/admin/banners
     */
    public function adminList() {
        try {
            AuthMiddleware::requireAdmin();
            $filters = [
                'placement' => Request::query('placement'),
                'is_active' => Request::query('is_active'),
                'q' => Request::query('q'),
                'page' => Request::query('page'),
                'limit' => Request::query('limit')
            ];
            
            $model = new Banner();
            $result = $model->adminPaginateBanners($filters);
            
            Response::json([
                'success' => true,
                'data' => $result['items'],
                'pagination' => [
                    'total' => $result['total'],
                    'page' => $result['page'],
                    'totalPages' => $result['totalPages']
                ]
            ], 200);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/admin/banners/:id
     */
    public function adminDetail() {
        try {
            AuthMiddleware::requireAdmin();
            $id = (int)Request::query('id', 0);
            if ($id <= 0) {
                Response::json(['success' => false, 'message' => 'ID banner không hợp lệ.'], 400);
            }
            
            $model = new Banner();
            $banner = $model->adminGetBannerDetail($id);
            if (!$banner) {
                Response::json(['success' => false, 'message' => 'Không tìm thấy banner.'], 404);
            }
            
            Response::json([
                'success' => true,
                'data' => $banner
            ], 200);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/admin/banners
     */
    public function adminCreate() {
        try {
            $admin = AuthMiddleware::requireAdmin();
            $payload = Request::json();
            
            $model = new Banner();
            $id = $model->adminCreateBanner($payload, $admin['id']);
            
            // Audit Log
            AuditLog::write($admin['id'], 'create_banner', 'banners', $id, [
                'title' => !empty($payload['title']) ? $payload['title'] : '',
                'placement' => $payload['placement']
            ]);
            
            Response::json([
                'success' => true,
                'message' => 'Tạo banner mới thành công.',
                'id' => $id
            ], 200);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * PUT /api/admin/banners/:id
     */
    public function adminUpdate() {
        try {
            $admin = AuthMiddleware::requireAdmin();
            $id = (int)Request::query('id', 0);
            if ($id <= 0) {
                Response::json(['success' => false, 'message' => 'ID banner không hợp lệ.'], 400);
            }
            
            $payload = Request::json();
            
            $model = new Banner();
            $banner = $model->adminGetBannerDetail($id);
            if (!$banner) {
                Response::json(['success' => false, 'message' => 'Không tìm thấy banner.'], 404);
            }
            
            $success = $model->adminUpdateBanner($id, $payload, $admin['id']);
            
            // Audit Log
            AuditLog::write($admin['id'], 'update_banner', 'banners', $id, [
                'title' => !empty($payload['title']) ? $payload['title'] : '',
                'placement' => $payload['placement']
            ]);
            
            Response::json([
                'success' => $success,
                'message' => $success ? 'Cập nhật banner thành công.' : 'Không thể cập nhật banner hoặc không có thay đổi.'
            ], 200);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * DELETE /api/admin/banners/:id
     */
    public function adminDelete() {
        try {
            $admin = AuthMiddleware::requireAdmin();
            $id = (int)Request::query('id', 0);
            if ($id <= 0) {
                Response::json(['success' => false, 'message' => 'ID banner không hợp lệ.'], 400);
            }
            
            $model = new Banner();
            $banner = $model->adminGetBannerDetail($id);
            if (!$banner) {
                Response::json(['success' => false, 'message' => 'Không tìm thấy banner.'], 404);
            }
            
            $success = $model->adminSoftDeleteBanner($id, $admin['id']);
            
            // Audit Log
            AuditLog::write($admin['id'], 'delete_banner', 'banners', $id, [
                'title' => $banner['title'] ?? '',
                'placement' => $banner['placement']
            ]);
            
            Response::json([
                'success' => $success,
                'message' => $success ? 'Xóa banner thành công.' : 'Không thể xóa banner.'
            ], 200);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/admin/banners/upload-image
     */
    public function adminUploadImage() {
        try {
            $admin = AuthMiddleware::requireAdmin();
            
            if (!isset($_FILES['image'])) {
                Response::json([
                    'success' => false,
                    'message' => 'Vui lòng chọn hình ảnh để tải lên.'
                ], 400);
            }
            
            $upload = UploadService::uploadBannerImage($_FILES['image']);
            
            // Audit Log
            AuditLog::write($admin['id'], 'upload_banner_image', 'banners', null, [
                'filename' => $upload['original_filename'],
                'stored_filename' => $upload['stored_filename']
            ]);
            
            Response::json([
                'success' => true,
                'data' => [
                    'image_url' => $upload['image_url']
                ]
            ], 200);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 400);
        }
    }
}
