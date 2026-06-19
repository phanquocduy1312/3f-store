<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$db = new \PDO('mysql:host=' . $_ENV['DB_HOST'] . ';dbname=' . $_ENV['DB_DATABASE'], $_ENV['DB_USERNAME'], $_ENV['DB_PASSWORD']);
$db->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

$sql = "
    SELECT 
        c.id, c.name, c.is_active,
        (SELECT COUNT(*) FROM product_categories child WHERE child.parent_id = c.id) AS children_count
    FROM product_categories c
";
$stmt = $this->db->query($sql);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($rows);
