<?php
namespace App\Services;

use App\Models\Product;

class ProductCatalogService {
    private $model;

    public function __construct() {
        $this->model = new Product();
    }

    public function listProducts($filters = []) {
        $result = $this->model->listProducts($filters);
        $result['items'] = array_map([$this, 'mapProductItem'], $result['items']);
        return $result;
    }

    public function listCategories() {
        return array_map(function ($row) {
            return [
                'id' => (int)$row['id'],
                'parentId' => $row['parent_id'] !== null ? (int)$row['parent_id'] : null,
                'name' => $row['name'],
                'slug' => $row['slug'],
                'description' => $row['description'],
                'imageUrl' => $row['image_url'],
                'sortOrder' => (int)$row['sort_order'],
                'isActive' => (int)$row['is_active'] === 1,
                'parentName' => $row['parent_name'] ?? null
            ];
        }, $this->model->listCategories(true));
    }

    public function detail($identifier, $field = 'slug') {
        $row = $this->model->getProductDetail($identifier, $field);
        return $row ? $this->mapProductDetail($row) : null;
    }

    public function adminDetail($identifier, $field = 'id') {
        $row = $this->model->getProductDetail($identifier, $field);
        return $row ? $this->mapProductDetail($row, true) : null;
    }

    public function save($payload) {
        return $this->model->saveProduct($payload);
    }

    public function toggleActive($id, $isActive) {
        return $this->model->toggleActive($id, $isActive);
    }

    private function mapProductItem($row) {
        return [
            'id' => (int)$row['id'],
            'sourceProductId' => $row['source_product_id'],
            'sourcePlatform' => $row['source_platform'],
            'sourceSellerId' => $row['source_seller_id'],
            'sourceProductUrl' => $row['source_product_url'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'shortDescription' => $row['short_description'],
            'brand' => $row['brand'],
            'mainImageUrl' => $row['main_image_url'],
            'imageUrls' => $this->decodeJsonArray($row['image_urls_json']),
            'minPrice' => (float)$row['min_price'],
            'maxPrice' => (float)$row['max_price'],
            'price' => $this->formatPrice((float)$row['min_price']),
            'oldPrice' => null,
            'currency' => $row['currency'],
            'totalStock' => (int)$row['total_stock'],
            'soldCount' => (int)$row['sold_count'],
            'ratingAverage' => (float)$row['rating_average'],
            'reviewCount' => (int)$row['review_count'],
            'categoryId' => $row['category_id'] !== null ? (int)$row['category_id'] : null,
            'categoryName' => $row['category_name'],
            'categorySlug' => $row['category_slug'],
            'petType' => $row['pet_type'],
            'productType' => $row['product_type'],
            'hasVariants' => (int)($row['variant_count'] ?? 0) > 0,
            'variantCount' => (int)($row['variant_count'] ?? 0),
            'isActive' => (int)$row['is_active'] === 1,
            'isFeatured' => (int)$row['is_featured'] === 1,
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at']
        ];
    }

    private function mapProductDetail($row, $includeAdmin = false) {
        $item = $this->mapProductItem($row);
        $variants = array_map([$this, 'mapVariant'], $row['variants'] ?? []);
        $images = array_map([$this, 'mapImage'], $row['images'] ?? []);

        $item['description'] = $row['description'];
        $item['images'] = $images;
        $item['variants'] = $variants;
        $item['options'] = $this->buildOptions($variants);

        if ($includeAdmin) {
            $item['sourceFile'] = $row['source_file'];
            $item['isImported'] = (int)$row['is_imported'] === 1;
            $item['importedAt'] = $row['imported_at'];
        }

        return $item;
    }

    private function mapVariant($row) {
        return [
            'id' => (int)$row['id'],
            'productId' => (int)$row['product_id'],
            'sourceSkuId' => $row['source_sku_id'],
            'sourceProductId' => $row['source_product_id'],
            'sku' => $row['sku'],
            'variantName' => $row['variant_name'],
            'label' => $row['variant_name'],
            'option1Name' => $row['option_1_name'],
            'option1Value' => $row['option_1_value'],
            'option2Name' => $row['option_2_name'],
            'option2Value' => $row['option_2_value'],
            'option3Name' => $row['option_3_name'],
            'option3Value' => $row['option_3_value'],
            'attributes' => $this->decodeJsonArray($row['attributes_json']),
            'price' => (float)$row['price'],
            'priceText' => $this->formatPrice((float)$row['price']),
            'originalPrice' => $row['original_price'] !== null ? (float)$row['original_price'] : null,
            'oldPriceText' => $row['original_price'] !== null ? $this->formatPrice((float)$row['original_price']) : null,
            'currency' => $row['currency'],
            'stockQuantity' => (int)$row['stock_quantity'],
            'reservedStock' => (int)$row['reserved_stock'],
            'warehouseId' => $row['warehouse_id'],
            'imageUrl' => $row['image_url'],
            'variantImageStatus' => $row['variant_image_status'],
            'isActive' => (int)$row['is_active'] === 1
        ];
    }

    private function mapImage($row) {
        return [
            'id' => (int)$row['id'],
            'productId' => (int)$row['product_id'],
            'variantId' => $row['variant_id'] !== null ? (int)$row['variant_id'] : null,
            'imageUrl' => $row['image_url'],
            'localImagePath' => $row['local_image_path'],
            'imageType' => $row['image_type'],
            'isMain' => (int)$row['is_main'] === 1,
            'sortOrder' => (int)$row['sort_order']
        ];
    }

    private function buildOptions($variants) {
        $options = [];
        foreach ($variants as $variant) {
            $pairs = [
                [$variant['option1Name'] ?? null, $variant['option1Value'] ?? null],
                [$variant['option2Name'] ?? null, $variant['option2Value'] ?? null],
                [$variant['option3Name'] ?? null, $variant['option3Value'] ?? null],
            ];
            foreach ($pairs as $pair) {
                [$name, $value] = $pair;
                if (!$name || !$value) continue;
                if (!isset($options[$name])) {
                    $options[$name] = [];
                }
                if (!in_array($value, $options[$name], true)) {
                    $options[$name][] = $value;
                }
            }
        }

        return array_map(function ($name, $values) {
            return ['name' => $name, 'values' => $values];
        }, array_keys($options), array_values($options));
    }

    private function decodeJsonArray($value) {
        if (!$value) return [];
        $decoded = json_decode($value, true);
        return is_array($decoded) ? $decoded : [];
    }

    private function formatPrice($value) {
        return number_format($value, 0, ',', '.') . 'đ';
    }
}
