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
                'admin.shopee.auth_url'       => '/api/admin/shopee/auth-url',
                'shopee.callback'             => '/api/shopee/callback',
                'admin.shopee.conn_status'    => '/api/admin/shopee/connection-status'
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
