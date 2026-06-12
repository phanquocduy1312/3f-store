<?php
namespace App\Services;

class PointService {
    /**
     * Calculates Shopee points based on the order amount.
     * Formula: 10,000 VND = 1 point.
     */
    public static function calculateShopeePoints($orderAmount) {
        return (int)floor((int)$orderAmount / 10000);
    }

    /**
     * Computes the member tier based on approved points.
     */
    public static function calculateMemberTier($points) {
        $pts = (int)$points;
        if ($pts < 500) {
            return "Silver";
        } elseif ($pts < 1500) {
            return "Gold";
        } else {
            return "Platinum";
        }
    }
}
