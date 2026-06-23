<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\AuthMiddleware;
use App\Core\Database;
use PDO;

class CustomerPetController {
    private function ensureDeletedAtColumn($db) {
        static $checked = false;
        if ($checked) return;
        $checked = true;

        try {
            $stmt = $db->query("SHOW COLUMNS FROM customer_pets LIKE 'deleted_at'");
            if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
                $db->exec("ALTER TABLE customer_pets ADD COLUMN deleted_at DATETIME NULL");
            }
        } catch (\Throwable $e) {
            error_log("Unable to ensure customer_pets.deleted_at column: " . $e->getMessage());
        }
    }

    /**
     * GET /api/customer/pets
     */
    public function list() {
        $customer = AuthMiddleware::requireCustomer();
        $db = Database::getInstance()->getConnection();
        $this->ensureDeletedAtColumn($db);

        $stmt = $db->prepare("SELECT * FROM customer_pets WHERE customer_id = ? AND deleted_at IS NULL ORDER BY id DESC");
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
                'avatarUrl' => $row['avatar_url'] ?? null,
                'aiResult' => $row['ai_result'] ?? null,
                'createdAt' => $row['created_at'] ?? null
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
        $aiResult = trim(Request::input('aiResult', ''));

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
                weight_kg, health_notes, allergies, favorite_food, avatar_url, ai_result, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, NOW(), NOW()
            )
        ");
        $stmt->execute([
            $customer['id'], $name, $species, !empty($breed) ? $breed : null,
            $gender, !empty($birthday) ? $birthday : null,
            $weightKg !== null ? (float)$weightKg : null,
            !empty($healthNotes) ? $healthNotes : null,
            !empty($allergies) ? $allergies : null,
            !empty($favoriteFood) ? $favoriteFood : null,
            !empty($avatarUrl) ? $avatarUrl : null,
            !empty($aiResult) ? $aiResult : null
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
        $aiResult = trim(Request::input('aiResult', ''));

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
                weight_kg = ?, health_notes = ?, allergies = ?, favorite_food = ?, avatar_url = ?, ai_result = ?, updated_at = NOW()
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
            !empty($aiResult) ? $aiResult : null,
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
        $this->ensureDeletedAtColumn($db);

        // Check ownership
        $stmtCheck = $db->prepare("SELECT id, ai_result FROM customer_pets WHERE id = ? AND customer_id = ?");
        $stmtCheck->execute([$id, $customer['id']]);
        $pet = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        if (!$pet) {
            Response::json(['success' => false, 'message' => 'Không tìm thấy hồ sơ thú cưng hoặc bạn không có quyền.'], 404);
        }

        if (!empty($pet['ai_result'])) {
            $stmtDelete = $db->prepare("UPDATE customer_pets SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND customer_id = ?");
            $stmtDelete->execute([$id, $customer['id']]);
        } else {
            $stmtDelete = $db->prepare("DELETE FROM customer_pets WHERE id = ? AND customer_id = ?");
            $stmtDelete->execute([$id, $customer['id']]);
        }

        Response::json(['success' => true, 'message' => 'Xóa hồ sơ thú cưng thành công!']);
    }

    /**
     * POST /api/customer/pet-advisor/consult
     */
    public function consult() {
        $input = Request::json();
        $answers = $input['answers'] ?? [];
        $petType = $input['petType'] ?? 'dog';
        $activeFlow = $input['activeFlow'] ?? null;
        $customerInfo = $input['customer'] ?? [];

        // Fetch active AI Advisor voucher
        $aiVoucherCode = '3F30K';
        $aiVoucherValue = '30.000đ';
        try {
            $db = Database::getInstance()->getConnection();
            $now = date('Y-m-d H:i:s');
            $stmtVoucher = $db->prepare("
                SELECT code, discount_type, discount_value, max_discount_amount 
                FROM coupons
                WHERE is_active = 1
                  AND show_in_ai_advisor = 1
                  AND (starts_at IS NULL OR starts_at <= :starts_now)
                  AND (ends_at IS NULL OR ends_at >= :ends_now)
                  AND (usage_limit IS NULL OR used_count < usage_limit)
                ORDER BY sort_order ASC, id DESC
                LIMIT 1
            ");
            $stmtVoucher->execute([
                ':starts_now' => $now,
                ':ends_now' => $now,
            ]);
            $voucherRow = $stmtVoucher->fetch(PDO::FETCH_ASSOC);
            if ($voucherRow) {
                $aiVoucherCode = $voucherRow['code'];
                $val = (float)$voucherRow['discount_value'];
                if ($voucherRow['discount_type'] === 'percent') {
                    $aiVoucherValue = 'Giảm ' . $val . '%' . (!empty($voucherRow['max_discount_amount']) ? ' (Tối đa ' . number_format((float)$voucherRow['max_discount_amount'], 0, ',', '.') . 'đ)' : '');
                } else if ($voucherRow['discount_type'] === 'free_shipping') {
                    $aiVoucherValue = 'Freeship ' . number_format($val, 0, ',', '.') . 'đ';
                } else if ($voucherRow['discount_type'] === 'gift') {
                    $aiVoucherValue = 'Quà tặng';
                } else {
                    $aiVoucherValue = 'Giảm ' . number_format($val, 0, ',', '.') . 'đ';
                }
            }
        } catch (\Exception $e) {
            // keep default
        }

        // Fetch products from database
        $availableProducts = [];
        try {
            $productService = new \App\Services\ProductCatalogService();
            if ($activeFlow === 'cat' || $petType === 'cat') {
                $res = $productService->listProducts(['petType' => 'cat', 'limit' => 30, 'sort' => 'popular']);
                $availableProducts = $res['items'] ?? [];
            } else if ($activeFlow === 'dog' || $petType === 'dog') {
                $res = $productService->listProducts(['petType' => 'dog', 'limit' => 30, 'sort' => 'popular']);
                $availableProducts = $res['items'] ?? [];
            } else {
                $resCat = $productService->listProducts(['petType' => 'cat', 'limit' => 15, 'sort' => 'popular']);
                $resDog = $productService->listProducts(['petType' => 'dog', 'limit' => 15, 'sort' => 'popular']);
                $availableProducts = array_merge($resCat['items'] ?? [], $resDog['items'] ?? []);
            }
        } catch (\Exception $e) {
            // keep empty
        }

        // Map catalog
        $catalog = array_map(function($p) {
            return [
                'id' => (string)$p['id'],
                'name' => $p['name'],
                'category' => $p['categoryName'] ?? '',
                'price' => $p['price']
            ];
        }, $availableProducts);

        $getAnswerValue = function($stepId) use ($answers) {
            $ans = $answers[$stepId] ?? null;
            if (!$ans) return "";
            $val = $ans['value'] ?? "";
            if (is_array($val)) {
                $mapped = array_map(function($v) use ($ans) {
                    return $v === 'other' ? ($ans['customText'] ?? 'Khác') : $v;
                }, $val);
                return implode(', ', $mapped);
            }
            return $val === 'other' ? ($ans['customText'] ?? 'Khác') : $val;
        };

        $problemText = $answers['problem_text']['value'] ?? "";
        $detectedNeeds = $this->detectNeeds($problemText);
        $hasSeriousWarning = $this->detectSeriousWarning($problemText);

        $purchaseVal = $answers['purchase_amount_range']['value'] ?? "";
        $durationVal = $answers['usage_duration_range']['value'] ?? "";

        $estimatedPurchaseAmount = 0;
        if ($purchaseVal === "under_200k") $estimatedPurchaseAmount = 150000;
        else if ($purchaseVal === "200k_500k") $estimatedPurchaseAmount = 350000;
        else if ($purchaseVal === "500k_1m") $estimatedPurchaseAmount = 750000;
        else if ($purchaseVal === "1m_2m") $estimatedPurchaseAmount = 1500000;
        else if ($purchaseVal === "over_2m") $estimatedPurchaseAmount = 2500000;

        $usageDurationMonths = 1.0;
        if ($durationVal === "under_1m") $usageDurationMonths = 0.5;
        else if ($durationVal === "1m") $usageDurationMonths = 1.0;
        else if ($durationVal === "2m") $usageDurationMonths = 2.0;
        else if ($durationVal === "3_4m") $usageDurationMonths = 3.5;
        else if ($durationVal === "over_4m") $usageDurationMonths = 4.5;

        $monthlyBudget = $usageDurationMonths > 0 ? (int)round($estimatedPurchaseAmount / $usageDurationMonths) : 0;
        
        $budgetSegment = "Phổ thông";
        if ($monthlyBudget < 150000) $budgetSegment = "Tiết kiệm";
        else if ($monthlyBudget < 300000) $budgetSegment = "Phổ thông";
        else if ($monthlyBudget < 600000) $budgetSegment = "Cân bằng";
        else if ($monthlyBudget < 1000000) $budgetSegment = "Tốt";
        else $budgetSegment = "Cao cấp";

        $payload = [
            'customer' => [
                'name' => $customerInfo['name'] ?? '',
                'phone' => $customerInfo['phone'] ?? '',
                'email' => $customerInfo['email'] ?? '',
                'pet_name' => $customerInfo['petName'] ?? ''
            ],
            'pet_profile' => [
                'pet_type' => $petType,
                'active_flow' => $activeFlow ?: $petType,
                'age_group' => $getAnswerValue('age_group'),
                'breed' => $getAnswerValue('breed'),
                'breed_other_text' => $answers['breed']['customText'] ?? '',
                'weight_range' => $getAnswerValue('weight_range'),
                'coat_type' => $getAnswerValue('coat_type'),
                'pet_count' => $getAnswerValue('pet_count'),
                'neutered_status' => $getAnswerValue('neutered_status'),
                'current_food' => $getAnswerValue('current_food'),
                'problem_text' => $problemText,
                'detected_needs' => $detectedNeeds,
                'selected_needs' => $getAnswerValue('need') ? explode(', ', $getAnswerValue('need')) : [],
                'purchase_amount_range' => $purchaseVal,
                'estimated_purchase_amount' => $estimatedPurchaseAmount,
                'usage_duration_range' => $durationVal,
                'usage_duration_months' => $usageDurationMonths,
                'monthly_budget' => $monthlyBudget,
                'budget_segment' => $budgetSegment,
                'has_serious_warning' => $hasSeriousWarning,
                'budget' => $purchaseVal
            ],
            'store_context' => [
                'brand' => '3F Store',
                'voucher_value' => $aiVoucherValue,
                'voucher_code' => $aiVoucherCode,
                'product_catalog' => $catalog
            ]
        ];

        $groqApiKey = trim((string)(getenv('GROQ_API_KEY') ?: getenv('VITE_GROQ_API_KEY') ?: ''));
        $groqModel = trim((string)(getenv('GROQ_MODEL') ?: getenv('VITE_GROQ_MODEL') ?: 'llama-3.3-70b-versatile'));

        if (empty($groqApiKey)) {
            Response::json([
                'success' => false,
                'message' => 'Chưa cấu hình Groq API Key ở server.'
            ], 500);
        }

        $systemPrompt = "Bạn là chuyên gia tư vấn thú cưng của 3F Store.
Bạn trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp, ngắn gọn. Gọi thú cưng là \"bé\".

Nhiệm vụ chính:
- Dựa trên pet_profile và product_catalog để chọn đúng sản phẩm thật từ catalog.
- Không được bịa sản phẩm ngoài catalog. Bắt buộc chọn sản phẩm có thật dựa trên trường 'id' của chúng trong catalog.
- Bắt buộc phải chọn đúng 9 sản phẩm phù hợp nhất (3 sản phẩm cho mỗi nhóm: saving, balanced, premium). Không được chọn ít hơn hoặc nhiều hơn.

Luật mới về ngân sách:
- Không được hiểu purchase_amount_range là ngân sách hàng tháng.
- purchase_amount_range chỉ là số tiền khách thường mua mỗi lần.
- Phải dùng monthly_budget và budget_segment để hiểu ngân sách thực tế mỗi tháng.
- Khi tư vấn, hãy giải thích ngắn gọn rằng chuyên gia đã tính ngân sách thực tế dựa trên số tiền mua mỗi lần và thời gian sử dụng.

Luật mới về nhu cầu:
- problem_text là mô tả tự do của khách về tình trạng của bé.
- detected_needs là nhóm nhu cầu đã được hệ thống nhận diện.
- selected_needs là nhóm khách chọn thêm.
- Hãy ưu tiên các nhu cầu xuất hiện trong detected_needs and selected_needs.

Cách chia sản phẩm:
- recommended_products phải chia theo 3 nhóm:
  1. saving: Gói tiết kiệm (chọn đúng 3 sản phẩm phù hợp ngân sách tiết kiệm nhất)
  2. balanced: Gói cân bằng (được ưu tiên nhất, gắn nhãn \"3F đề xuất\", chọn đúng 3 sản phẩm phù hợp ngân sách phổ thông/cân bằng)
  3. premium: Gói tốt hơn cho bé (chọn đúng 3 sản phẩm cao cấp/chất lượng vượt trội nhất)
- Tổng cộng recommended_products phải là đúng 9 sản phẩm (không thừa không thiếu).

An sau:
- Không chẩn đoán bệnh, không kê đơn thuốc.
- Nếu has_serious_warning = true hoặc problem_text có dấu hiệu nặng như bỏ ăn nhiều ngày, nôn liên tục, tiêu chảy kéo dài, tiểu ra máu, khó thở, co giật, hãy thêm warning khuyên khách đưa bé đến bác sĩ thú y gấp.

CTA:
- Kết thúc bằng lời kêu gọi dùng voucher " . $aiVoucherValue . ", mã " . $aiVoucherCode . ".

Trả về duy nhất định dạng JSON sau:
{
  \"summary\": \"Tóm tắt ngắn gọn\",
  \"advice\": \"Lời khuyên dinh dưỡng chính\",
  \"detected_needs\": [\"Nhu cầu 1\", \"Nhu cầu 2\"],
  \"budget_analysis\": {
    \"purchase_amount_label\": \"Nhãn purchase_amount_range\",
    \"usage_duration_label\": \"Nhãn usage_duration_range\",
    \"monthly_budget\": 123000,
    \"budget_segment\": \"Nhãn phân khúc ngân sách\",
    \"explanation\": \"Lời giải thích cách tính ngân sách tháng từ mua mỗi lần\"
  },
  \"recommended_products\": [
    {
      \"id\": \"ID sản phẩm trong catalog\",
      \"group\": \"saving | balanced | premium\",
      \"reason\": \"Lý do lựa chọn sản phẩm\",
      \"matched_need\": [\"Nhu cầu phù hợp\"],
      \"budget_fit\": \"Badge phù hợp ngân sách\"
    }
  ],
  \"care_tips\": [
    \"Mẹo 1\",
    \"Mẹo 2\"
  ],
  \"warning\": \"Cảnh báo khẩn cấp nếu có, nếu không để rỗng\",
  \"cta\": \"Lời kêu gọi hành động\",
  \"voucher_code\": \"" . $aiVoucherCode . "\"
}";

        $userPrompt = "Dưới đây là thông tin chi tiết về khách hàng và bé cưng:\n" . json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        $postData = [
            'model' => $groqModel,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt]
            ],
            'temperature' => 0.3,
            'response_format' => ['type' => 'json_object']
        ];

        $ch = curl_init("https://api.groq.com/openai/v1/chat/completions");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $groqApiKey
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($response === false || $httpCode !== 200) {
            Response::json([
                'success' => false,
                'message' => 'Lỗi kết nối Groq API từ backend (HTTP ' . $httpCode . '): ' . $error,
                'details' => $response
            ], 500);
        }

        $responseData = json_decode($response, true);
        $assistantContent = $responseData['choices'][0]['message']['content'] ?? '';
        
        if (empty($assistantContent)) {
            Response::json([
                'success' => false,
                'message' => 'Groq API trả về kết quả rỗng.'
            ], 500);
        }

        $parsedJson = json_decode($assistantContent, true);
        if (!$parsedJson) {
            Response::json([
                'success' => false,
                'message' => 'Không thể phân tích định dạng JSON từ Groq.'
            ], 500);
        }

        // Map names and products detail dynamically to return full details to client
        $recs = $parsedJson['recommended_products'] ?? [];
        $mappedRecs = [];
        foreach ($recs as $rec) {
            $recId = $rec['id'] ?? '';
            $matched = null;
            foreach ($availableProducts as $prod) {
                if (strval($prod['id']) === strval($recId)) {
                    $matched = $prod;
                    break;
                }
            }
            $mappedRecs[] = [
                'id' => $matched ? ($matched['slug'] ?? $matched['sourceProductId'] ?? (string)$matched['id']) : $recId,
                'group' => $rec['group'] ?? 'balanced',
                'reason' => $rec['reason'] ?? '',
                'matched_need' => $rec['matched_need'] ?? [],
                'budget_fit' => $rec['budget_fit'] ?? '',
                'name' => $matched ? $matched['name'] : "Sản phẩm đề xuất #{$recId}",
                'product' => $matched
            ];
        }

        $finalResult = [
            'summary' => $parsedJson['summary'] ?? 'Đã ghi nhận hồ sơ bé cưng.',
            'advice' => $parsedJson['advice'] ?? '3F gợi ý chế độ ăn cân bằng dinh dưỡng.',
            'detected_needs' => is_array($parsedJson['detected_needs'] ?? null) ? $parsedJson['detected_needs'] : $detectedNeeds,
            'budget_analysis' => $parsedJson['budget_analysis'] ?? [
                'purchase_amount_label' => $purchaseVal,
                'usage_duration_label' => $durationVal,
                'monthly_budget' => $monthlyBudget,
                'budget_segment' => $budgetSegment,
                'explanation' => "Ước tính ngân sách hàng tháng khoảng " . number_format($monthlyBudget, 0, ',', '.') . "đ."
            ],
            'recommended_products' => $mappedRecs,
            'care_tips' => is_array($parsedJson['care_tips'] ?? null) ? $parsedJson['care_tips'] : [],
            'warning' => $parsedJson['warning'] ?? '',
            'voucher_code' => $aiVoucherCode
        ];

        Response::json([
            'success' => true,
            'data' => $finalResult
        ], 200);
    }

    private function detectNeeds($problemText) {
        $text = mb_strtolower($problemText ?? "");
        $needs = [];

        $keywords = [
            'Kén ăn' => ['ăn ít', 'bỏ ăn', 'kén ăn', 'không chịu ăn', 'chán ăn'],
            'Tiêu hóa' => ['ói', 'nôn', 'tiêu chảy', 'phân mềm', 'đi ngoài'],
            'Da lông' => ['rụng lông', 'lông xấu', 'ngứa', 'da khô'],
            'Tiết niệu' => ['tiểu ít', 'tiểu khó', 'sỏi', 'viêm đường tiểu', 'đường tiểu'],
            'Tăng cân' => ['gầy', 'tăng cân', 'tăng ký', 'mập lên'],
            'Kiểm soát cân nặng' => ['béo', 'thừa cân', 'giảm cân'],
            'Hairball' => ['búi lông', 'hairball', 'nôn lông'],
            'Răng miệng' => ['hôi miệng', 'răng', 'nướu']
        ];

        foreach ($keywords as $need => $terms) {
            foreach ($terms as $term) {
                if (mb_strpos($text, $term) !== false) {
                    $needs[] = $need;
                    break;
                }
            }
        }

        return !empty($needs) ? array_values(array_unique($needs)) : ['Khác'];
    }

    private function detectSeriousWarning($problemText) {
        $text = mb_strtolower($problemText ?? "");
        $terms = [
            'bỏ ăn nhiều ngày', 'nôn liên tục', 'ói liên tục',
            'tiêu chảy kéo dài', 'tiểu ra máu', 'khó thở',
            'co giật', 'mệt lả'
        ];
        foreach ($terms as $term) {
            if (mb_strpos($text, $term) !== false) {
                return true;
            }
        }
        return false;
    }

    /**
     * GET /api/admin/pet-advisor/consultations
     */
    public function adminConsultations() {
        try {
            AuthMiddleware::requireAdmin();
            $db = Database::getInstance()->getConnection();
            $this->ensureDeletedAtColumn($db);

            $page = max(1, (int)Request::query('page', 1));
            $limit = max(1, min(100, (int)Request::query('limit', 20)));
            $offset = ($page - 1) * $limit;

            $species = Request::query('species', 'all');
            $q = trim((string)Request::query('q', ''));

            $where = ["p.ai_result IS NOT NULL AND p.ai_result <> ''"];
            $params = [];

            if ($species !== 'all') {
                $where[] = "p.species = :species";
                $params[':species'] = $species;
            }

            if ($q !== '') {
                $where[] = "(p.name LIKE :q OR c.full_name LIKE :q OR c.name LIKE :q OR c.phone LIKE :q OR c.email LIKE :q)";
                $params[':q'] = "%{$q}%";
            }

            $whereSql = implode(' AND ', $where);

            // Total Count
            $countStmt = $db->prepare("
                SELECT COUNT(*) 
                FROM customer_pets p
                LEFT JOIN customers c ON c.id = p.customer_id
                WHERE {$whereSql}
            ");
            $countStmt->execute($params);
            $total = (int)$countStmt->fetchColumn();

            // Unique Customers Count
            $custStmt = $db->prepare("
                SELECT COUNT(DISTINCT p.customer_id) 
                FROM customer_pets p
                LEFT JOIN customers c ON c.id = p.customer_id
                WHERE {$whereSql}
            ");
            $custStmt->execute($params);
            $customers = (int)$custStmt->fetchColumn();

            // List Records
            $stmt = $db->prepare("
                SELECT 
                    p.*,
                    c.full_name AS customer_full_name,
                    c.name AS customer_name,
                    c.phone AS customer_phone,
                    c.email AS customer_email,
                    c.status AS customer_status
                FROM customer_pets p
                LEFT JOIN customers c ON c.id = p.customer_id
                WHERE {$whereSql}
                ORDER BY p.created_at DESC, p.id DESC
                LIMIT :limit OFFSET :offset
            ");
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Calculate Stats
            // 1. Species Count (Cats / Dogs)
            $catStmt = $db->query("SELECT COUNT(*) FROM customer_pets WHERE ai_result IS NOT NULL AND ai_result <> '' AND species = 'cat'");
            $catCount = (int)$catStmt->fetchColumn();

            $dogStmt = $db->query("SELECT COUNT(*) FROM customer_pets WHERE ai_result IS NOT NULL AND ai_result <> '' AND species = 'dog'");
            $dogCount = (int)$dogStmt->fetchColumn();

            // 2. Average Monthly Budget & Warning Count
            $allConsultsStmt = $db->query("SELECT ai_result FROM customer_pets WHERE ai_result IS NOT NULL AND ai_result <> ''");
            $allConsults = $allConsultsStmt->fetchAll(PDO::FETCH_ASSOC);

            $warningCount = 0;
            $totalBudget = 0;
            $budgetCount = 0;

            foreach ($allConsults as $cRow) {
                $parsed = json_decode($cRow['ai_result'] ?? '', true);
                if ($parsed) {
                    if (!empty($parsed['warning'])) {
                        $warningCount++;
                    }
                    $budget = $parsed['budget_analysis']['monthly_budget'] ?? null;
                    if ($budget !== null) {
                        $totalBudget += (float)$budget;
                        $budgetCount++;
                    }
                }
            }

            $averageMonthlyBudget = $budgetCount > 0 ? (int)round($totalBudget / $budgetCount) : 0;

            $stats = [
                'species' => [
                    'cat' => $catCount,
                    'dog' => $dogCount,
                ],
                'warningCount' => $warningCount,
                'averageMonthlyBudget' => $averageMonthlyBudget,
            ];

            Response::json([
                'success' => true,
                'data' => [
                    'items' => $rows,
                    'total' => $total,
                    'customers' => $customers,
                    'stats' => $stats,
                    'totalPages' => max(1, (int)ceil($total / $limit)),
                ]
            ], 200);

        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/admin/pet-advisor/consultations/detail
     */
    public function adminConsultationDetail() {
        try {
            AuthMiddleware::requireAdmin();
            $id = (int)Request::query('id', 0);
            if ($id <= 0) {
                Response::json(['success' => false, 'message' => 'Thiếu ID lượt tư vấn.'], 400);
            }

            $db = Database::getInstance()->getConnection();
            $this->ensureDeletedAtColumn($db);

            $stmt = $db->prepare("
                SELECT 
                    p.*,
                    c.full_name AS customer_full_name,
                    c.name AS customer_name,
                    c.phone AS customer_phone,
                    c.email AS customer_email,
                    c.status AS customer_status
                FROM customer_pets p
                LEFT JOIN customers c ON c.id = p.customer_id
                WHERE p.id = ? AND p.ai_result IS NOT NULL AND p.ai_result <> ''
                LIMIT 1
            ");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                Response::json(['success' => false, 'message' => 'Không tìm thấy lượt tư vấn.'], 404);
            }

            Response::json([
                'success' => true,
                'data' => $row
            ], 200);

        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
