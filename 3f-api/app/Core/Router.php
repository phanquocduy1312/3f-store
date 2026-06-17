<?php
namespace App\Core;

class Router {
    private $routes = [];

    /**
     * Normalizes a route path to always have a leading slash and no trailing slash
     */
    private function normalizePath($path) {
        $path = '/' . trim($path, '/');
        return $path === '/' ? '/' : rtrim($path, '/');
    }

    /**
     * Registers a GET route.
     */
    public function get($path, $handler) {
        $this->routes['GET'][$this->normalizePath($path)] = $handler;
    }

    /**
     * Registers a POST route.
     */
    public function post($path, $handler) {
        $this->routes['POST'][$this->normalizePath($path)] = $handler;
    }

    /**
     * Resolves the request and runs the corresponding handler.
     */
    public function dispatch() {
        $method = Request::method();
        $routeQuery = Request::query('route');
        $path = '';

        // Handle URL fallback parameters (e.g. ?route=admin.shopee.request_list)
        if ($routeQuery !== null) {
            $mapping = [
                'shopee.order_scan'           => '/api/shopee/order-scan',
                'shopee.request_create'       => '/api/shopee/requests',
                'admin.shopee.request_list'   => '/api/admin/shopee/requests',
                'admin.shopee.request_detail' => '/api/admin/shopee/requests/detail',
                'admin.shopee.request_approve'=> '/api/admin/shopee/requests/approve',
                'admin.shopee.request_reject' => '/api/admin/shopee/requests/reject',
                'customer.points'             => '/api/customer/points',
                'products'                    => '/api/products',
                'products.detail'             => '/api/products/detail',
                'product_categories'          => '/api/product-categories',
                'admin.products'              => '/api/admin/products',
                'admin.products_detail'       => '/api/admin/products/detail',
                'admin.products_save'         => '/api/admin/products/save',
                'admin.products_toggle_active'=> '/api/admin/products/toggle-active',
                'admin.shopee.auth_url'       => '/api/admin/shopee/auth-url',
                'shopee.callback'             => '/api/shopee/callback',
                'admin.shopee.conn_status'    => '/api/admin/shopee/connection-status',
                'admin.shopee.request_verify' => '/api/admin/shopee/requests/verify',
                'admin.shopee.request_verify_bulk' => '/api/admin/shopee/requests/verify-bulk',
                'admin.loyalty.point_rules'   => '/api/admin/loyalty/point-rules',
                'admin.loyalty.point_rules_update' => '/api/admin/loyalty/point-rules/update',
                'admin.loyalty.point_rules_deactivate' => '/api/admin/loyalty/point-rules/deactivate',
                'admin.loyalty.calculate_preview' => '/api/admin/loyalty/calculate-preview',
                'admin.loyalty.rewards'       => '/api/admin/loyalty/rewards',
                'admin.loyalty.rewards_upload_image' => '/api/admin/loyalty/rewards/upload-image',
                'admin.loyalty.rewards_update'=> '/api/admin/loyalty/rewards/update',
                'admin.loyalty.rewards_deactivate' => '/api/admin/loyalty/rewards/deactivate',
                'loyalty.rewards'             => '/api/loyalty/rewards',
                'loyalty.redeem'              => '/api/loyalty/rewards/redeem',
                'admin.loyalty.redemptions'   => '/api/admin/loyalty/redemptions',
                'admin.loyalty.redemptions_approve' => '/api/admin/loyalty/redemptions/approve',
                'admin.loyalty.redemptions_reject' => '/api/admin/loyalty/redemptions/reject',
                'admin.loyalty.redemptions_fulfill' => '/api/admin/loyalty/redemptions/fulfill',
                'admin.loyalty.transactions'  => '/api/admin/loyalty/transactions',
                'loyalty.transactions'        => '/api/loyalty/transactions',
                'admin.loyalty.voucher_pool'  => '/api/admin/loyalty/voucher-pool',
                'admin.loyalty.voucher_pool_import' => '/api/admin/loyalty/voucher-pool/import',
                'admin.loyalty.tiers'         => '/api/admin/loyalty/tiers',
                'admin.loyalty.tiers_save'    => '/api/admin/loyalty/tiers/save',
                'admin.loyalty.tiers_active'  => '/api/admin/loyalty/tiers/active',
                'admin.loyalty.tiers_preview' => '/api/admin/loyalty/tiers/preview',
                'admin.loyalty.campaigns'     => '/api/admin/loyalty/campaigns',
                'admin.loyalty.campaigns_save'=> '/api/admin/loyalty/campaigns/save',
                'admin.loyalty.campaigns_active'=> '/api/admin/loyalty/campaigns/active',
                'admin.loyalty.preview_points'=> '/api/admin/loyalty/preview-points',
                'admin.loyalty.analytics'     => '/api/admin/loyalty/analytics',
                'admin.customers.loyalty'     => '/api/admin/customers/loyalty',
                'customer.tier'               => '/api/customer/tier',
                'customer.rewards_history'    => '/api/customer/rewards/history'
            ];
            $path = isset($mapping[$routeQuery]) ? $mapping[$routeQuery] : '';
        } else {
            // Read clean REQUEST_URI
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            
            // Remove base directory if running from a subfolder
            $scriptName = $_SERVER['SCRIPT_NAME'];
            $baseDir = dirname($scriptName);
            
            if (strpos($uri, $baseDir) === 0) {
                $path = substr($uri, strlen($baseDir));
            } else {
                $path = $uri;
            }

            // Normalize path for consistent matching
            $path = $this->normalizePath($path);
        }

        if (!isset($this->routes[$method][$path])) {
            Response::json(["success" => false, "message" => "Route not found: {$method} {$path}"], 404);
        }

        $handler = $this->routes[$method][$path];
        $controllerClass = $handler[0];
        $action = $handler[1];

        if (!class_exists($controllerClass)) {
            Response::json(["success" => false, "message" => "Controller class {$controllerClass} not found"], 500);
        }

        $controller = new $controllerClass();
        if (!method_exists($controller, $action)) {
            Response::json(["success" => false, "message" => "Action {$action} not found in controller {$controllerClass}"], 500);
        }

        $controller->$action();
    }
}
