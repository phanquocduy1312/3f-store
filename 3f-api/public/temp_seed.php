<?php
require 'index.php';
$db = \App\Core\Database::getInstance()->getConnection();
$rewards = $db->query("SELECT id, name, reward_type FROM loyalty_rewards")->fetchAll(PDO::FETCH_ASSOC);
echo "REWARDS:\n";
print_r($rewards);

$redemptions = $db->query("SELECT id, customer_name, customer_phone FROM loyalty_reward_redemptions")->fetchAll(PDO::FETCH_ASSOC);
echo "\nREDEMPTIONS:\n";
print_r($redemptions);
