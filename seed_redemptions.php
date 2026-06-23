<?php
// Init DB
class MiniDB {
    private static $instance = null;
    private $connection;
    private function __construct() {
        $host = 'localhost';
        $db = '3f';
        $user = '3f_user';
        $pass = '0932368720Ab';
        $this->connection = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
        $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new MiniDB();
        }
        return self::$instance;
    }
    public function getConnection() {
        return $this->connection;
    }
}

try {
    $db = MiniDB::getInstance()->getConnection();

    // Delete garbage redemptions
    $db->exec("DELETE FROM loyalty_reward_redemptions WHERE customer_phone = '0901234567'");

    // Find reward IDs
    $rewards = $db->query("SELECT id FROM loyalty_rewards LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);

    if (count($rewards) >= 1) {
        $id1 = $rewards[0]['id'];
        $id2 = $rewards[1]['id'] ?? $id1;
        $id3 = $rewards[2]['id'] ?? $id1;

        // Insert realistic redemptions
        $sql = "INSERT INTO loyalty_reward_redemptions (customer_phone, customer_name, reward_id, points_spent, status, note, created_at) VALUES 
        ('0912345678', 'Trần Hữu Kiên', $id1, 500, 'pending', 'Khách hàng đổi điểm', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
        ('0987654321', 'Lê Thị Thu Thảo', $id2, 300, 'approved', 'Đã duyệt yêu cầu, chờ giao hàng', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
        ('0933445566', 'Phạm Minh Đức', $id3, 1000, 'fulfilled', 'Đã giao quà tận nơi', DATE_SUB(NOW(), INTERVAL 1 DAY)),
        ('0909112233', 'Vũ Anh Tuấn', $id1, 500, 'rejected', 'Từ chối do tài khoản có dấu hiệu gian lận', DATE_SUB(NOW(), INTERVAL 2 DAY))
        ";
        
        $db->exec($sql);
        echo "Inserted realistic redemptions successfully.\n";
    } else {
        echo "No rewards found to link redemptions to.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
