<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\AuthMiddleware;
use App\Core\Database;
use PDO;

class CustomerAddressController {

    /**
     * GET /api/customer/addresses
     */
    public function list() {
        $customer = AuthMiddleware::requireCustomer();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, id DESC");
        $stmt->execute([$customer['id']]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $mapped = array_map(function($row) {
            return [
                'id' => (int)$row['id'],
                'receiverName' => $row['receiver_name'],
                'receiverPhone' => $row['receiver_phone'] ?: $row['phone'],
                'provinceCode' => $row['province_code'] ?? '',
                'provinceName' => $row['province_name'] ?: $row['province'],
                'wardCode' => $row['ward_code'] ?? '',
                'wardName' => $row['ward_name'] ?: $row['ward'],
                'addressLine' => $row['address_line'],
                'note' => $row['note'] ?? '',
                'type' => $row['type'] ?? 'home',
                'isDefault' => (bool)$row['is_default']
            ];
        }, $rows);

        Response::json(['success' => true, 'data' => $mapped]);
    }

    /**
     * POST /api/customer/addresses
     */
    public function create() {
        $customer = AuthMiddleware::requireCustomer();
        $receiverName = trim(Request::input('receiverName', ''));
        $receiverPhone = trim(Request::input('receiverPhone', ''));
        $provinceCode = trim(Request::input('provinceCode', ''));
        $provinceName = trim(Request::input('provinceName', ''));
        $wardCode = trim(Request::input('wardCode', ''));
        $wardName = trim(Request::input('wardName', ''));
        $addressLine = trim(Request::input('addressLine', ''));
        $note = trim(Request::input('note', ''));
        $type = trim(Request::input('type', 'home'));
        $isDefault = (int)Request::input('isDefault', 0);

        if (empty($receiverName) || empty($receiverPhone) || empty($provinceName) || empty($wardName) || empty($addressLine)) {
            Response::json(['success' => false, 'message' => 'Vui lòng nhập đầy đủ thông tin bắt buộc.'], 400);
        }

        $db = Database::getInstance()->getConnection();

        // Check if first address
        $stmtCount = $db->prepare("SELECT COUNT(*) FROM customer_addresses WHERE customer_id = ?");
        $stmtCount->execute([$customer['id']]);
        $count = (int)$stmtCount->fetchColumn();
        if ($count === 0) {
            $isDefault = 1;
        }

        if ($isDefault === 1) {
            $stmtReset = $db->prepare("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?");
            $stmtReset->execute([$customer['id']]);
        }

        $stmtInsert = $db->prepare("
            INSERT INTO customer_addresses (
                customer_id, receiver_name, phone, receiver_phone, 
                province, district, ward, province_code, province_name, 
                ward_code, ward_name, address_line, note, type, is_default, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?,
                ?, '', ?, ?, ?,
                ?, ?, ?, ?, ?, ?, NOW(), NOW()
            )
        ");
        $stmtInsert->execute([
            $customer['id'], $receiverName, $receiverPhone, $receiverPhone,
            $provinceName, $wardName, $provinceCode, $provinceName,
            $wardCode, $wardName, $addressLine, $note, $type, $isDefault
        ]);

        Response::json(['success' => true, 'message' => 'Thêm địa chỉ mới thành công!', 'id' => (int)$db->lastInsertId()]);
    }

    /**
     * PATCH /api/customer/addresses/:id
     */
    public function update() {
        $customer = AuthMiddleware::requireCustomer();
        $id = (int)Request::query('id');

        $receiverName = trim(Request::input('receiverName', ''));
        $receiverPhone = trim(Request::input('receiverPhone', ''));
        $provinceCode = trim(Request::input('provinceCode', ''));
        $provinceName = trim(Request::input('provinceName', ''));
        $wardCode = trim(Request::input('wardCode', ''));
        $wardName = trim(Request::input('wardName', ''));
        $addressLine = trim(Request::input('addressLine', ''));
        $note = trim(Request::input('note', ''));
        $type = trim(Request::input('type', 'home'));
        $isDefault = (int)Request::input('isDefault', 0);

        if (empty($receiverName) || empty($receiverPhone) || empty($provinceName) || empty($wardName) || empty($addressLine)) {
            Response::json(['success' => false, 'message' => 'Vui lòng nhập đầy đủ thông tin bắt buộc.'], 400);
        }

        $db = Database::getInstance()->getConnection();

        // Check ownership
        $stmtCheck = $db->prepare("SELECT id, is_default FROM customer_addresses WHERE id = ? AND customer_id = ?");
        $stmtCheck->execute([$id, $customer['id']]);
        $existing = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        if (!$existing) {
            Response::json(['success' => false, 'message' => 'Không tìm thấy địa chỉ hoặc bạn không có quyền.'], 404);
        }

        if ($isDefault === 1) {
            $stmtReset = $db->prepare("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?");
            $stmtReset->execute([$customer['id']]);
        }

        $stmtUpdate = $db->prepare("
            UPDATE customer_addresses SET 
                receiver_name = ?, phone = ?, receiver_phone = ?,
                province = ?, ward = ?, province_code = ?, province_name = ?,
                ward_code = ?, ward_name = ?, address_line = ?, note = ?, type = ?, is_default = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmtUpdate->execute([
            $receiverName, $receiverPhone, $receiverPhone,
            $provinceName, $wardName, $provinceCode, $provinceName,
            $wardCode, $wardName, $addressLine, $note, $type, $isDefault,
            $id
        ]);

        Response::json(['success' => true, 'message' => 'Cập nhật địa chỉ thành công!']);
    }

    /**
     * DELETE /api/customer/addresses/:id
     */
    public function delete() {
        $customer = AuthMiddleware::requireCustomer();
        $id = (int)Request::query('id');

        $db = Database::getInstance()->getConnection();

        // Check ownership
        $stmtCheck = $db->prepare("SELECT id, is_default FROM customer_addresses WHERE id = ? AND customer_id = ?");
        $stmtCheck->execute([$id, $customer['id']]);
        $existing = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        if (!$existing) {
            Response::json(['success' => false, 'message' => 'Không tìm thấy địa chỉ hoặc bạn không có quyền.'], 404);
        }

        $db->beginTransaction();
        try {
            $stmtDelete = $db->prepare("DELETE FROM customer_addresses WHERE id = ?");
            $stmtDelete->execute([$id]);

            // If deleted was default, make another one default
            if ((int)$existing['is_default'] === 1) {
                $stmtNext = $db->prepare("SELECT id FROM customer_addresses WHERE customer_id = ? ORDER BY id DESC LIMIT 1");
                $stmtNext->execute([$customer['id']]);
                $nextId = $stmtNext->fetchColumn();
                if ($nextId) {
                    $stmtSet = $db->prepare("UPDATE customer_addresses SET is_default = 1 WHERE id = ?");
                    $stmtSet->execute([$nextId]);
                }
            }
            $db->commit();
            Response::json(['success' => true, 'message' => 'Xóa địa chỉ thành công!']);
        } catch (\Exception $e) {
            $db->rollBack();
            Response::json(['success' => false, 'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/customer/addresses/:id/default
     */
    public function setDefault() {
        $customer = AuthMiddleware::requireCustomer();
        $id = (int)Request::query('id');

        $db = Database::getInstance()->getConnection();

        // Check ownership
        $stmtCheck = $db->prepare("SELECT id FROM customer_addresses WHERE id = ? AND customer_id = ?");
        $stmtCheck->execute([$id, $customer['id']]);
        if (!$stmtCheck->fetch()) {
            Response::json(['success' => false, 'message' => 'Không tìm thấy địa chỉ hoặc bạn không có quyền.'], 404);
        }

        $db->beginTransaction();
        try {
            $stmtReset = $db->prepare("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?");
            $stmtReset->execute([$customer['id']]);

            $stmtSet = $db->prepare("UPDATE customer_addresses SET is_default = 1 WHERE id = ?");
            $stmtSet->execute([$id]);

            $db->commit();
            Response::json(['success' => true, 'message' => 'Đặt địa chỉ mặc định thành công!']);
        } catch (\Exception $e) {
            $db->rollBack();
            Response::json(['success' => false, 'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()], 500);
        }
    }
}
