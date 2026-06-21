<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Helpers\AuthMiddleware;
use Exception;
use PDO;

class WorkflowController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Helper to verify admin auth
     */
    private function checkAuth() {
        return AuthMiddleware::requireAdmin();
    }

    /**
     * System critical status keys
     */
    private function isCriticalStatus($statusKey) {
        $critical = ['completed', 'cancelled', 'paid', 'refunded', 'credited'];
        return in_array($statusKey, $critical, true);
    }

    /**
     * GET /api/admin/workflows/statuses
     */
    public function listStatuses() {
        try {
            $this->checkAuth();
            $stmt = $this->db->query("SELECT * FROM workflow_statuses ORDER BY group_key, sort_order, id");
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Convert types safely
            foreach ($items as &$item) {
                $item['id'] = (int)$item['id'];
                $item['sort_order'] = (int)$item['sort_order'];
                $item['is_active'] = (int)$item['is_active'];
                $item['is_default'] = (int)$item['is_default'];
                $item['is_terminal'] = (int)$item['is_terminal'];
            }

            Response::json(["success" => true, "data" => $items], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/workflows/statuses/save
     */
    public function saveStatus() {
        try {
            $this->checkAuth();
            $input = Request::json();
            $id = isset($input['id']) ? (int)$input['id'] : 0;
            $groupKey = trim($input['group_key'] ?? '');
            $statusKey = trim($input['status_key'] ?? '');
            $label = trim($input['label'] ?? '');
            $description = trim($input['description'] ?? '');
            $color = trim($input['color'] ?? '');
            $sortOrder = isset($input['sort_order']) ? (int)$input['sort_order'] : 0;
            $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;
            $isDefault = isset($input['is_default']) ? (int)$input['is_default'] : 0;
            $isTerminal = isset($input['is_terminal']) ? (int)$input['is_terminal'] : 0;

            if ($groupKey === '' || $statusKey === '' || $label === '') {
                Response::json(["success" => false, "message" => "Thiếu thông tin bắt buộc (group_key, status_key, label)."], 400);
                return;
            }

            if ($id > 0) {
                // Fetch current status to check protection
                $stmtCheck = $this->db->prepare("SELECT status_key, group_key FROM workflow_statuses WHERE id = :id");
                $stmtCheck->execute([':id' => $id]);
                $current = $stmtCheck->fetch(PDO::FETCH_ASSOC);

                if (!$current) {
                    Response::json(["success" => false, "message" => "Không tìm thấy trạng thái cần cập nhật."], 404);
                    return;
                }

                if ($this->isCriticalStatus($current['status_key'])) {
                    // Block renaming key or group
                    if ($current['status_key'] !== $statusKey || $current['group_key'] !== $groupKey) {
                        Response::json(["success" => false, "message" => "Không thể đổi tên status_key hoặc group_key của trạng thái hệ thống."], 400);
                        return;
                    }
                }

                $sql = "UPDATE workflow_statuses 
                        SET group_key = :group_key, status_key = :status_key, label = :label, 
                            description = :description, color = :color, sort_order = :sort_order, 
                            is_active = :is_active, is_default = :is_default, is_terminal = :is_terminal
                        WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([
                    ':group_key' => $groupKey,
                    ':status_key' => $statusKey,
                    ':label' => $label,
                    ':description' => $description,
                    ':color' => $color,
                    ':sort_order' => $sortOrder,
                    ':is_active' => $isActive,
                    ':is_default' => $isDefault,
                    ':is_terminal' => $isTerminal,
                    ':id' => $id
                ]);
            } else {
                // Unique key check
                $stmtCheckUnique = $this->db->prepare("SELECT id FROM workflow_statuses WHERE group_key = :group_key AND status_key = :status_key");
                $stmtCheckUnique->execute([':group_key' => $groupKey, ':status_key' => $statusKey]);
                if ($stmtCheckUnique->fetch()) {
                    Response::json(["success" => false, "message" => "Trạng thái này đã tồn tại trong nhóm này."], 400);
                    return;
                }

                $sql = "INSERT INTO workflow_statuses (group_key, status_key, label, description, color, sort_order, is_active, is_default, is_terminal) 
                        VALUES (:group_key, :status_key, :label, :description, :color, :sort_order, :is_active, :is_default, :is_terminal)";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([
                    ':group_key' => $groupKey,
                    ':status_key' => $statusKey,
                    ':label' => $label,
                    ':description' => $description,
                    ':color' => $color,
                    ':sort_order' => $sortOrder,
                    ':is_active' => $isActive,
                    ':is_default' => $isDefault,
                    ':is_terminal' => $isTerminal
                ]);
            }

            Response::json(["success" => true, "message" => "Lưu trạng thái thành công."], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/workflows/statuses/delete
     */
    public function deleteStatus() {
        try {
            $this->checkAuth();
            $input = Request::json();
            $id = isset($input['id']) ? (int)$input['id'] : 0;

            if ($id <= 0) {
                Response::json(["success" => false, "message" => "Thiếu ID trạng thái."], 400);
                return;
            }

            $stmtCheck = $this->db->prepare("SELECT status_key FROM workflow_statuses WHERE id = :id");
            $stmtCheck->execute([':id' => $id]);
            $row = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                Response::json(["success" => false, "message" => "Không tìm thấy trạng thái."], 404);
                return;
            }

            if ($this->isCriticalStatus($row['status_key'])) {
                Response::json(["success" => false, "message" => "Không thể xóa trạng thái hệ thống: " . $row['status_key']], 400);
                return;
            }

            $stmtDel = $this->db->prepare("DELETE FROM workflow_statuses WHERE id = :id");
            $stmtDel->execute([':id' => $id]);

            Response::json(["success" => true, "message" => "Xóa trạng thái thành công."], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/admin/workflows/transitions
     */
    public function listTransitions() {
        try {
            $this->checkAuth();
            $stmt = $this->db->query("SELECT * FROM workflow_transitions ORDER BY group_key, sort_order, id");
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($items as &$item) {
                $item['id'] = (int)$item['id'];
                $item['requires_reason'] = (int)$item['requires_reason'];
                $item['is_active'] = (int)$item['is_active'];
                $item['sort_order'] = (int)$item['sort_order'];
            }

            Response::json(["success" => true, "data" => $items], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/workflows/transitions/save
     */
    public function saveTransition() {
        try {
            $this->checkAuth();
            $input = Request::json();
            $id = isset($input['id']) ? (int)$input['id'] : 0;
            $groupKey = trim($input['group_key'] ?? '');
            $fromStatus = trim($input['from_status'] ?? '');
            $toStatus = trim($input['to_status'] ?? '');
            $label = trim($input['label'] ?? '');
            $requiresReason = isset($input['requires_reason']) ? (int)$input['requires_reason'] : 0;
            $requiresPermission = isset($input['requires_permission']) ? trim($input['requires_permission']) : null;
            $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;
            $sortOrder = isset($input['sort_order']) ? (int)$input['sort_order'] : 0;

            if ($groupKey === '' || $fromStatus === '' || $toStatus === '' || $label === '') {
                Response::json(["success" => false, "message" => "Thiếu thông tin bắt buộc (group_key, from_status, to_status, label)."], 400);
                return;
            }

            if ($id > 0) {
                $sql = "UPDATE workflow_transitions 
                        SET group_key = :group_key, from_status = :from_status, to_status = :to_status, 
                            label = :label, requires_reason = :requires_reason, requires_permission = :requires_permission, 
                            is_active = :is_active, sort_order = :sort_order
                        WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([
                    ':group_key' => $groupKey,
                    ':from_status' => $fromStatus,
                    ':to_status' => $toStatus,
                    ':label' => $label,
                    ':requires_reason' => $requiresReason,
                    ':requires_permission' => $requiresPermission !== '' ? $requiresPermission : null,
                    ':is_active' => $isActive,
                    ':sort_order' => $sortOrder,
                    ':id' => $id
                ]);
            } else {
                // Unique check
                $stmtCheck = $this->db->prepare("SELECT id FROM workflow_transitions WHERE group_key = :group_key AND from_status = :from_status AND to_status = :to_status");
                $stmtCheck->execute([
                    ':group_key' => $groupKey,
                    ':from_status' => $fromStatus,
                    ':to_status' => $toStatus
                ]);
                if ($stmtCheck->fetch()) {
                    Response::json(["success" => false, "message" => "Quy trình chuyển đổi trạng thái này đã tồn tại."], 400);
                    return;
                }

                $sql = "INSERT INTO workflow_transitions (group_key, from_status, to_status, label, requires_reason, requires_permission, is_active, sort_order) 
                        VALUES (:group_key, :from_status, :to_status, :label, :requires_reason, :requires_permission, :is_active, :sort_order)";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([
                    ':group_key' => $groupKey,
                    ':from_status' => $fromStatus,
                    ':to_status' => $toStatus,
                    ':label' => $label,
                    ':requires_reason' => $requiresReason,
                    ':requires_permission' => $requiresPermission !== '' ? $requiresPermission : null,
                    ':is_active' => $isActive,
                    ':sort_order' => $sortOrder
                ]);
            }

            Response::json(["success" => true, "message" => "Lưu quy trình chuyển đổi thành công."], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/workflows/transitions/delete
     */
    public function deleteTransition() {
        try {
            $this->checkAuth();
            $input = Request::json();
            $id = isset($input['id']) ? (int)$input['id'] : 0;

            if ($id <= 0) {
                Response::json(["success" => false, "message" => "Thiếu ID quy trình."], 400);
                return;
            }

            $stmtDel = $this->db->prepare("DELETE FROM workflow_transitions WHERE id = :id");
            $stmtDel->execute([':id' => $id]);

            Response::json(["success" => true, "message" => "Xóa quy trình thành công."], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/admin/workflows/automation-rules
     */
    public function listAutomationRules() {
        try {
            $this->checkAuth();
            $stmt = $this->db->query("SELECT * FROM automation_rules ORDER BY id DESC");
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($items as &$item) {
                $item['id'] = (int)$item['id'];
                $item['is_active'] = (int)$item['is_active'];
                $item['conditions'] = $item['conditions_json'] ? json_decode($item['conditions_json'], true) : null;
                $item['actions'] = $item['actions_json'] ? json_decode($item['actions_json'], true) : [];
            }

            Response::json(["success" => true, "data" => $items], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/workflows/automation-rules/save
     */
    public function saveAutomationRule() {
        try {
            $this->checkAuth();
            $input = Request::json();
            $id = isset($input['id']) ? (int)$input['id'] : 0;
            $name = trim($input['name'] ?? '');
            $triggerType = trim($input['trigger_type'] ?? '');
            $triggerGroup = isset($input['trigger_group']) ? trim($input['trigger_group']) : null;
            $fromStatus = isset($input['from_status']) ? trim($input['from_status']) : null;
            $toStatus = isset($input['to_status']) ? trim($input['to_status']) : null;
            
            $conditionsVal = isset($input['conditions']) ? $input['conditions'] : null;
            $actionsVal = isset($input['actions']) ? $input['actions'] : [];
            $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

            if ($name === '' || $triggerType === '' || empty($actionsVal)) {
                Response::json(["success" => false, "message" => "Thiếu thông tin bắt buộc (name, trigger_type, actions)."], 400);
                return;
            }

            $conditionsJson = $conditionsVal ? json_encode($conditionsVal, JSON_UNESCAPED_UNICODE) : null;
            $actionsJson = json_encode($actionsVal, JSON_UNESCAPED_UNICODE);

            if ($id > 0) {
                $sql = "UPDATE automation_rules 
                        SET name = :name, trigger_type = :trigger_type, trigger_group = :trigger_group, 
                            from_status = :from_status, to_status = :to_status, 
                            conditions_json = :conditions_json, actions_json = :actions_json, is_active = :is_active
                        WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([
                    ':name' => $name,
                    ':trigger_type' => $triggerType,
                    ':trigger_group' => $triggerGroup !== '' ? $triggerGroup : null,
                    ':from_status' => $fromStatus !== '' ? $fromStatus : null,
                    ':to_status' => $toStatus !== '' ? $toStatus : null,
                    ':conditions_json' => $conditionsJson,
                    ':actions_json' => $actionsJson,
                    ':is_active' => $isActive,
                    ':id' => $id
                ]);
            } else {
                $sql = "INSERT INTO automation_rules (name, trigger_type, trigger_group, from_status, to_status, conditions_json, actions_json, is_active) 
                        VALUES (:name, :trigger_type, :trigger_group, :from_status, :to_status, :conditions_json, :actions_json, :is_active)";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([
                    ':name' => $name,
                    ':trigger_type' => $triggerType,
                    ':trigger_group' => $triggerGroup !== '' ? $triggerGroup : null,
                    ':from_status' => $fromStatus !== '' ? $fromStatus : null,
                    ':to_status' => $toStatus !== '' ? $toStatus : null,
                    ':conditions_json' => $conditionsJson,
                    ':actions_json' => $actionsJson,
                    ':is_active' => $isActive
                ]);
            }

            Response::json(["success" => true, "message" => "Lưu luật tự động thành công."], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/workflows/automation-rules/delete
     */
    public function deleteAutomationRule() {
        try {
            $this->checkAuth();
            $input = Request::json();
            $id = isset($input['id']) ? (int)$input['id'] : 0;

            if ($id <= 0) {
                Response::json(["success" => false, "message" => "Thiếu ID luật tự động."], 400);
                return;
            }

            $stmtDel = $this->db->prepare("DELETE FROM automation_rules WHERE id = :id");
            $stmtDel->execute([':id' => $id]);

            Response::json(["success" => true, "message" => "Xóa luật tự động thành công."], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/admin/workflows/shipping-providers
     */
    public function listShippingProviders() {
        try {
            $this->checkAuth();
            $stmt = $this->db->query("SELECT * FROM shipping_providers ORDER BY sort_order, id");
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($items as &$item) {
                $item['id'] = (int)$item['id'];
                $item['is_active'] = (int)$item['is_active'];
                $item['sort_order'] = (int)$item['sort_order'];
                $item['config'] = $item['config_json'] ? json_decode($item['config_json'], true) : null;
            }

            Response::json(["success" => true, "data" => $items], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/workflows/shipping-providers/save
     */
    public function saveShippingProvider() {
        try {
            $this->checkAuth();
            $input = Request::json();
            $id = isset($input['id']) ? (int)$input['id'] : 0;
            $providerKey = trim($input['provider_key'] ?? '');
            $label = trim($input['label'] ?? '');
            $type = trim($input['type'] ?? 'manual');
            $configVal = isset($input['config']) ? $input['config'] : null;
            $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;
            $sortOrder = isset($input['sort_order']) ? (int)$input['sort_order'] : 0;

            if ($providerKey === '' || $label === '') {
                Response::json(["success" => false, "message" => "Thiếu thông tin bắt buộc (provider_key, label)."], 400);
                return;
            }

            $configJson = $configVal ? json_encode($configVal, JSON_UNESCAPED_UNICODE) : null;

            if ($id > 0) {
                $sql = "UPDATE shipping_providers 
                        SET provider_key = :provider_key, label = :label, type = :type, 
                            config_json = :config_json, is_active = :is_active, sort_order = :sort_order
                        WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([
                    ':provider_key' => $providerKey,
                    ':label' => $label,
                    ':type' => $type,
                    ':config_json' => $configJson,
                    ':is_active' => $isActive,
                    ':sort_order' => $sortOrder,
                    ':id' => $id
                ]);
            } else {
                // Unique check
                $stmtCheck = $this->db->prepare("SELECT id FROM shipping_providers WHERE provider_key = :provider_key");
                $stmtCheck->execute([':provider_key' => $providerKey]);
                if ($stmtCheck->fetch()) {
                    Response::json(["success" => false, "message" => "Nhà vận chuyển này đã tồn tại."], 400);
                    return;
                }

                $sql = "INSERT INTO shipping_providers (provider_key, label, type, config_json, is_active, sort_order) 
                        VALUES (:provider_key, :label, :type, :config_json, :is_active, :sort_order)";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([
                    ':provider_key' => $providerKey,
                    ':label' => $label,
                    ':type' => $type,
                    ':config_json' => $configJson,
                    ':is_active' => $isActive,
                    ':sort_order' => $sortOrder
                ]);
            }

            Response::json(["success" => true, "message" => "Lưu nhà vận chuyển thành công."], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/workflows/shipping-providers/delete
     */
    public function deleteShippingProvider() {
        try {
            $this->checkAuth();
            $input = Request::json();
            $id = isset($input['id']) ? (int)$input['id'] : 0;

            if ($id <= 0) {
                Response::json(["success" => false, "message" => "Thiếu ID nhà vận chuyển."], 400);
                return;
            }

            $stmtDel = $this->db->prepare("DELETE FROM shipping_providers WHERE id = :id");
            $stmtDel->execute([':id' => $id]);

            Response::json(["success" => true, "message" => "Xóa nhà vận chuyển thành công."], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/admin/workflows/notification-channels
     */
    public function listNotificationChannels() {
        try {
            $this->checkAuth();
            $stmt = $this->db->query("SELECT * FROM notification_channels ORDER BY id");
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($items as &$item) {
                $item['id'] = (int)$item['id'];
                $item['is_active'] = (int)$item['is_active'];
                $item['config'] = $item['config_json'] ? json_decode($item['config_json'], true) : null;
            }

            Response::json(["success" => true, "data" => $items], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/workflows/notification-channels/save
     */
    public function saveNotificationChannel() {
        try {
            $this->checkAuth();
            $input = Request::json();
            $id = isset($input['id']) ? (int)$input['id'] : 0;
            $channelKey = trim($input['channel_key'] ?? '');
            $label = trim($input['label'] ?? '');
            $provider = trim($input['provider'] ?? '');
            $configVal = isset($input['config']) ? $input['config'] : null;
            $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

            if ($channelKey === '' || $label === '') {
                Response::json(["success" => false, "message" => "Thiếu thông tin bắt buộc (channel_key, label)."], 400);
                return;
            }

            $configJson = $configVal ? json_encode($configVal, JSON_UNESCAPED_UNICODE) : null;

            if ($id > 0) {
                $sql = "UPDATE notification_channels 
                        SET channel_key = :channel_key, label = :label, provider = :provider, 
                            config_json = :config_json, is_active = :is_active
                        WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([
                    ':channel_key' => $channelKey,
                    ':label' => $label,
                    ':provider' => $provider,
                    ':config_json' => $configJson,
                    ':is_active' => $isActive,
                    ':id' => $id
                ]);
            } else {
                // Unique check
                $stmtCheck = $this->db->prepare("SELECT id FROM notification_channels WHERE channel_key = :channel_key");
                $stmtCheck->execute([':channel_key' => $channelKey]);
                if ($stmtCheck->fetch()) {
                    Response::json(["success" => false, "message" => "Kênh thông báo này đã tồn tại."], 400);
                    return;
                }

                $sql = "INSERT INTO notification_channels (channel_key, label, provider, config_json, is_active) 
                        VALUES (:channel_key, :label, :provider, :config_json, :is_active)";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([
                    ':channel_key' => $channelKey,
                    ':label' => $label,
                    ':provider' => $provider,
                    ':config_json' => $configJson,
                    ':is_active' => $isActive
                ]);
            }

            Response::json(["success" => true, "message" => "Lưu kênh thông báo thành công."], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/workflows/notification-channels/delete
     */
    public function deleteNotificationChannel() {
        try {
            $this->checkAuth();
            $input = Request::json();
            $id = isset($input['id']) ? (int)$input['id'] : 0;

            if ($id <= 0) {
                Response::json(["success" => false, "message" => "Thiếu ID kênh thông báo."], 400);
                return;
            }

            $stmtDel = $this->db->prepare("DELETE FROM notification_channels WHERE id = :id");
            $stmtDel->execute([':id' => $id]);

            Response::json(["success" => true, "message" => "Xóa kênh thông báo thành công."], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/admin/orders/:id/allowed-transitions
     */
    public function orderAllowedTransitions($params) {
        try {
            $this->checkAuth();
            $orderId = isset($params['id']) ? (int)$params['id'] : 0;

            if ($orderId <= 0) {
                Response::json(["success" => false, "message" => "Thiếu ID đơn hàng."], 400);
                return;
            }

            $stmt = $this->db->prepare("SELECT order_status, payment_status, shipping_status, loyalty_status FROM orders WHERE id = :id");
            $stmt->execute([':id' => $orderId]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                Response::json(["success" => false, "message" => "Không tìm thấy đơn hàng."], 404);
                return;
            }

            $currents = [
                'order' => $order['order_status'],
                'payment' => $order['payment_status'],
                'shipping' => $order['shipping_status'] ?: 'no_shipment',
                'loyalty' => $order['loyalty_status'] ?: 'not_earned',
            ];

            // Fetch allowed transitions
            $transitions = [];
            foreach ($currents as $group => $currentStatus) {
                $stmtTrans = $this->db->prepare("
                    SELECT t.*, s.label as to_status_label, s.color as to_status_color 
                    FROM workflow_transitions t
                    JOIN workflow_statuses s ON t.group_key = s.group_key AND t.to_status = s.status_key
                    WHERE t.group_key = :group_key 
                      AND t.from_status = :from_status 
                      AND t.is_active = 1
                      AND s.is_active = 1
                    ORDER BY t.sort_order, t.id
                ");
                $stmtTrans->execute([
                    ':group_key' => $group,
                    ':from_status' => $currentStatus
                ]);
                $rows = $stmtTrans->fetchAll(PDO::FETCH_ASSOC);
                foreach ($rows as &$r) {
                    $r['id'] = (int)$r['id'];
                    $r['requires_reason'] = (int)$r['requires_reason'];
                    $r['is_active'] = (int)$r['is_active'];
                    $r['sort_order'] = (int)$r['sort_order'];
                }
                $transitions[$group] = $rows;
            }

            Response::json(["success" => true, "data" => $transitions], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }
}
