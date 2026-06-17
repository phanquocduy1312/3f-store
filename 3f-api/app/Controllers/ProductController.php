<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\ProductCatalogService;
use Exception;

class ProductController {
    public function list() {
        try {
            $service = new ProductCatalogService();
            $data = $service->listProducts([
                'q' => Request::query('q'),
                'category' => Request::query('category'),
                'petType' => Request::query('petType'),
                'productType' => Request::query('productType'),
                'minPrice' => Request::query('minPrice'),
                'maxPrice' => Request::query('maxPrice'),
                'page' => Request::query('page', 1),
                'limit' => Request::query('limit', 24),
                'sort' => Request::query('sort', 'newest')
            ]);

            Response::json(["success" => true, "data" => $data], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Product list error: " . $e->getMessage()], 500);
        }
    }

    public function detail() {
        $slug = trim((string)Request::query('slug', ''));
        $id = trim((string)Request::query('id', ''));
        $sourceProductId = trim((string)Request::query('sourceProductId', ''));

        if ($slug === '' && $id === '' && $sourceProductId === '') {
            Response::json(["success" => false, "message" => "Missing product slug or id."], 400);
        }

        try {
            $service = new ProductCatalogService();
            if ($slug !== '') {
                $data = $service->detail($slug, 'slug');
            } elseif ($sourceProductId !== '') {
                $data = $service->detail($sourceProductId, 'source_product_id');
            } else {
                $data = $service->detail($id, 'id');
            }

            if (!$data) {
                Response::json(["success" => false, "message" => "Product not found."], 404);
            }

            Response::json(["success" => true, "data" => $data], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Product detail error: " . $e->getMessage()], 500);
        }
    }

    public function categories() {
        try {
            $service = new ProductCatalogService();
            Response::json(["success" => true, "data" => $service->listCategories()], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Product categories error: " . $e->getMessage()], 500);
        }
    }

    public function adminList() {
        try {
            $service = new ProductCatalogService();
            $data = $service->listProducts([
                'admin' => true,
                'q' => Request::query('q'),
                'category' => Request::query('category'),
                'petType' => Request::query('petType'),
                'productType' => Request::query('productType'),
                'minPrice' => Request::query('minPrice'),
                'maxPrice' => Request::query('maxPrice'),
                'page' => Request::query('page', 1),
                'limit' => Request::query('limit', 24),
                'sort' => Request::query('sort', 'newest')
            ]);

            Response::json(["success" => true, "data" => $data], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Admin product list error: " . $e->getMessage()], 500);
        }
    }

    public function adminDetail() {
        $id = trim((string)Request::query('id', ''));
        $slug = trim((string)Request::query('slug', ''));
        if ($id === '' && $slug === '') {
            Response::json(["success" => false, "message" => "Missing product id."], 400);
        }

        try {
            $service = new ProductCatalogService();
            $data = $id !== '' ? $service->adminDetail($id, 'id') : $service->adminDetail($slug, 'slug');
            if (!$data) {
                Response::json(["success" => false, "message" => "Product not found."], 404);
            }
            Response::json(["success" => true, "data" => $data], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Admin product detail error: " . $e->getMessage()], 500);
        }
    }

    public function adminSave() {
        $input = Request::json();
        if (empty($input['id'])) {
            Response::json(["success" => false, "message" => "Missing product id."], 400);
        }

        try {
            $success = (new ProductCatalogService())->save($input);
            Response::json([
                "success" => (bool)$success,
                "message" => $success ? "Product saved." : "No product fields were updated."
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Admin product save error: " . $e->getMessage()], 500);
        }
    }

    public function adminToggleActive() {
        $input = Request::json();
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if ($id <= 0) {
            Response::json(["success" => false, "message" => "Missing product id."], 400);
        }

        $isActive = isset($input['isActive']) ? (int)$input['isActive'] : 0;
        try {
            $success = (new ProductCatalogService())->toggleActive($id, $isActive);
            Response::json([
                "success" => (bool)$success,
                "message" => $isActive === 1 ? "Product activated." : "Product deactivated."
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Admin product toggle error: " . $e->getMessage()], 500);
        }
    }
}
