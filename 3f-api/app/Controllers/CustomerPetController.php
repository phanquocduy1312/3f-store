<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\AuthMiddleware;
use App\Core\Database;
use PDO;

class CustomerPetController {

    /**
     * GET /api/customer/pets
     */
    public function list() {
        $customer = AuthMiddleware::requireCustomer();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("SELECT * FROM customer_pets WHERE customer_id = ? ORDER BY id DESC");
        $stmt->execute([$customer['id']]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $mapped = array_map(function($row) {
            return [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'species' => $row['species'],
                'breed' => $row['breed'] ?? '',
                'gender' => $row['gender'] ?? 'unknown',
                'birthday' => $row['birthday'] ?? null,
                'weightKg' => $row['weight_kg'] !== null ? (float)$row['weight_kg'] : null,
                'healthNotes' => $row['health_notes'] ?? '',
                'allergies' => $row['allergies'] ?? '',
                'favoriteFood' => $row['favorite_food'] ?? '',
                'avatarUrl' => $row['avatar_url'] ?? null
            ];
        }, $rows);

        Response::json(['success' => true, 'data' => $mapped]);
    }

    /**
     * POST /api/customer/pets
     */
    public function create() {
        $customer = AuthMiddleware::requireCustomer();
        $name = trim(Request::input('name', ''));
        $species = trim(Request::input('species', ''));
        $breed = trim(Request::input('breed', ''));
        $gender = trim(Request::input('gender', 'unknown'));
        $birthday = trim(Request::input('birthday', ''));
        $weightKg = Request::input('weightKg', null);
        $healthNotes = trim(Request::input('healthNotes', ''));
        $allergies = trim(Request::input('allergies', ''));
        $favoriteFood = trim(Request::input('favoriteFood', ''));
        $avatarUrl = trim(Request::input('avatarUrl', ''));

        if (empty($name)) {
            Response::json(['success' => false, 'message' => 'Tên thú cưng là bắt buộc.'], 400);
        }

        if (!in_array($species, ['cat', 'dog', 'other'])) {
            Response::json(['success' => false, 'message' => 'Loài thú cưng không hợp lệ.'], 400);
        }

        if (!empty($birthday) && strtotime($birthday) > time()) {
            Response::json(['success' => false, 'message' => 'Ngày sinh không thể ở tương lai.'], 400);
        }

        if ($weightKg !== null && (float)$weightKg <= 0) {
            Response::json(['success' => false, 'message' => 'Cân nặng phải lớn hơn 0.'], 400);
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("
            INSERT INTO customer_pets (
                customer_id, name, species, breed, gender, birthday, 
                weight_kg, health_notes, allergies, favorite_food, avatar_url, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, NOW(), NOW()
            )
        ");
        $stmt->execute([
            $customer['id'], $name, $species, !empty($breed) ? $breed : null,
            $gender, !empty($birthday) ? $birthday : null,
            $weightKg !== null ? (float)$weightKg : null,
            !empty($healthNotes) ? $healthNotes : null,
            !empty($allergies) ? $allergies : null,
            !empty($favoriteFood) ? $favoriteFood : null,
            !empty($avatarUrl) ? $avatarUrl : null
        ]);

        Response::json([
            'success' => true,
            'message' => 'Thêm hồ sơ thú cưng thành công!',
            'id' => (int)$db->lastInsertId()
        ]);
    }

    /**
     * PATCH /api/customer/pets/:id
     */
    public function update() {
        $customer = AuthMiddleware::requireCustomer();
        $id = (int)Request::query('id');

        $name = trim(Request::input('name', ''));
        $species = trim(Request::input('species', ''));
        $breed = trim(Request::input('breed', ''));
        $gender = trim(Request::input('gender', 'unknown'));
        $birthday = trim(Request::input('birthday', ''));
        $weightKg = Request::input('weightKg', null);
        $healthNotes = trim(Request::input('healthNotes', ''));
        $allergies = trim(Request::input('allergies', ''));
        $favoriteFood = trim(Request::input('favoriteFood', ''));
        $avatarUrl = trim(Request::input('avatarUrl', ''));

        if (empty($name)) {
            Response::json(['success' => false, 'message' => 'Tên thú cưng là bắt buộc.'], 400);
        }

        if (!in_array($species, ['cat', 'dog', 'other'])) {
            Response::json(['success' => false, 'message' => 'Loài thú cưng không hợp lệ.'], 400);
        }

        $db = Database::getInstance()->getConnection();

        // Check ownership
        $stmtCheck = $db->prepare("SELECT id FROM customer_pets WHERE id = ? AND customer_id = ?");
        $stmtCheck->execute([$id, $customer['id']]);
        if (!$stmtCheck->fetch()) {
            Response::json(['success' => false, 'message' => 'Không tìm thấy hồ sơ thú cưng hoặc bạn không có quyền.'], 404);
        }

        $stmtUpdate = $db->prepare("
            UPDATE customer_pets SET
                name = ?, species = ?, breed = ?, gender = ?, birthday = ?, 
                weight_kg = ?, health_notes = ?, allergies = ?, favorite_food = ?, avatar_url = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmtUpdate->execute([
            $name, $species, !empty($breed) ? $breed : null, $gender,
            !empty($birthday) ? $birthday : null,
            $weightKg !== null ? (float)$weightKg : null,
            !empty($healthNotes) ? $healthNotes : null,
            !empty($allergies) ? $allergies : null,
            !empty($favoriteFood) ? $favoriteFood : null,
            !empty($avatarUrl) ? $avatarUrl : null,
            $id
        ]);

        Response::json(['success' => true, 'message' => 'Cập nhật hồ sơ thú cưng thành công!']);
    }

    /**
     * DELETE /api/customer/pets/:id
     */
    public function delete() {
        $customer = AuthMiddleware::requireCustomer();
        $id = (int)Request::query('id');

        $db = Database::getInstance()->getConnection();

        // Check ownership
        $stmtCheck = $db->prepare("SELECT id FROM customer_pets WHERE id = ? AND customer_id = ?");
        $stmtCheck->execute([$id, $customer['id']]);
        if (!$stmtCheck->fetch()) {
            Response::json(['success' => false, 'message' => 'Không tìm thấy hồ sơ thú cưng hoặc bạn không có quyền.'], 404);
        }

        $stmtDelete = $db->prepare("DELETE FROM customer_pets WHERE id = ?");
        $stmtDelete->execute([$id]);

        Response::json(['success' => true, 'message' => 'Xóa hồ sơ thú cưng thành công!']);
    }
}
