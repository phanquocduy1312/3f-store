<?php
namespace App\Services;

use Exception;
use PDO;

class InventoryService {
    /**
     * Atomically reserves stock for list of order items
     */
    public static function reserveStock($db, $items, $orderCode) {
        foreach ($items as $item) {
            $productId = (int)$item['product_id'];
            $variantId = isset($item['variant_id']) ? (int)$item['variant_id'] : 0;
            $quantity = (int)$item['quantity'];

            if ($variantId > 0) {
                // 1. Lock and read variant row
                $stmt = $db->prepare("
                    SELECT stock_quantity, reserved_stock, variant_name 
                    FROM product_variants 
                    WHERE id = :id 
                    FOR UPDATE
                ");
                $stmt->execute([':id' => $variantId]);
                $variant = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$variant) {
                    throw new Exception("Không tìm thấy phân loại sản phẩm ID {$variantId}.");
                }

                $available = $variant['stock_quantity'] - $variant['reserved_stock'];
                if ($available < $quantity) {
                    throw new Exception("Sản phẩm '{$variant['variant_name']}' không đủ tồn kho (còn lại {$available}, yêu cầu {$quantity}).");
                }

                // 2. Update variant reserved stock
                $update = $db->prepare("
                    UPDATE product_variants 
                    SET reserved_stock = reserved_stock + :qty 
                    WHERE id = :id
                ");
                $update->execute([':qty' => $quantity, ':id' => $variantId]);

                // 3. Update main product reserved stock
                $updateProduct = $db->prepare("
                    UPDATE products 
                    SET reserved_stock = reserved_stock + :qty 
                    WHERE id = :id
                ");
                $updateProduct->execute([':qty' => $quantity, ':id' => $productId]);

                // 4. Log transaction
                self::logTransaction($db, $productId, $variantId, 'reserve_order', $quantity, $variant['stock_quantity'], $variant['stock_quantity'], 'order', $orderCode, "Giữ kho cho đơn hàng {$orderCode}");
            } else {
                // Lock and read product row (if product has no variants)
                $stmt = $db->prepare("
                    SELECT total_stock, reserved_stock, name 
                    FROM products 
                    WHERE id = :id 
                    FOR UPDATE
                ");
                $stmt->execute([':id' => $productId]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$product) {
                    throw new Exception("Không tìm thấy sản phẩm ID {$productId}.");
                }

                $available = $product['total_stock'] - $product['reserved_stock'];
                if ($available < $quantity) {
                    throw new Exception("Sản phẩm '{$product['name']}' không đủ tồn kho (còn lại {$available}, yêu cầu {$quantity}).");
                }

                // Update product reserved stock
                $updateProduct = $db->prepare("
                    UPDATE products 
                    SET reserved_stock = reserved_stock + :qty 
                    WHERE id = :id
                ");
                $updateProduct->execute([':qty' => $quantity, ':id' => $productId]);

                self::logTransaction($db, $productId, null, 'reserve_order', $quantity, $product['total_stock'], $product['total_stock'], 'order', $orderCode, "Giữ kho cho đơn hàng {$orderCode}");
            }
        }
    }

    /**
     * Atomically releases reserved stock (e.g. order cancelled)
     */
    public static function releaseStock($db, $items, $orderCode) {
        foreach ($items as $item) {
            $productId = (int)$item['product_id'];
            $variantId = isset($item['variant_id']) ? (int)$item['variant_id'] : 0;
            $quantity = (int)$item['quantity'];

            if ($variantId > 0) {
                $stmt = $db->prepare("SELECT stock_quantity, reserved_stock FROM product_variants WHERE id = :id FOR UPDATE");
                $stmt->execute([':id' => $variantId]);
                $variant = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($variant) {
                    // Update variant reserved stock (capped at 0)
                    $update = $db->prepare("
                        UPDATE product_variants 
                        SET reserved_stock = GREATEST(0, CAST(reserved_stock AS SIGNED) - :qty) 
                        WHERE id = :id
                    ");
                    $update->execute([':qty' => $quantity, ':id' => $variantId]);

                    $updateProduct = $db->prepare("
                        UPDATE products 
                        SET reserved_stock = GREATEST(0, CAST(reserved_stock AS SIGNED) - :qty) 
                        WHERE id = :id
                    ");
                    $updateProduct->execute([':qty' => $quantity, ':id' => $productId]);

                    self::logTransaction($db, $productId, $variantId, 'release_order', -$quantity, $variant['stock_quantity'], $variant['stock_quantity'], 'order', $orderCode, "Giải phóng kho cho đơn hàng {$orderCode} (hủy đơn)");
                }
            } else {
                $stmt = $db->prepare("SELECT total_stock, reserved_stock FROM products WHERE id = :id FOR UPDATE");
                $stmt->execute([':id' => $productId]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($product) {
                    $updateProduct = $db->prepare("
                        UPDATE products 
                        SET reserved_stock = GREATEST(0, CAST(reserved_stock AS SIGNED) - :qty) 
                        WHERE id = :id
                    ");
                    $updateProduct->execute([':qty' => $quantity, ':id' => $productId]);

                    self::logTransaction($db, $productId, null, 'release_order', -$quantity, $product['total_stock'], $product['total_stock'], 'order', $orderCode, "Giải phóng kho cho đơn hàng {$orderCode} (hủy đơn)");
                }
            }
        }
    }

    /**
     * Atomically fulfills stock (e.g. order completed)
     */
    public static function fulfillStock($db, $items, $orderCode) {
        foreach ($items as $item) {
            $productId = (int)$item['product_id'];
            $variantId = isset($item['variant_id']) ? (int)$item['variant_id'] : 0;
            $quantity = (int)$item['quantity'];

            if ($variantId > 0) {
                $stmt = $db->prepare("SELECT stock_quantity, reserved_stock FROM product_variants WHERE id = :id FOR UPDATE");
                $stmt->execute([':id' => $variantId]);
                $variant = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($variant) {
                    $qtyBefore = $variant['stock_quantity'];
                    $qtyAfter = max(0, $qtyBefore - $quantity);

                    // Update variant stock and reserved stock
                    $update = $db->prepare("
                        UPDATE product_variants 
                        SET stock_quantity = :qty_after, 
                            reserved_stock = GREATEST(0, CAST(reserved_stock AS SIGNED) - :qty) 
                        WHERE id = :id
                    ");
                    $update->execute([
                        ':qty_after' => $qtyAfter,
                        ':qty' => $quantity,
                        ':id' => $variantId
                    ]);

                    // Update main product totals and sold count
                    $updateProduct = $db->prepare("
                        UPDATE products 
                        SET total_stock = GREATEST(0, CAST(total_stock AS SIGNED) - ?),
                            reserved_stock = GREATEST(0, CAST(reserved_stock AS SIGNED) - ?),
                            sold_count = sold_count + ?
                        WHERE id = ?
                    ");
                    $updateProduct->execute([$quantity, $quantity, $quantity, $productId]);

                    self::logTransaction($db, $productId, $variantId, 'fulfill_order', -$quantity, $qtyBefore, $qtyAfter, 'order', $orderCode, "Hoàn tất xuất kho đơn hàng {$orderCode}");
                }
            } else {
                $stmt = $db->prepare("SELECT total_stock, reserved_stock FROM products WHERE id = :id FOR UPDATE");
                $stmt->execute([':id' => $productId]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($product) {
                    $qtyBefore = $product['total_stock'];
                    $qtyAfter = max(0, $qtyBefore - $quantity);

                    $updateProduct = $db->prepare("
                        UPDATE products 
                        SET total_stock = ?,
                            reserved_stock = GREATEST(0, CAST(reserved_stock AS SIGNED) - ?),
                            sold_count = sold_count + ?
                        WHERE id = ?
                    ");
                    $updateProduct->execute([$qtyAfter, $quantity, $quantity, $productId]);

                    self::logTransaction($db, $productId, null, 'fulfill_order', -$quantity, $qtyBefore, $qtyAfter, 'order', $orderCode, "Hoàn tất xuất kho đơn hàng {$orderCode}");
                }
            }
        }
    }

    private static function logTransaction($db, $productId, $variantId, $type, $change, $before, $after, $refType, $refId, $note) {
        $stmt = $db->prepare("
            INSERT INTO inventory_transactions (
                product_id, variant_id, transaction_type, quantity_change, 
                quantity_before, quantity_after, reference_type, reference_id, note, created_by
            ) VALUES (
                :product_id, :variant_id, :type, :change, 
                :before, :after, :ref_type, :ref_id, :note, 'system'
            )
        ");
        $stmt->execute([
            ':product_id' => $productId,
            ':variant_id' => $variantId ?: null,
            ':type' => $type,
            ':change' => $change,
            ':before' => $before,
            ':after' => $after,
            ':ref_type' => $refType,
            ':ref_id' => $refId,
            ':note' => $note
        ]);
    }
}
