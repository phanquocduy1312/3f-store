<?php
namespace App\Controllers;

use App\Core\Response;
use App\Core\Request;
use App\Services\ValidationService;
use App\Services\PointService;
use App\Models\ShopeePointRequest;
use Exception;

class CustomerPointController {
    /**
     * Handles GET /api/customer/points
     */
    public function points() {
        $rawPhone = Request::query('phone', '');
        $phone = ValidationService::normalizePhone($rawPhone);

        if (empty($phone)) {
            Response::json(["success" => false, "message" => "Số điện thoại không được để trống"], 400);
        }

        try {
            $requestModel = new ShopeePointRequest();
            $approvedPoints = $requestModel->sumApprovedPointsByPhone($phone);
            $memberTier = PointService::calculateMemberTier($approvedPoints);

            Response::json([
                "success"         => true,
                "phone"           => $phone,
                "availablePoints" => $approvedPoints,
                "lifetimePoints"  => $approvedPoints,
                "memberTier"      => $memberTier
            ], 200);

        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }
}
