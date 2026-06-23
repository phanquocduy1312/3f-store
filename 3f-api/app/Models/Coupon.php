<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class Coupon {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            $this->ensureSchema();
            self::$migrated = true;
        }
    }

    private function ensureSchema() {
        try {
            if ($this->db->getAttribute(PDO::ATTR_DRIVER_NAME) !== 'mysql') {
                return;
            }

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS coupons (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    code VARCHAR(100) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    description TEXT NULL,
                    discount_type ENUM('fixed','percent','free_shipping','gift') NOT NULL DEFAULT 'fixed',
                    discount_value DECIMAL(12,2) NOT NULL DEFAULT 0,
                    max_discount_amount DECIMAL(12,2) NULL,
                    min_order_amount DECIMAL(12,2) DEFAULT 0.00,
                    usage_limit INT NULL,
                    used_count INT DEFAULT 0,
                    per_customer_limit INT NULL,
                    starts_at DATETIME NULL,
                    ends_at DATETIME NULL,
                    is_active TINYINT(1) DEFAULT 1,
                    show_on_home TINYINT(1) DEFAULT 0,
                    show_in_cart TINYINT(1) DEFAULT 0,
                    show_in_ai_advisor TINYINT(1) DEFAULT 0,
                    display_title VARCHAR(120) NULL,
                    display_label VARCHAR(80) NULL,
                    badge_text VARCHAR(80) NULL,
                    theme_color VARCHAR(40) DEFAULT 'sky',
                    icon_key VARCHAR(40) DEFAULT 'ticket',
                    sort_order INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS coupon_usages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    coupon_id INT NOT NULL,
                    order_id INT NOT NULL,
                    customer_phone VARCHAR(50) NULL,
                    discount_amount DECIMAL(12,2) NOT NULL,
                    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_usages_coupon (coupon_id),
                    INDEX idx_usages_order (order_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS coupon_events (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    coupon_id INT NULL,
                    code VARCHAR(100) NOT NULL,
                    event_type ENUM('view','copy','apply_success','apply_failed','redeem_order') NOT NULL,
                    customer_phone VARCHAR(50) NULL,
                    metadata_json TEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_coupon_events_coupon (coupon_id),
                    INDEX idx_coupon_events_code (code),
                    INDEX idx_coupon_events_type (event_type)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            $this->ensureDiscountTypeEnum();

            $columns = [
                'show_on_home' => "ALTER TABLE coupons ADD COLUMN show_on_home TINYINT(1) DEFAULT 0 AFTER is_active",
                'show_in_cart' => "ALTER TABLE coupons ADD COLUMN show_in_cart TINYINT(1) DEFAULT 0 AFTER show_on_home",
                'show_in_ai_advisor' => "ALTER TABLE coupons ADD COLUMN show_in_ai_advisor TINYINT(1) DEFAULT 0 AFTER show_in_cart",
                'display_title' => "ALTER TABLE coupons ADD COLUMN display_title VARCHAR(120) NULL AFTER show_in_ai_advisor",
                'display_label' => "ALTER TABLE coupons ADD COLUMN display_label VARCHAR(80) NULL AFTER display_title",
                'badge_text' => "ALTER TABLE coupons ADD COLUMN badge_text VARCHAR(80) NULL AFTER display_label",
                'theme_color' => "ALTER TABLE coupons ADD COLUMN theme_color VARCHAR(40) DEFAULT 'sky' AFTER badge_text",
                'icon_key' => "ALTER TABLE coupons ADD COLUMN icon_key VARCHAR(40) DEFAULT 'ticket' AFTER theme_color",
                'sort_order' => "ALTER TABLE coupons ADD COLUMN sort_order INT DEFAULT 0 AFTER icon_key",
            ];

            foreach ($columns as $column => $sql) {
                if ($this->columnExists('coupons', $column)) {
                    continue;
                }

                try {
                    $this->db->exec($sql);
                } catch (\Throwable $e) {
                    if (!$this->columnExists('coupons', $column)) {
                        error_log('Coupon column migration failed for ' . $column . ': ' . $e->getMessage());
                    }
                }
            }

            $this->seedDefaultsIfEmpty();
            $this->bootstrapDisplayDefaultsIfEmpty();
        } catch (\Throwable $e) {
            error_log('Coupon schema migration failed: ' . $e->getMessage());
        }
    }

    private function ensureDiscountTypeEnum() {
        try {
            $stmt = $this->db->query("SHOW COLUMNS FROM coupons LIKE 'discount_type'");
            $column = $stmt ? $stmt->fetch(PDO::FETCH_ASSOC) : null;
            $type = isset($column['Type']) ? (string)$column['Type'] : '';
            if (strpos($type, "'free_shipping'") === false || strpos($type, "'gift'") === false) {
                $this->db->exec("ALTER TABLE coupons MODIFY discount_type ENUM('fixed','percent','free_shipping','gift') NOT NULL DEFAULT 'fixed'");
            }
        } catch (\Throwable $e) {
            error_log('Coupon discount_type migration failed: ' . $e->getMessage());
        }
    }

    private function columnExists($table, $column) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = :table
              AND COLUMN_NAME = :column
        ");
        $stmt->execute([
            ':table' => (string)$table,
            ':column' => (string)$column,
        ]);
        return (int)$stmt->fetchColumn() > 0;
    }

    private function seedDefaultsIfEmpty() {
        $count = (int)$this->db->query("SELECT COUNT(*) FROM coupons")->fetchColumn();
        if ($count > 0) {
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO coupons (
                code, name, description, discount_type, discount_value, max_discount_amount,
                min_order_amount, usage_limit, per_customer_limit, show_on_home, show_in_cart,
                show_in_ai_advisor, display_title, display_label, badge_text, theme_color, icon_key, sort_order
            ) VALUES (
                :code, :name, :description, :discount_type, :discount_value, :max_discount_amount,
                :min_order_amount, :usage_limit, :per_customer_limit, :show_on_home, :show_in_cart,
                :show_in_ai_advisor, :display_title, :display_label, :badge_text, :theme_color, :icon_key, :sort_order
            )
        ");

        foreach ($this->defaultCoupons() as $coupon) {
            $stmt->execute([
                ':code' => $coupon[0],
                ':name' => $coupon[1],
                ':description' => $coupon[2],
                ':discount_type' => $coupon[3],
                ':discount_value' => $coupon[4],
                ':max_discount_amount' => $coupon[5],
                ':min_order_amount' => $coupon[6],
                ':usage_limit' => $coupon[7],
                ':per_customer_limit' => $coupon[8],
                ':show_on_home' => $coupon[9],
                ':show_in_cart' => $coupon[10],
                ':show_in_ai_advisor' => $coupon[11],
                ':display_title' => $coupon[12],
                ':display_label' => $coupon[13],
                ':badge_text' => $coupon[14],
                ':theme_color' => $coupon[15],
                ':icon_key' => $coupon[16],
                ':sort_order' => $coupon[17],
            ]);
        }
    }

    private function bootstrapDisplayDefaultsIfEmpty() {
        $count = (int)$this->db->query("
            SELECT COUNT(*) FROM coupons
            WHERE show_on_home = 1 OR show_in_cart = 1 OR show_in_ai_advisor = 1
        ")->fetchColumn();

        if ($count > 0) {
            return;
        }

        $stmt = $this->db->prepare("
            INSERT INTO coupons (
                code, name, description, discount_type, discount_value, max_discount_amount,
                min_order_amount, usage_limit, per_customer_limit, is_active, show_on_home,
                show_in_cart, show_in_ai_advisor, display_title, display_label, badge_text,
                theme_color, icon_key, sort_order
            ) VALUES (
                :code, :name, :description, :discount_type, :discount_value, :max_discount_amount,
                :min_order_amount, :usage_limit, :per_customer_limit, 1, :show_on_home,
                :show_in_cart, :show_in_ai_advisor, :display_title, :display_label, :badge_text,
                :theme_color, :icon_key, :sort_order
            )
            ON DUPLICATE KEY UPDATE
                is_active = 1,
                show_on_home = VALUES(show_on_home),
                show_in_cart = VALUES(show_in_cart),
                show_in_ai_advisor = VALUES(show_in_ai_advisor),
                display_title = VALUES(display_title),
                display_label = VALUES(display_label),
                badge_text = VALUES(badge_text),
                theme_color = VALUES(theme_color),
                icon_key = VALUES(icon_key),
                sort_order = VALUES(sort_order)
        ");

        foreach ($this->defaultCoupons() as $coupon) {
            $stmt->execute([
                ':code' => $coupon[0],
                ':name' => $coupon[1],
                ':description' => $coupon[2],
                ':discount_type' => $coupon[3],
                ':discount_value' => $coupon[4],
                ':max_discount_amount' => $coupon[5],
                ':min_order_amount' => $coupon[6],
                ':usage_limit' => $coupon[7],
                ':per_customer_limit' => $coupon[8],
                ':show_on_home' => $coupon[9],
                ':show_in_cart' => $coupon[10],
                ':show_in_ai_advisor' => $coupon[11],
                ':display_title' => $coupon[12],
                ':display_label' => $coupon[13],
                ':badge_text' => $coupon[14],
                ':theme_color' => $coupon[15],
                ':icon_key' => $coupon[16],
                ':sort_order' => $coupon[17],
            ]);
        }
    }

    private function defaultCoupons() {
        return [
            ['BOSS15', 'Giam 15%', 'Don toi thieu 400K. Toi da 50K.', 'percent', 15, 50000, 400000, 200, 1, 1, 1, 0, 'GIẢM 15%', 'HOT DEALS', 'Còn 2 ngày', 'sky', 'paw', 10],
            ['FREE30K', 'Freeship 30K', 'Giam 30K phi ship. Don tu 200K.', 'fixed', 30000, null, 200000, 300, 1, 1, 1, 0, 'FREESHIP', 'VẬN CHUYỂN', 'HSD: 30/06', 'indigo', 'truck', 20],
            ['NEWFRIEND', 'Giam 50K khach moi', 'Danh cho khach moi. Moi don hang.', 'fixed', 50000, null, 0, 200, 1, 1, 1, 0, 'GIẢM 50K', 'KHÁCH MỚI', 'Không thời hạn', 'amber', 'gift', 30],
            ['MEOWPATE', 'Tang pate', 'Mua 2 tang 1 pate meo cao cap.', 'gift', 0, null, 0, 100, 1, 1, 0, 0, 'TẶNG PATE', 'TẶNG QUÀ', 'Số lượng có hạn', 'rose', 'bone', 40],
            ['3F30K', 'Voucher AI 30K', 'Voucher tu van AI danh cho boss moi.', 'fixed', 30000, null, 0, 1000, 1, 0, 1, 1, 'GIẢM 30K', 'TƯ VẤN AI', 'AI Voucher', 'red', 'sparkles', 50],
        ];
    }

    private function buildCouponWhere($filters, &$params) {
        $where = [];

        if (isset($filters['isActive']) && $filters['isActive'] !== '' && $filters['isActive'] !== 'all') {
            $where[] = "is_active = :is_active";
            $params[':is_active'] = (int)$filters['isActive'];
        }

        if (!empty($filters['placement'])) {
            $column = $this->placementColumn($filters['placement']);
            if ($column !== null) {
                $where[] = "{$column} = 1";
            }
        }

        if (!empty($filters['q'])) {
            $where[] = "(code LIKE :q_code OR name LIKE :q_name OR description LIKE :q_description)";
            $keyword = '%' . trim($filters['q']) . '%';
            $params[':q_code'] = $keyword;
            $params[':q_name'] = $keyword;
            $params[':q_description'] = $keyword;
        }

        return $where;
    }

    public function listCoupons($filters = []) {
        $params = [];
        $where = $this->buildCouponWhere($filters, $params);

        $sql = "SELECT * FROM coupons";
        if (!empty($where)) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }
        $sql .= " ORDER BY sort_order ASC, id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return array_map([$this, 'mapCoupon'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function paginateCoupons($filters = [], $page = 1, $perPage = 10) {
        $page = max(1, (int)$page);
        $perPage = max(1, min(50, (int)$perPage));
        $offset = ($page - 1) * $perPage;

        $params = [];
        $where = $this->buildCouponWhere($filters, $params);
        $whereSql = !empty($where) ? " WHERE " . implode(" AND ", $where) : "";

        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM coupons{$whereSql}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();
        $totalPages = max(1, (int)ceil($total / $perPage));

        if ($page > $totalPages) {
            $page = $totalPages;
            $offset = ($page - 1) * $perPage;
        }

        $stmt = $this->db->prepare("
            SELECT * FROM coupons{$whereSql}
            ORDER BY sort_order ASC, id DESC
            LIMIT {$perPage} OFFSET {$offset}
        ");
        $stmt->execute($params);

        return [
            'items' => array_map([$this, 'mapCoupon'], $stmt->fetchAll(PDO::FETCH_ASSOC)),
            'meta' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'totalPages' => $totalPages,
            ],
        ];
    }

    public function listPublicCoupons($placement, $limit = 12) {
        $column = $this->placementColumn($placement);
        if ($column === null) {
            return [];
        }

        $now = date('Y-m-d H:i:s');
        $stmt = $this->db->prepare("
            SELECT * FROM coupons
            WHERE is_active = 1
              AND {$column} = 1
              AND (starts_at IS NULL OR starts_at <= :starts_now)
              AND (ends_at IS NULL OR ends_at >= :ends_now)
              AND (usage_limit IS NULL OR used_count < usage_limit)
            ORDER BY sort_order ASC, id DESC
            LIMIT " . max(1, min(50, (int)$limit))
        );
        $stmt->execute([
            ':starts_now' => $now,
            ':ends_now' => $now,
        ]);
        return array_map([$this, 'mapPublicCoupon'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function placementColumn($placement) {
        $map = [
            'home' => 'show_on_home',
            'cart' => 'show_in_cart',
            'ai' => 'show_in_ai_advisor',
        ];
        return isset($map[$placement]) ? $map[$placement] : null;
    }

    public function getCouponById($id) {
        $stmt = $this->db->prepare("SELECT * FROM coupons WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => (int)$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->mapCoupon($row) : null;
    }

    public function getCouponByCode($code) {
        $code = strtoupper(trim($code));
        $stmt = $this->db->prepare("
            SELECT * FROM coupons
            WHERE code = :code
            LIMIT 1
        ");
        $stmt->execute([':code' => $code]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function saveCoupon($data) {
        $id = isset($data['id']) && $data['id'] !== '' ? (int)$data['id'] : null;
        $payload = $this->normalizePayload($data);

        // --- BACKEND VALIDATION ---
        $errors = [];

        // 1. Code Validation
        $code = isset($payload[':code']) ? $payload[':code'] : '';
        if ($code === '') {
            $errors['code'] = "Vui lòng nhập mã voucher.";
        } else {
            if (!preg_match('/^[A-Z0-9_-]+$/', $code)) {
                $errors['code'] = "Mã voucher chỉ được gồm chữ in hoa, số, dấu gạch ngang hoặc gạch dưới.";
            }
            $len = strlen($code);
            if ($len < 4 || $len > 30) {
                $errors['code'] = "Mã voucher phải từ 4 đến 30 ký tự.";
            }

            if (empty($errors['code'])) {
                $stmtCheck = $this->db->prepare($id 
                    ? "SELECT id FROM coupons WHERE code = :code AND id != :id LIMIT 1" 
                    : "SELECT id FROM coupons WHERE code = :code LIMIT 1"
                );
                $params = [':code' => $code];
                if ($id) {
                    $params[':id'] = $id;
                }
                $stmtCheck->execute($params);
                if ($stmtCheck->fetch()) {
                    $errors['code'] = "Mã voucher đã tồn tại.";
                }
            }
        }

        // 2. Name Validation
        $name = isset($payload[':name']) ? $payload[':name'] : '';
        if ($name === '') {
            $errors['name'] = "Vui lòng nhập tên voucher.";
        }

        // 3. Discount Type & Value Validation
        $discountType = $payload[':discount_type'];
        $discountValue = $payload[':discount_value'];
        $maxDiscountAmount = $payload[':max_discount_amount'];

        if ($discountType === 'fixed') {
            if ($discountValue <= 0) {
                $errors['discount_value'] = "Giá trị giảm phải lớn hơn 0.";
            }
            $payload[':max_discount_amount'] = null;
        } elseif ($discountType === 'percent') {
            if ($discountValue < 1 || $discountValue > 100) {
                if ($discountValue <= 0) {
                    $errors['discount_value'] = "Phần trăm giảm phải lớn hơn 0.";
                } else {
                    $errors['discount_value'] = "Phần trăm giảm không được vượt quá 100%.";
                }
            }
            if ($maxDiscountAmount === null || $maxDiscountAmount <= 0) {
                $errors['max_discount_amount'] = "Voucher giảm theo phần trăm bắt buộc có mức giảm tối đa.";
            }
        } elseif ($discountType === 'free_shipping') {
            if ($maxDiscountAmount === null || $maxDiscountAmount <= 0) {
                $errors['max_discount_amount'] = "Voucher miễn phí vận chuyển cần có mức giảm phí vận chuyển tối đa.";
            }
        } elseif ($discountType === 'gift') {
            $isActive = $payload[':is_active'];
            if ($isActive === 1) {
                $errors['is_active'] = "Voucher tặng quà chưa được hỗ trợ áp dụng tự động. Vui lòng để trạng thái tắt hoặc cấu hình quà tặng.";
            }
        }

        // 4. Starts At & Ends At Timing Validation
        $startsAt = $payload[':starts_at'];
        $endsAt = $payload[':ends_at'];
        if ($startsAt === null) {
            $startsAt = date('Y-m-d H:i:s');
            $payload[':starts_at'] = $startsAt;
        }

        $noEndDate = !empty($data['noEndDate']) || !empty($data['no_end_date']);
        if ($noEndDate) {
            $payload[':ends_at'] = null;
        } else {
            if ($endsAt === null) {
                $errors['ends_at'] = "Vui lòng nhập ngày kết thúc hoặc chọn không giới hạn.";
            } elseif ($endsAt <= $startsAt) {
                $errors['ends_at'] = "Ngày kết thúc phải sau ngày bắt đầu.";
            }
        }

        // 5. Usage Limits Validation
        $usageLimit = $payload[':usage_limit'];
        $perCustomerLimit = $payload[':per_customer_limit'];

        if ($usageLimit !== null && $usageLimit < 1) {
            $errors['usage_limit'] = "Tổng lượt sử dụng phải lớn hơn hoặc bằng 1.";
        }
        if ($perCustomerLimit !== null && $perCustomerLimit < 1) {
            $errors['per_customer_limit'] = "Số lượt mỗi khách phải lớn hơn hoặc bằng 1.";
        }
        if ($usageLimit !== null && $perCustomerLimit !== null && $perCustomerLimit > $usageLimit) {
            $errors['per_customer_limit'] = "Số lượt mỗi khách không được lớn hơn tổng lượt sử dụng.";
        }

        if ($id) {
            $existing = $this->getCouponById($id);
            if ($existing) {
                $usedCount = (int)$existing['usedCount'];
                if ($usageLimit !== null && $usageLimit < $usedCount) {
                    $errors['usage_limit'] = "Tổng lượt sử dụng không được nhỏ hơn số lượt đã dùng ($usedCount lượt).";
                }
            }
        }

        // 6. Single AI Advisor Voucher Validation
        $showInAiAdvisor = $payload[':show_in_ai_advisor'];
        $isActive = $payload[':is_active'];
        if ($showInAiAdvisor === 1 && $isActive === 0) {
            $errors['show_in_ai_advisor'] = "Voucher Tư vấn AI phải được bật trạng thái hoạt động.";
        }

        if (!empty($errors)) {
            throw new \Exception(json_encode([
                "success" => false,
                "message" => "Dữ liệu voucher không hợp lệ.",
                "errors" => $errors
            ], JSON_UNESCAPED_UNICODE));
        }

        if ($id) {
            $payload[':id'] = $id;
            $this->db->prepare("
                UPDATE coupons SET
                    code = :code,
                    name = :name,
                    description = :description,
                    discount_type = :discount_type,
                    discount_value = :discount_value,
                    max_discount_amount = :max_discount_amount,
                    min_order_amount = :min_order_amount,
                    usage_limit = :usage_limit,
                    per_customer_limit = :per_customer_limit,
                    starts_at = :starts_at,
                    ends_at = :ends_at,
                    is_active = :is_active,
                    show_on_home = :show_on_home,
                    show_in_cart = :show_in_cart,
                    show_in_ai_advisor = :show_in_ai_advisor,
                    display_title = :display_title,
                    display_label = :display_label,
                    badge_text = :badge_text,
                    theme_color = :theme_color,
                    icon_key = :icon_key,
                    sort_order = :sort_order
                WHERE id = :id
            ")->execute($payload);
            $savedId = $id;
        } else {
            $this->db->prepare("
                INSERT INTO coupons (
                    code, name, description, discount_type, discount_value, max_discount_amount,
                    min_order_amount, usage_limit, per_customer_limit, starts_at, ends_at, is_active,
                    show_on_home, show_in_cart, show_in_ai_advisor, display_title, display_label,
                    badge_text, theme_color, icon_key, sort_order
                ) VALUES (
                    :code, :name, :description, :discount_type, :discount_value, :max_discount_amount,
                    :min_order_amount, :usage_limit, :per_customer_limit, :starts_at, :ends_at, :is_active,
                    :show_on_home, :show_in_cart, :show_in_ai_advisor, :display_title, :display_label,
                    :badge_text, :theme_color, :icon_key, :sort_order
                )
            ")->execute($payload);
            $savedId = (int)$this->db->lastInsertId();
        }

        if ($payload[':show_in_ai_advisor'] === 1) {
            $stmtClear = $this->db->prepare("UPDATE coupons SET show_in_ai_advisor = 0 WHERE id != :id");
            $stmtClear->execute([':id' => $savedId]);
        }

        return $savedId;
    }

    private function normalizePayload($data) {
        $code = strtoupper(trim((string)($data['code'] ?? '')));
        $name = trim((string)($data['name'] ?? ''));

        $discountType = (string)($data['discountType'] ?? $data['discount_type'] ?? 'fixed');
        if (!in_array($discountType, ['fixed', 'percent', 'free_shipping', 'gift'], true)) {
            $discountType = 'fixed';
        }
        $discountValue = (float)($data['discountValue'] ?? $data['discount_value'] ?? 0);
        $maxDiscountAmount = $this->nullableFloat($data['maxDiscountAmount'] ?? $data['max_discount_amount'] ?? null);
        $minOrderAmount = (float)($data['minOrderAmount'] ?? $data['min_order_amount'] ?? 0);
        $usageLimit = $this->nullableInt($data['usageLimit'] ?? $data['usage_limit'] ?? null);
        $perCustomerLimit = $this->nullableInt($data['perCustomerLimit'] ?? $data['per_customer_limit'] ?? null);
        $startsAt = $this->normalizeDate($data['startsAt'] ?? $data['starts_at'] ?? null);
        $endsAt = $this->normalizeDate($data['endsAt'] ?? $data['ends_at'] ?? null);
        $isActive = !empty($data['isActive']) || !empty($data['is_active']) ? 1 : 0;
        $showOnHome = !empty($data['showOnHome']) || !empty($data['show_on_home']) ? 1 : 0;
        $showInCart = !empty($data['showInCart']) || !empty($data['show_in_cart']) ? 1 : 0;
        $showInAiAdvisor = !empty($data['showInAiAdvisor']) || !empty($data['show_in_ai_advisor']) ? 1 : 0;

        // Auto-generation rules
        $displayTitle = $this->nullableString($data['displayTitle'] ?? $data['display_title'] ?? null);
        if ($displayTitle === null) {
            if ($discountType === 'fixed') {
                $displayTitle = 'GIẢM ' . number_format($discountValue, 0, ',', '.') . 'đ';
            } elseif ($discountType === 'percent') {
                $displayTitle = 'GIẢM ' . $discountValue . '%';
            } elseif ($discountType === 'free_shipping') {
                $displayTitle = 'FREESHIP';
            } elseif ($discountType === 'gift') {
                $displayTitle = 'TẶNG QUÀ';
            }
        }

        $displayLabel = $this->nullableString($data['displayLabel'] ?? $data['display_label'] ?? null);
        if ($displayLabel === null) {
            if ($showInAiAdvisor === 1) {
                $displayLabel = 'TƯ VẤN AI';
            } elseif ($showOnHome === 1) {
                $displayLabel = 'HOT DEALS';
            } else {
                $displayLabel = 'VOUCHER';
            }
        }

        $badgeText = $this->nullableString($data['badgeText'] ?? $data['badge_text'] ?? null);
        if ($badgeText === null && $showInAiAdvisor === 1) {
            $badgeText = 'AI Voucher';
        }

        $themeColor = $this->nullableString($data['themeColor'] ?? $data['theme_color'] ?? 'sky') ?: 'sky';
        if (!in_array($themeColor, ['sky', 'indigo', 'amber', 'rose', 'violet', 'teal', 'red'], true)) {
            $themeColor = 'sky';
        }

        $iconKey = $this->nullableString($data['iconKey'] ?? $data['icon_key'] ?? null);
        if ($iconKey === null) {
            if ($discountType === 'fixed' || $discountType === 'percent') {
                $iconKey = 'ticket';
            } elseif ($discountType === 'free_shipping') {
                $iconKey = 'truck';
            } elseif ($discountType === 'gift') {
                $iconKey = 'gift';
            } else {
                $iconKey = 'ticket';
            }
        }
        if (!in_array($iconKey, ['ticket', 'paw', 'truck', 'gift', 'bone', 'sparkles'], true)) {
            $iconKey = 'ticket';
        }

        $sortOrder = (int)($data['sortOrder'] ?? $data['sort_order'] ?? 0);
        if ($sortOrder < 0) {
            $sortOrder = 0;
        }

        return [
            ':code' => $code,
            ':name' => $name,
            ':description' => $this->nullableString($data['description'] ?? null),
            ':discount_type' => $discountType,
            ':discount_value' => $discountValue,
            ':max_discount_amount' => $maxDiscountAmount,
            ':min_order_amount' => $minOrderAmount,
            ':usage_limit' => $usageLimit,
            ':per_customer_limit' => $perCustomerLimit,
            ':starts_at' => $startsAt,
            ':ends_at' => $endsAt,
            ':is_active' => $isActive,
            ':show_on_home' => $showOnHome,
            ':show_in_cart' => $showInCart,
            ':show_in_ai_advisor' => $showInAiAdvisor,
            ':display_title' => $displayTitle,
            ':display_label' => $displayLabel,
            ':badge_text' => $badgeText,
            ':theme_color' => $themeColor,
            ':icon_key' => $iconKey,
            ':sort_order' => $sortOrder,
        ];
    }

    private function normalizeDate($value) {
        $value = trim((string)$value);
        if ($value === '') {
            return null;
        }
        return str_replace('T', ' ', substr($value, 0, 16)) . (strlen($value) <= 16 ? ':00' : '');
    }

    private function nullableString($value) {
        $value = trim((string)$value);
        return $value === '' ? null : $value;
    }

    private function nullableInt($value) {
        if ($value === null || $value === '') {
            return null;
        }
        return (int)$value;
    }

    private function nullableFloat($value) {
        if ($value === null || $value === '') {
            return null;
        }
        return (float)$value;
    }

    public function toggleActive($id, $isActive) {
        $stmt = $this->db->prepare("UPDATE coupons SET is_active = :active WHERE id = :id");
        $stmt->execute([':active' => (int)$isActive, ':id' => (int)$id]);
    }

    public function deleteCoupon($id) {
        $stmt = $this->db->prepare("DELETE FROM coupons WHERE id = :id");
        $stmt->execute([':id' => (int)$id]);
    }

    public function validateCoupon($code, $subtotal, $customerPhone = null) {
        $code = strtoupper(trim((string)$code));
        $coupon = $this->getCouponByCode($code);
        if (!$coupon) {
            $this->trackEvent(null, $code, 'apply_failed', $customerPhone, ['reason' => 'not_found']);
            return ["success" => false, "message" => "Mã giảm giá không tồn tại."];
        }

        if ((int)$coupon['is_active'] !== 1) {
            $this->trackEvent((int)$coupon['id'], $coupon['code'], 'apply_failed', $customerPhone, ['reason' => 'inactive']);
            return ["success" => false, "message" => "Mã giảm giá hiện đang tắt."];
        }

        $now = date('Y-m-d H:i:s');
        if (!empty($coupon['starts_at']) && $coupon['starts_at'] > $now) {
            $this->trackEvent((int)$coupon['id'], $coupon['code'], 'apply_failed', $customerPhone, ['reason' => 'not_started']);
            return ["success" => false, "message" => "Mã giảm giá chưa đến thời gian áp dụng."];
        }
        if (!empty($coupon['ends_at']) && $coupon['ends_at'] < $now) {
            $this->trackEvent((int)$coupon['id'], $coupon['code'], 'apply_failed', $customerPhone, ['reason' => 'expired']);
            return ["success" => false, "message" => "Mã giảm giá đã hết hạn."];
        }

        if ($subtotal < (float)$coupon['min_order_amount']) {
            $this->trackEvent((int)$coupon['id'], $coupon['code'], 'apply_failed', $customerPhone, ['reason' => 'min_order']);
            return ["success" => false, "message" => "Đơn hàng chưa đủ điều kiện áp dụng mã."];
        }

        if ($coupon['usage_limit'] !== null && (int)$coupon['used_count'] >= (int)$coupon['usage_limit']) {
            $this->trackEvent((int)$coupon['id'], $coupon['code'], 'apply_failed', $customerPhone, ['reason' => 'usage_limit']);
            return ["success" => false, "message" => "Mã giảm giá đã hết lượt sử dụng."];
        }

        if ($coupon['per_customer_limit'] !== null && !empty($customerPhone)) {
            $stmtUsages = $this->db->prepare("
                SELECT COUNT(*) AS cnt FROM coupon_usages
                WHERE coupon_id = :coupon_id AND customer_phone = :phone
            ");
            $stmtUsages->execute([
                ':coupon_id' => $coupon['id'],
                ':phone' => trim($customerPhone)
            ]);
            $userUsageCount = (int)($stmtUsages->fetch(PDO::FETCH_ASSOC)['cnt'] ?? 0);
            if ($userUsageCount >= (int)$coupon['per_customer_limit']) {
                $this->trackEvent((int)$coupon['id'], $coupon['code'], 'apply_failed', $customerPhone, ['reason' => 'per_customer_limit']);
                return ["success" => false, "message" => "Bạn đã sử dụng mã giảm giá này tối đa số lần cho phép."];
            }
        }

        $discountAmount = $this->calculateDiscount($coupon, $subtotal);
        $this->trackEvent((int)$coupon['id'], $coupon['code'], 'apply_success', $customerPhone, ['discount_amount' => $discountAmount]);

        return [
            "success" => true,
            "data" => [
                "id" => (int)$coupon['id'],
                "code" => $coupon['code'],
                "name" => $coupon['name'],
                "description" => $coupon['description'],
                "discountType" => $coupon['discount_type'],
                "discountValue" => (float)$coupon['discount_value'],
                "discountAmount" => $discountAmount
            ]
        ];
    }

    private function calculateDiscount($coupon, $subtotal) {
        $discountAmount = 0.00;
        $val = (float)$coupon['discount_value'];
        if ($coupon['discount_type'] === 'fixed' || $coupon['discount_type'] === 'free_shipping') {
            $discountAmount = min($val, $subtotal);
        } else if ($coupon['discount_type'] === 'percent') {
            $discountAmount = $subtotal * ($val / 100);
            if (!empty($coupon['max_discount_amount'])) {
                $discountAmount = min($discountAmount, (float)$coupon['max_discount_amount']);
            }
        }
        return max(0.00, min($discountAmount, $subtotal));
    }

    public function recordUsage($couponId, $orderId, $customerPhone, $discountAmount) {
        $stmt = $this->db->prepare("
            INSERT INTO coupon_usages (coupon_id, order_id, customer_phone, discount_amount)
            VALUES (:coupon_id, :order_id, :customer_phone, :discount_amount)
        ");
        $stmt->execute([
            ':coupon_id' => (int)$couponId,
            ':order_id' => (int)$orderId,
            ':customer_phone' => $customerPhone ? trim($customerPhone) : null,
            ':discount_amount' => (float)$discountAmount
        ]);

        $this->db->prepare("UPDATE coupons SET used_count = used_count + 1 WHERE id = :id")
            ->execute([':id' => (int)$couponId]);

        $coupon = $this->getCouponById($couponId);
        $this->trackEvent((int)$couponId, $coupon ? $coupon['code'] : '', 'redeem_order', $customerPhone, [
            'order_id' => (int)$orderId,
            'discount_amount' => (float)$discountAmount,
        ]);
    }

    public function trackEvent($couponId, $code, $eventType, $customerPhone = null, $metadata = []) {
        if (!in_array($eventType, ['view', 'copy', 'apply_success', 'apply_failed', 'redeem_order'], true)) {
            return;
        }
        try {
            $stmt = $this->db->prepare("
                INSERT INTO coupon_events (coupon_id, code, event_type, customer_phone, metadata_json)
                VALUES (:coupon_id, :code, :event_type, :customer_phone, :metadata_json)
            ");
            $stmt->execute([
                ':coupon_id' => $couponId ?: null,
                ':code' => strtoupper(trim((string)$code)),
                ':event_type' => $eventType,
                ':customer_phone' => $customerPhone ? trim($customerPhone) : null,
                ':metadata_json' => json_encode($metadata, JSON_UNESCAPED_UNICODE),
            ]);
        } catch (\Throwable $e) {
            error_log('Coupon event failed: ' . $e->getMessage());
        }
    }

    public function stats() {
        $row = $this->db->query("
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active,
                SUM(CASE WHEN ends_at IS NOT NULL AND ends_at < NOW() THEN 1 ELSE 0 END) AS expired,
                SUM(used_count) AS used,
                SUM(CASE WHEN show_on_home = 1 THEN 1 ELSE 0 END) AS home,
                SUM(CASE WHEN show_in_cart = 1 THEN 1 ELSE 0 END) AS cart,
                SUM(CASE WHEN show_in_ai_advisor = 1 THEN 1 ELSE 0 END) AS ai
            FROM coupons
        ")->fetch(PDO::FETCH_ASSOC);

        $events = [];
        try {
            $stmt = $this->db->query("SELECT event_type, COUNT(*) AS total FROM coupon_events GROUP BY event_type");
            foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $event) {
                $events[$event['event_type']] = (int)$event['total'];
            }
        } catch (\Throwable $e) {}

        return [
            'total' => (int)($row['total'] ?? 0),
            'active' => (int)($row['active'] ?? 0),
            'expired' => (int)($row['expired'] ?? 0),
            'used' => (int)($row['used'] ?? 0),
            'home' => (int)($row['home'] ?? 0),
            'cart' => (int)($row['cart'] ?? 0),
            'ai' => (int)($row['ai'] ?? 0),
            'events' => $events,
        ];
    }

    private function mapCoupon($row) {
        return [
            'id' => (int)$row['id'],
            'code' => $row['code'],
            'name' => $row['name'],
            'description' => $row['description'],
            'discountType' => $row['discount_type'],
            'discountValue' => (float)$row['discount_value'],
            'maxDiscountAmount' => $row['max_discount_amount'] !== null ? (float)$row['max_discount_amount'] : null,
            'minOrderAmount' => (float)$row['min_order_amount'],
            'usageLimit' => $row['usage_limit'] !== null ? (int)$row['usage_limit'] : null,
            'usedCount' => (int)$row['used_count'],
            'perCustomerLimit' => $row['per_customer_limit'] !== null ? (int)$row['per_customer_limit'] : null,
            'startsAt' => $row['starts_at'],
            'endsAt' => $row['ends_at'],
            'isActive' => (int)$row['is_active'],
            'showOnHome' => (int)($row['show_on_home'] ?? 0),
            'showInCart' => (int)($row['show_in_cart'] ?? 0),
            'showInAiAdvisor' => (int)($row['show_in_ai_advisor'] ?? 0),
            'displayTitle' => $row['display_title'] ?: $row['name'],
            'displayLabel' => $row['display_label'],
            'badgeText' => $row['badge_text'],
            'themeColor' => $row['theme_color'] ?: 'sky',
            'iconKey' => $row['icon_key'] ?: 'ticket',
            'sortOrder' => (int)($row['sort_order'] ?? 0),
            'createdAt' => $row['created_at'] ?? null,
            'updatedAt' => $row['updated_at'] ?? null,
        ];
    }

    private function mapPublicCoupon($row) {
        $coupon = $this->mapCoupon($row);
        return [
            'id' => $coupon['id'],
            'code' => $coupon['code'],
            'title' => $coupon['displayTitle'],
            'name' => $coupon['name'],
            'description' => $coupon['description'],
            'label' => $coupon['displayLabel'],
            'badgeText' => $coupon['badgeText'],
            'themeColor' => $coupon['themeColor'],
            'iconKey' => $coupon['iconKey'],
            'discountType' => $coupon['discountType'],
            'discountValue' => $coupon['discountValue'],
            'maxDiscountAmount' => $coupon['maxDiscountAmount'],
            'minOrderAmount' => $coupon['minOrderAmount'],
            'endsAt' => $coupon['endsAt'],
            'usageLimit' => $coupon['usageLimit'],
            'usedCount' => $coupon['usedCount'],
        ];
    }
}
