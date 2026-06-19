<?php
require_once __DIR__ . "/../app/Core/Database.php";
require_once __DIR__ . "/../config/config.php";
require_once __DIR__ . "/../app/Models/Customer.php";

try {
    $customerModel = new \App\Models\Customer();
    $res = $customerModel->adminPaginateCustomers(["page"=>1, "limit"=>10, "status"=>"all", "tier"=>"all", "phoneVerified"=>"all", "hasOrders"=>"all"]);
    echo "SUCCESS: " . json_encode($res);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}

